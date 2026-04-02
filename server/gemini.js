import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;
function getClient() {
  if (!genAI) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY is not set');
    genAI = new GoogleGenerativeAI(key);
  }
  return genAI;
}

/**
 * 口コミ・店舗情報から 雰囲気・客層・コンセプト・強み を抽出し、既定フォーマットのJSONで返す
 */
export async function analyzePlace(placeName, address, category, reviewsText) {
  const model = getClient().getGenerativeModel({ model: 'gemini-2.5-flash' });
  const text = reviewsText.slice(0, 8000);
  const prompt = `あなたは店舗分析の専門家です。以下の店舗情報と口コミをもとに、JSONのみで回答してください。他は書かず、有効なJSONだけを返してください。

【店舗名】${placeName}
【住所】${address}
【カテゴリ】${category}
【口コミ（抜粋）】
${text || '（口コミなし）'}

次のキーを持つJSONオブジェクトを1つ返してください：
- atmosphere: 雰囲気（短文）
- targetAudience: 客層（短文）
- concept: コンセプト（1〜2文）。**その店のオーナー・スタッフが自店を説明する文体**で書く。「当店は〜」「私たちは〜」など一人称で。第三者による紹介やレビュー調（「〜と評判」「高評価」）は使わない。
- strengths: 強み（箇条書きまたは短文、複数可）。**店の人が自店の良さを伝える文体**で書く。紹介文・レビュー調（「〜と称される」「高評価」）は避け、当店では〜、私たちは〜、といった訴求文にする。
- conceptId: 以下のいずれか1つ（小文字英数字のみ） cafe | restaurant | salon | retail | apparel | service | clinic | general`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const raw = (response.text() || '').trim();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Gemini did not return valid JSON');
  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('Failed to parse Gemini JSON');
  }
  return {
    atmosphere: parsed.atmosphere || '',
    targetAudience: parsed.targetAudience || '',
    concept: parsed.concept || '',
    strengths: typeof parsed.strengths === 'string' ? parsed.strengths : (parsed.strengths || []).join('\n'),
    conceptId: ['cafe', 'restaurant', 'salon', 'retail', 'apparel', 'service', 'clinic', 'general'].includes(parsed.conceptId) ? parsed.conceptId : 'general',
  };
}

/**
 * 私からその店に送るDM本文を1通生成する。
 * 「行ったことはないが口コミ等で評価が高く、ウェブがないのはもったいないから勝手に作った」趣旨。
 * 訪れたと誤解される表現は使わない。
 */
export async function generateDmBody(placeName, concept, strengths) {
  const model = getClient().getGenerativeModel({ model: 'gemini-2.5-flash' });
  const prompt = `あなたは、ウェブサイトのないお店に「勝手にランディングページを作成した」ことを伝えるDMの文面を書く人です。

【送り手】あなた（作成者） → 【受け手】お店（店舗オーナー）

以下の店舗向けに、DM本文を1通だけ作成してください。

【必須の趣旨】
- 作成者はその店に**行ったことがない**ことを前提に書く。「訪れた」「うかがった」「先日貴店で」など、行ったと誤解される表現は一切使わない。
- 口コミや評判で「評価が高く、こんなに素晴らしいお店がウェブページを持っていないのはもったいない」と感じたから、勝手にLPを作った、という流れにする。
- その店の「コンセプト」「強み」を具体的に盛り込み、ページではその魅力をこういう形で表現した、と伝える。店ごとに内容がまったく違う文章にすること。

【文体・制約】
- 挨拶から入り、簡潔に（250字程度）。改行は適宜入れてください。
- HTML・マークダウンは使わず、プレーンテキストのみ。

店舗名: ${placeName}
コンセプト: ${concept}
強み: ${strengths}`;
  const result = await model.generateContent(prompt);
  const text = (result.response.text() || '').trim();
  return text;
}

/**
 * HTMLの断片からデザイン特徴（色・フォント・レイアウト）を抽出する。参照サイト学習用。
 */
export async function extractDesignFromHtml(htmlSnippet) {
  if (!htmlSnippet || htmlSnippet.length < 50) {
    return { summary: '', colors: [], fonts: '', layout: '' };
  }
  const model = getClient().getGenerativeModel({ model: 'gemini-2.5-flash' });
  const truncated = htmlSnippet.slice(0, 12000);
  const prompt = `以下はウェブページのHTMLの一部です。<style>やインラインスタイル、class名から、デザインの特徴を読み取ってください。

【HTML断片】
${truncated}

次のキーを持つJSONオブジェクトを1つだけ返してください。他は書かず有効なJSONのみ。
- summary: デザインの特徴を1〜2文で（色・フォント・レイアウトの印象）。
- colors: 主に使われていそうな色を配列で（例: ["#fff", "#333", "暖色の背景"]）。最大5個。
- fonts: フォントの傾向（例: ゴシック体、セリフ、丸ゴシック）。
- layout: レイアウトの傾向（例: 1カラム・中央寄せ、ヒーロー大画像、カード並び）。`;
  try {
    const result = await model.generateContent(prompt);
    const raw = (result.response.text() || '').trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { summary: raw.slice(0, 300), colors: [], fonts: '', layout: '' };
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      summary: typeof parsed.summary === 'string' ? parsed.summary.slice(0, 500) : '',
      colors: Array.isArray(parsed.colors) ? parsed.colors.slice(0, 5) : [],
      fonts: typeof parsed.fonts === 'string' ? parsed.fonts.slice(0, 200) : '',
      layout: typeof parsed.layout === 'string' ? parsed.layout.slice(0, 200) : '',
    };
  } catch {
    return { summary: '', colors: [], fonts: '', layout: '' };
  }
}

/**
 * 参照サイト一覧（ウェブあり・上位表示の店）をもとに、
 * 「なぜ上位表示されているか」を文言・デザイン両方で言語化する。テンプレート設計の参考用。
 */
export async function analyzeReferenceSites(referenceSites) {
  if (!referenceSites || referenceSites.length === 0) {
    return { summary: '', byCategory: {}, designSummary: '', byCategoryDesign: {} };
  }
  const model = getClient().getGenerativeModel({ model: 'gemini-2.5-flash' });
  const list = referenceSites
    .slice(0, 50)
    .map((r) => {
      const text = `- ${r.name}（${r.category}）順位目安: ${r.rankIndex ?? '?'}\n  title: ${r.title || '（未取得）'}\n  description: ${r.metaDescription || '（未取得）'}`;
      const design = r.designTraits && (r.designTraits.summary || r.designTraits.colors?.length)
        ? `\n  デザイン: ${r.designTraits.summary || ''} 色: ${(r.designTraits.colors || []).join(', ')} フォント: ${r.designTraits.fonts || ''} レイアウト: ${r.designTraits.layout || ''}`
        : '';
      return text + design;
    })
    .join('\n');
  const prompt = `あなたはSEO・ランディングページ設計の専門家です。以下は、Googleマップで上位に表示されている「ウェブサイトを持っている店」の一覧です（タイトル・メタ説明・デザイン特徴を含む）。

【参照サイト一覧】
${list}

この一覧を踏まえ、次の4つを日本語でまとめてください。数が増えるほど傾向は言語化しやすくなります。
1) 全体の傾向（文言）：タイトル・説明文の長さ・キーワード・訴求の共通点を3〜5点で。
2) 業種・カテゴリ別の傾向（文言）：カテゴリごとに、その業種でよく見られる文言のパターンを1〜2文ずつ。
3) 全体の傾向（デザイン）：色・フォント・レイアウト・余白など、デザインの共通項を3〜5点で。
4) 業種・カテゴリ別の傾向（デザイン）：カテゴリごとに、その業種でよく見られるデザインのパターンを1〜2文ずつ。

JSONで返してください。キーは summary, byCategory, designSummary, byCategoryDesign。各キーは文字列またはオブジェクト。他は書かず有効なJSONのみ。`;
  const result = await model.generateContent(prompt);
  const raw = (result.response.text() || '').trim();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { summary: raw.slice(0, 2000), byCategory: {}, designSummary: '', byCategoryDesign: {} };
  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      summary: typeof parsed.summary === 'string' ? parsed.summary : '',
      byCategory: parsed.byCategory && typeof parsed.byCategory === 'object' ? parsed.byCategory : {},
      designSummary: typeof parsed.designSummary === 'string' ? parsed.designSummary : '',
      byCategoryDesign: parsed.byCategoryDesign && typeof parsed.byCategoryDesign === 'object' ? parsed.byCategoryDesign : {},
    };
  } catch {
    return { summary: raw.slice(0, 2000), byCategory: {}, designSummary: '', byCategoryDesign: {} };
  }
}

/**
 * 画像/PDF/テキストからテンプレ編集用 override を抽出する（JSONのみ）
 * @param {{mimeType:string,data:string,name?:string}[]} files
 * @param {string} textContext
 */
export async function extractTemplateOverrideFromDocuments(files, textContext = '') {
  const model = getClient().getGenerativeModel({ model: 'gemini-2.5-flash' });
  const usable = Array.isArray(files) ? files.filter((f) => f && f.mimeType && f.data).slice(0, 4) : [];
  const text = String(textContext || '').trim().slice(0, 16000);
  if (!usable.length && !text) throw new Error('no input');

  const prompt = `あなたはWeb制作の入力補助AIです。添付の画像/PDFおよび追加入力テキストから店舗情報を抽出し、以下のJSONスキーマで返してください。
必ずJSONオブジェクト1つのみを返し、説明文は書かないこと。
不明項目は空文字または空配列にしてください。推測しすぎないこと。

{
  "nameSuggestion": "ドラフト名候補（任意）",
  "override": {
    "siteName": "",
    "title": "",
    "headline": "",
    "subheadline": "",
    "footerAddress": "",
    "footerPhone": "",
    "faqItems": [{"q":"", "a":""}],
    "cafeMenuTextRows": [{"groupLabel":"", "name":"", "price":"", "description":"", "badge":""}],
    "cafeMeo": {
      "servesCuisine": "",
      "priceRange": "",
      "openingHours": [""],
      "streetAddress": "",
      "addressLocality": "",
      "addressRegion": "",
      "postalCode": ""
    },
    "cafeShopLocations": [{"name":"", "detail":"", "mapUrl":"", "imageUrl":""}],
    "cafeBranchMenuItems": [{"groupLabel":"", "label":"", "menuUrl":""}]
  }
}

補足:
- メニューは "cafeMenuTextRows" にできるだけ分解する。
- FAQらしき記述があれば "faqItems" に入れる。
- Googleマップ系情報は "footerAddress" と "cafeMeo" に優先反映する。
- テキスト入力にある事実は優先して採用する。`;

  const parts = [{ text: prompt }];
  if (text) {
    parts.push({
      text: `追加テキスト:\n${text}`,
    });
  }
  for (const f of usable) {
    parts.push({
      inlineData: {
        mimeType: String(f.mimeType),
        data: String(f.data),
      },
    });
  }

  const result = await model.generateContent(parts);
  const raw = (result.response.text() || '').trim();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Gemini did not return valid JSON');
  let parsed = {};
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('Failed to parse extracted JSON');
  }
  return {
    nameSuggestion: typeof parsed.nameSuggestion === 'string' ? parsed.nameSuggestion.slice(0, 80) : '',
    override: parsed.override && typeof parsed.override === 'object' ? parsed.override : {},
  };
}

/**
 * Google検索のまとめ・食べログ要約など、長文テキストだけからテンプレ override を抽出（画像なし）
 */
export async function extractTemplateOverrideFromFreeText(pastedText) {
  const text = String(pastedText || '').trim().slice(0, 20000);
  if (!text) throw new Error('empty text');
  const model = getClient().getGenerativeModel({ model: 'gemini-2.5-flash' });
  const prompt = `あなたはWeb制作の入力補助AIです。ユーザーがGoogle検索のまとめ・食べログの要約・調査メモなど自由形式で貼り付けた文章から、店舗LP向けのJSONを返してください。

【厳守】
- 返すのはJSONオブジェクト1つのみ。説明文・Markdown・コードフェンス（\`\`\`）は禁止。
- 文中に書かれていない情報は空文字・空配列にする。捏造しない。
- mapEmbedUrl は「https://www.google.com/maps/embed?...」形式が文中に明示されているときだけ。maps/place や検索URLは入れない。
- Instagram/Xは実URL、または @アカウントが明示されているときだけ（「SNSで発信」のみでは空）。
- メニューは文章に価格や品名があれば cafeMenuTextRows に分解する。無ければ []。
- FAQらしきQ&Aがあれば faqItems に。無ければ []。

【sections】は、LPの本文ブロックとして使えそうなまとめだけ返す。各要素は id（英小文字・数字・ハイフン）・title・content（imageUrlは文中に画像URLがあれば）。
既存テンプレでよく使う id の例: concept / story / menu-intro / hours / access / interior / atmosphere
文章に合う id を選ぶ。該当するまとめが無ければ sections は []。
※ 同じ id のブロックは後からフォーム側で既存セクションにマージされる想定。

【cafeVisualGenre】は次のいずれか1つ、分からなければ空文字:
ramen | cafe_coffee | kissaten | izakaya | yakiniku | sushi | yoshoku | teishoku | don_udon_soba | sweets | takeout | other_food

【cafeShopLocations】は店舗が1つなら name に店名、detail に住所・アクセス・駐車場などをまとめてよい。複数店舗の記述が無ければ1要素でよい。情報が乏しく name/detail が埋まらない場合は []。

返却スキーマ:
{
  "nameSuggestion": "",
  "override": {
    "siteName": "",
    "title": "",
    "headline": "",
    "subheadline": "",
    "footerText": "",
    "footerAddress": "",
    "footerPhone": "",
    "footerInstagramUrl": "",
    "footerTwitterUrl": "",
    "mapEmbedUrl": "",
    "cafeVisualGenre": "",
    "sections": [{"id":"", "title":"", "content":"", "imageUrl":""}],
    "faqItems": [{"q":"", "a":""}],
    "cafeMenuTextRows": [{"groupLabel":"", "name":"", "price":"", "description":"", "badge":""}],
    "cafeMeo": {
      "servesCuisine": "",
      "priceRange": "",
      "openingHours": [""],
      "streetAddress": "",
      "addressLocality": "",
      "addressRegion": "",
      "postalCode": ""
    },
    "cafeShopLocations": [{"name":"", "detail":"", "mapUrl":"", "imageUrl":""}],
    "cafeBranchMenuItems": [{"groupLabel":"", "label":"", "menuUrl":""}]
  }
}

【貼り付け文章】
${text}`;

  const result = await model.generateContent(prompt);
  const raw = (result.response.text() || '').trim();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Gemini did not return valid JSON');
  let parsed = {};
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('Failed to parse extracted JSON');
  }
  return {
    nameSuggestion: typeof parsed.nameSuggestion === 'string' ? parsed.nameSuggestion.slice(0, 80) : '',
    override: parsed.override && typeof parsed.override === 'object' ? parsed.override : {},
  };
}

function sliceStr(v, max) {
  const s = typeof v === 'string' ? v.trim() : '';
  return s.slice(0, max);
}

function openingHoursFromParsed(parsed) {
  const oh = parsed.openingHoursText ?? parsed.opening_hours_text;
  if (Array.isArray(oh)) return oh.map(String).join('\n').trim().slice(0, 2000);
  return sliceStr(oh, 2000);
}

/**
 * Google検索のまとめ・調査メモなど自由形式テキストから、cafe_1 基本情報フォーム用フィールドを抽出する
 */
export async function extractCafe1BasicFromFreeText(pastedText) {
  const text = String(pastedText || '').trim().slice(0, 20000);
  if (!text) throw new Error('empty text');
  const model = getClient().getGenerativeModel({ model: 'gemini-2.5-flash' });
  const prompt = `あなたは店舗の基本情報をテキストから抽出するアシスタントです。ユーザーがGoogle検索のまとめ・食べログの要約・調査メモなど、自由形式で貼り付けた文章から、次のキーだけを持つJSONオブジェクトを1つ返してください。

【厳守】
- 有効なJSONオブジェクト1つだけ。説明文・Markdown・コードフェンス（\`\`\`）は禁止。
- 文章中に明示されていない項目は必ず空文字 "" にする。推測・捏造はしない。
- 電話番号が無ければ footerPhone は空。マップの「埋め込み用iframeのsrc」と同じURLが文中に無ければ mapEmbedUrl は空（通常の maps/place や検索URLは入れない）。
- 「InstagramやXで発信」とだけ書いてURLが無い場合は footerInstagramUrl / footerTwitterUrl は空（@アカウントも文中に無ければ空）。
- openingHoursText には営業時間の表記と定休日をまとめる。複数行にしてよい（JSON内は \\n で改行エスケープ可）。
- URLは生のhttps文字列のみ。[表示](url)形式にしない。

【visualGenre】は店の業態に最も近い次のいずれか1つ、はっきり分からなければ空文字:
ramen | cafe_coffee | kissaten | izakaya | yakiniku | sushi | yoshoku | teishoku | don_udon_soba | sweets | takeout | other_food

返却スキーマ:
{
  "siteName": "",
  "footerAddress": "",
  "footerPhone": "",
  "mapEmbedUrl": "",
  "openingHoursText": "",
  "footerInstagramUrl": "",
  "footerTwitterUrl": "",
  "visualGenre": ""
}

【貼り付け文章】
${text}`;

  const result = await model.generateContent(prompt);
  const raw = (result.response.text() || '').trim();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Gemini did not return valid JSON');
  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('Failed to parse Gemini JSON');
  }
  return {
    siteName: sliceStr(parsed.siteName, 200),
    footerAddress: sliceStr(parsed.footerAddress, 800),
    footerPhone: sliceStr(parsed.footerPhone, 60),
    mapEmbedUrl: sliceStr(parsed.mapEmbedUrl, 2500),
    openingHoursText: openingHoursFromParsed(parsed),
    footerInstagramUrl: sliceStr(parsed.footerInstagramUrl, 500),
    footerTwitterUrl: sliceStr(parsed.footerTwitterUrl, 500),
    visualGenre: sliceStr(parsed.visualGenre || parsed.cafeVisualGenre, 40),
  };
}
