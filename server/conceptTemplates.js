/**
 * 業種ごとに6テンプレートを用意（業種 × スタイル = 48種）
 * テンプレートID: {業種}_{スタイル} 例: cafe_minimal, apparel_elegant
 */
const STYLE_IDS = ['minimal', 'corporate', 'warm', 'bold', 'elegant', 'modern'];

const BASE_STYLES = {
  minimal: { font: '"Helvetica Neue", Arial, sans-serif', text: '#333', heading: '#111', bg: '#fff', border: '#eee', accent: '#333' },
  corporate: { font: '"Noto Sans JP", sans-serif', text: '#374151', heading: '#111827', bg: '#f9fafb', border: '#e5e7eb', accent: '#1d4ed8' },
  warm: { font: '"Noto Sans JP", sans-serif', text: '#4a3728', heading: '#2d1f14', bg: '#fef8f0', border: '#ecdcc8', accent: '#c2410c' },
  bold: { font: '"Noto Sans JP", sans-serif', text: '#e5e5e5', heading: '#fff', bg: '#0f0f0f', border: '#333', accent: '#facc15' },
  elegant: { font: '"Times New Roman", serif', text: '#444', heading: '#1a1a1a', bg: '#fafaf9', border: '#e8e6e3', accent: '#6b5b4f' },
  modern: { font: '"Inter", sans-serif', text: '#334155', heading: '#0f172a', bg: 'linear-gradient(180deg, #f0f9ff 0%, #fff 60%)', border: '#e2e8f0', accent: '#0ea5e9' },
};

/** 業種ごとの色・トーンの微調整（上書き用） */
const INDUSTRY_TWEAKS = {
  cafe: { warm: { accent: '#b45309', bg: '#fffbeb' }, minimal: { accent: '#92400e' } },
  restaurant: { elegant: { accent: '#78350f', bg: '#fef3c7' }, warm: { accent: '#ea580c' } },
  salon: { elegant: { accent: '#78716c', bg: '#fafaf9' }, minimal: { text: '#3f3f46' } },
  retail: { modern: { accent: '#2563eb' }, bold: { accent: '#fbbf24' } },
  apparel: { bold: { accent: '#f472b6', bg: '#1c1917', border: '#444' }, elegant: { accent: '#a78bfa', bg: '#faf5ff' }, modern: { accent: '#ec4899' }, minimal: { accent: '#171717' } },
  service: { corporate: { accent: '#2563eb' }, minimal: { border: '#e5e7eb' } },
  clinic: { corporate: { accent: '#059669', bg: '#f0fdf4', border: '#bbf7d0' }, minimal: { accent: '#047857' }, elegant: { accent: '#0d9488', bg: '#f0fdfa' } },
  general: {},
};

const INDUSTRIES = ['cafe', 'restaurant', 'salon', 'retail', 'apparel', 'service', 'clinic', 'general'];

export const CONCEPT_TEMPLATES = Object.fromEntries(
  INDUSTRIES.map((ind) => [
    ind,
    STYLE_IDS.map((style) => `${ind}_${style}`),
  ])
);

function buildTemplateCss() {
  const out = {};
  for (const ind of INDUSTRIES) {
    for (const style of STYLE_IDS) {
      const id = `${ind}_${style}`;
      const base = { ...BASE_STYLES[style] };
      const tweak = INDUSTRY_TWEAKS[ind] && INDUSTRY_TWEAKS[ind][style] ? INDUSTRY_TWEAKS[ind][style] : {};
      out[id] = { ...base, ...tweak };
    }
  }
  return out;
}

export const TEMPLATE_CSS = buildTemplateCss();
