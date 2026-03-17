import type { TemplateOption } from '../types';

const baseLayout = `
  .page-wrapper { box-sizing: border-box; margin: 0; padding: 0; font-family: var(--tp-font); color: var(--tp-text); background: var(--tp-bg); line-height: 1.7; }
  .page-wrapper * { box-sizing: border-box; }
  .page-wrapper .container { max-width: 960px; margin: 0 auto; padding: 0 24px; }
  .page-wrapper header { padding: 24px 0; border-bottom: 1px solid var(--tp-border); }
  .page-wrapper .logo { font-size: 1.25rem; font-weight: 700; color: var(--tp-heading); text-decoration: none; }
  .page-wrapper .hero { padding: 64px 0; text-align: center; }
  .page-wrapper .hero h1 { font-size: clamp(1.75rem, 4vw, 2.75rem); font-weight: 700; color: var(--tp-heading); margin: 0 0 16px; line-height: 1.3; }
  .page-wrapper .hero .subheadline { font-size: 1.125rem; opacity: 0.9; max-width: 560px; margin: 0 auto; }
  .page-wrapper main { padding: 48px 0 64px; }
  .page-wrapper .section { margin-bottom: 48px; }
  .page-wrapper .section h2 { font-size: 1.5rem; font-weight: 600; color: var(--tp-heading); margin: 0 0 16px; }
  .page-wrapper .section p { margin: 0 0 12px; }
  .page-wrapper footer { padding: 32px 0; border-top: 1px solid var(--tp-border); text-align: center; font-size: 0.875rem; opacity: 0.8; }
`;

function makeTemplate(
  styleId: string,
  name: string,
  description: string,
  vars: Record<string, string>
): TemplateOption {
  const varLines = Object.entries(vars)
    .map(([k, v]) => `  --tp-${k}: ${v};`)
    .join('\n');
  const css = `
  .page-wrapper.template-${styleId} {
${varLines}
  }
${baseLayout}
`;
  return {
    id: styleId,
    industryId: 'general',
    styleId: styleId as TemplateOption['styleId'],
    name,
    description,
    css,
  };
}

export const TEMPLATES: TemplateOption[] = [
  makeTemplate(
    'minimal',
    'ミニマル',
    '余白を活かしたシンプルなデザイン',
    {
      font: '"Helvetica Neue", Arial, sans-serif',
      text: '#333',
      heading: '#111',
      bg: '#fff',
      border: '#eee',
      accent: '#333',
    }
  ),
  makeTemplate(
    'corporate',
    'コーポレート',
    '信頼感のあるビジネス向け',
    {
      font: '"Noto Sans JP", "Hiragino Kaku Gothic ProN", sans-serif',
      text: '#374151',
      heading: '#111827',
      bg: '#f9fafb',
      border: '#e5e7eb',
      accent: '#1d4ed8',
    }
  ),
  makeTemplate(
    'warm',
    '温かみ',
    '親しみやすいオレンジ・ベージュ系',
    {
      font: '"Noto Sans JP", "Hiragino Kaku Gothic ProN", sans-serif',
      text: '#4a3728',
      heading: '#2d1f14',
      bg: '#fef8f0',
      border: '#ecdcc8',
      accent: '#c2410c',
    }
  ),
  makeTemplate(
    'bold',
    '大胆・インパクト',
    '強いコントラストで目を引く',
    {
      font: '"Noto Sans JP", "Hiragino Kaku Gothic ProN", sans-serif',
      text: '#e5e5e5',
      heading: '#fff',
      bg: '#0f0f0f',
      border: '#333',
      accent: '#facc15',
    }
  ),
  makeTemplate(
    'elegant',
    'エレガント',
    '上品なタイポグラフィと落ち着いた色',
    {
      font: '"Times New Roman", "Yu Mincho", serif',
      text: '#444',
      heading: '#1a1a1a',
      bg: '#fafaf9',
      border: '#e8e6e3',
      accent: '#6b5b4f',
    }
  ),
  makeTemplate(
    'modern',
    'モダン',
    'グラデーションと角丸の現代的デザイン',
    {
      font: '"Inter", "Noto Sans JP", sans-serif',
      text: '#334155',
      heading: '#0f172a',
      bg: 'linear-gradient(180deg, #f0f9ff 0%, #fff 60%)',
      border: '#e2e8f0',
      accent: '#0ea5e9',
    }
  ),
];

