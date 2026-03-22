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
 * 公開ページ用 UI 文言を英語に一括翻訳（キー順を維持）
 * @param {{ key: string, text: string }[]} entries
 * @returns {Promise<{ key: string, text: string }[]>}
 */
export async function translatePublicUiEntries(entries) {
  if (!Array.isArray(entries) || !entries.length) return [];

  const model = getClient().getGenerativeModel({ model: 'gemini-2.5-flash' });
  const payload = entries.map((e) => ({
    key: String(e.key || ''),
    text: String(e.text || '').slice(0, 2000),
  }));

  const prompt = `You are a professional translator for a Japanese web/LP production studio (Closer). Translate each "text" from Japanese to natural English for website UI.

Rules:
- Preserve every "key" exactly as given in the output.
- Keep required-field markers like * at the end of labels when present.
- Do not add explanations. Output valid JSON only.
- Tone: clear, trustworthy, B2B-friendly.

Input:
${JSON.stringify(payload)}

Output format (same length as input, same keys in same order):
{"out":[{"key":"...","text":"English..."},...]}`;

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
  const out = parsed.out;
  if (!Array.isArray(out) || out.length !== entries.length) {
    throw new Error('Translation length mismatch');
  }
  return entries.map((e, i) => ({
    key: e.key,
    text: String(out[i]?.text != null ? out[i].text : '').trim() || e.text,
  }));
}
