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
 * 店舗名・地域・業種などから cafe_1 向けドラフト override を生成（公式サイト不要想定）。
 * モデルの学習知識・推論のみ。実URLの取得はできないため verification.sourceUrls は空になりがち。
 *
 * @param {{ storeName: string, area: string, category?: string, extraNotes?: string }} input
 */
export async function researchStoreDraftForCafe1(input = {}) {
  const storeName = String(input.storeName || '').trim().slice(0, 120);
  const area = String(input.area || '').trim().slice(0, 200);
  const category = String(input.category || '').trim().slice(0, 120);
  const extraNotes = String(input.extraNotes || '').trim().slice(0, 8000);
  if (!storeName || !area) throw new Error('storeName and area are required');

  const model = getClient().getGenerativeModel({ model: 'gemini-2.5-flash' });
  const prompt = `あなたは店舗LP（テンプレートID cafe_1）の下書き用データを作るアシスタントです。
次の店について、あなたの知識に基づき可能な範囲でJSONを1つだけ返してください。説明文・Markdown・コードフェンスは禁止。

【店舗名】${storeName}
【地域】${area}
【業種】${category || '（未指定）'}
【補足・URLメモ】
${extraNotes || '（なし）'}

厳守ルール:
- 公式サイトや確実な一次情報がない場合、無理に埋めない。空文字・空配列でよい。
- 店主の顔写真URL・「公式の」店主コメントが取れないときは、staff セクションの content に「店主からのコメントは準備中です。」のようにプレースホルダを書き、imageUrl は空。
- トップヒーロー画像URL（heroSlides）は返さない。常に "heroSlides": []。
- メニュー・価格は、地図アプリのメニュー写真などに載っている情報として知り得る範囲のみ cafeMenuTextRows に入れよい。不確かなら入れないか価格を空にする。
- 断定できない営業時間は hours セクションや cafeMeo.openingHours を空に近くしてよい。
- 第三者紹介調・レビュー引用調のキャッチは避け、店の紹介として自然な文言にする（ただし創作で詳細を捏造しない）。
- verification.sourceUrls は、この応答では実URLを取得できないため基本は空配列でよい。unknownFields に「要・現地確認」の項目を列挙する。

返却JSONスキーマ（この形のみ）:
{
  "nameSuggestion": "ドラフト名候補（80文字以内）",
  "verification": {
    "confidence": 0.0,
    "sourceUrls": [],
    "unknownFields": ["例: footerPhone"],
    "notes": "日本語の短いメモ"
  },
  "override": {
    "siteName": "",
    "title": "",
    "headline": "",
    "subheadline": "",
    "footerText": "",
    "footerAddress": "",
    "footerPhone": "",
    "footerInstagramUrl": "",
    "footerLineUrl": "",
    "ctaLabel": "",
    "ctaHref": "",
    "navLabels": "",
    "metaTitle": "",
    "metaDescription": "",
    "keywords": "",
    "canonicalUrl": "",
    "ogImageUrl": "",
    "mapEmbedUrl": "",
    "cafeFloatingMapUrl": "",
    "cafeReviewCtaText": "",
    "cafeReviewCtaUrl": "",
    "cafeGbPostsEmbedUrl": "",
    "cafeInstagramPermalink": "",
    "heroSlides": [],
    "heroSlideStyles": [],
    "sections": [
      {"id":"concept","title":"","content":"","imageUrl":""},
      {"id":"staff","title":"","content":"","imageUrl":""},
      {"id":"menu","title":"","content":"","imageUrl":""},
      {"id":"access","title":"","content":"","imageUrl":""},
      {"id":"hours","title":"営業時間","content":"","imageUrl":""},
      {"id":"faq","title":"","content":"","imageUrl":""},
      {"id":"shop","title":"","content":"","imageUrl":""},
      {"id":"contact","title":"","content":"","imageUrl":""}
    ],
    "faqItems": [{"q":"","a":""}],
    "cafeMenuTextRows": [{"groupLabel":"","name":"","price":"","description":"","badge":""}],
    "cafeMeo": {
      "servesCuisine": "",
      "priceRange": "",
      "openingHours": [""],
      "streetAddress": "",
      "addressLocality": "",
      "addressRegion": "",
      "postalCode": ""
    },
    "cafeShopLocations": [{"name":"","detail":"","mapUrl":"","imageUrl":"","reserveUrl":"","reserveLabel":""}],
    "cafeBranchMenuItems": [{"groupLabel":"","label":"","menuUrl":""}],
    "cafeInstagramFeedItems": []
  }
}

sections は上記8個の id を必ず含める。不要な本文は空でもよい。`;

  const result = await model.generateContent(prompt);
  const raw = (result.response.text() || '').trim();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Gemini did not return valid JSON');
  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('Failed to parse research JSON');
  }
  const verification =
    parsed.verification && typeof parsed.verification === 'object' && !Array.isArray(parsed.verification)
      ? parsed.verification
      : {};
  const ov = parsed.override && typeof parsed.override === 'object' ? parsed.override : {};
  return {
    nameSuggestion: typeof parsed.nameSuggestion === 'string' ? parsed.nameSuggestion.slice(0, 80) : '',
    verification,
    override: ov,
  };
}

/**
 * 検索意図（例: 「ラーメン つくば」）から実在店候補の店名・地域を列挙する（モデル知識ベース）。
 *
 * @param {string} query
 * @param {number} maxCount 1〜10
 * @returns {{ stores: Array<{ storeName: string, area: string, categoryHint: string }>, batchVerification: object }}
 */
export async function discoverStoresFromQuery(query, maxCount = 10) {
  const q = String(query || '').trim().slice(0, 500);
  const n = Math.min(10, Math.max(1, Number(maxCount) || 10));
  if (!q) throw new Error('query is required');

  const model = getClient().getGenerativeModel({ model: 'gemini-2.5-flash' });
  const prompt = `次の検索意図に合う「実在する」店舗・飲食店を、日本国内想定で最大${n}件列挙してください。説明文・Markdown・コードフェンスは禁止。有効なJSONのみ。

検索意図: ${q}

厳守:
- 知識として存在がかなり確実な店のみ。不確かなら列挙しない（件数が減ってよい）。
- 同じチェーンばかりに偏らないよう、可能ならバリエーションを付ける。
- storeName は実在しうる商号名。area は市区町村＋必要なら町域（例: 茨城県つくば市学園の森）。
- categoryHint は業種の短い表現（例: ラーメン）でよい。

返すJSON（この形のみ）:
{
  "batchVerification": {
    "confidence": 0.0,
    "notes": "候補選定の短いメモ",
    "queryInterpretation": "検索意図の読み取り（短文）"
  },
  "stores": [
    { "storeName": "", "area": "", "categoryHint": "" }
  ]
}
stores は1〜${n}件。確実な候補が1件も無い場合は stores を空配列にする。`;

  const result = await model.generateContent(prompt);
  const raw = (result.response.text() || '').trim();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Gemini did not return valid JSON for store list');
  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('Failed to parse store list JSON');
  }
  const batchVerification =
    parsed.batchVerification && typeof parsed.batchVerification === 'object' && !Array.isArray(parsed.batchVerification)
      ? parsed.batchVerification
      : {};
  const rawStores = Array.isArray(parsed.stores) ? parsed.stores : [];
  const stores = rawStores
    .map((s) => ({
      storeName: String(s?.storeName || '').trim().slice(0, 120),
      area: String(s?.area || '').trim().slice(0, 200),
      categoryHint: String(s?.categoryHint || '').trim().slice(0, 120),
    }))
    .filter((s) => s.storeName && s.area)
    .slice(0, n);

  return { stores, batchVerification };
}
