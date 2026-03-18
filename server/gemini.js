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
