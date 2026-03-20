/**
 * 参考HTMLの「見た目」特徴を Gemini で補強（文章の転載はさせない）
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;
function getClient() {
  if (!genAI) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return null;
    genAI = new GoogleGenerativeAI(key);
  }
  return genAI;
}

/**
 * @param {string} html
 * @param {object} baseBlueprint
 */
export async function enrichReferenceBlueprint(html, baseBlueprint) {
  const client = getClient();
  if (!client) return baseBlueprint;

  try {
    const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const stripped = String(html || '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .slice(0, 52000);

    const hint = JSON.stringify({
      visualStyle: baseBlueprint.visualStyle,
      topColors: baseBlueprint.tokens?.topColors?.slice(0, 8),
      hasGradients: !!(baseBlueprint.tokens?.gradients?.length),
    });

    const prompt = `あなたはWebのビジュアルデザイン分析者です。次のHTML断片から、**レイアウト・色・質感**だけを推定しJSONのみ返してください。

禁止: 引用元サイトの固有名詞・キャッチコピー・本文の転載。短いプレースホルダ（「（サンプル）」程度）は可。

機械推定ヒント: ${hint}

返すJSONのキー:
- visualStyle: "dark_gradient_lp" | "dark_hero" | "light_default" | "light_corporate"
- heroLayout: "split_photo_right" | "split_photo_left" | "centered_stack"
- ctaGradientCss: string | null （ページ内のボタンに近い linear-gradient(...) を1つ。不明なら null）
- backgroundHex: string | null （#RRGGBB ページ地の色に最も近いもの）
- primaryTextHex: string | null （#RRGGBB 主要見出しの文字色）
- goldAccentHex: string | null （金・黄色のマーカー強調があれば）
- hasWatermarkTypography: boolean （背景に薄い巨大欧文・装飾文字があるか）
- designNotesJa: string （見た目の特徴を1文。第三者の文章は書かない）

HTML:
${stripped}`;

    const result = await model.generateContent(prompt);
    const raw = (result.response.text() || '').trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return baseBlueprint;

    const g = JSON.parse(jsonMatch[0]);
    const merged = JSON.parse(JSON.stringify(baseBlueprint));

    merged.visualStyle = g.visualStyle || merged.visualStyle;
    merged.layout = merged.layout || {};
    merged.layout.heroLayout = g.heroLayout || merged.layout.heroLayout;
    merged.layout.watermarkTypography = !!g.hasWatermarkTypography;

    merged.tokens = merged.tokens || {};
    merged.tokens.colors = merged.tokens.colors || {};
    if (g.backgroundHex && /^#[0-9a-fA-F]{6}$/.test(g.backgroundHex)) {
      merged.tokens.colors.bg = g.backgroundHex.toLowerCase();
    }
    if (g.primaryTextHex && /^#[0-9a-fA-F]{6}$/.test(g.primaryTextHex)) {
      merged.tokens.colors.text = g.primaryTextHex.toLowerCase();
    }
    if (g.goldAccentHex && /^#[0-9a-fA-F]{6}$/.test(g.goldAccentHex)) {
      merged.tokens.colors.goldAccent = g.goldAccentHex.toLowerCase();
    }
    if (g.ctaGradientCss && String(g.ctaGradientCss).includes('gradient')) {
      merged.tokens.ctaGradient = String(g.ctaGradientCss).trim().slice(0, 800);
    }

    merged.meta = merged.meta || {};
    if (g.designNotesJa) merged.meta.geminiNotes = String(g.designNotesJa).slice(0, 400);

    return merged;
  } catch (e) {
    console.warn('[enrichReferenceBlueprint]', e?.message || e);
    return baseBlueprint;
  }
}
