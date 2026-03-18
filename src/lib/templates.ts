import type { TemplateOption } from '../types';

/** 8pxベース余白スケール（コンテスト・高級感用） */
const SPACE = {
  xs: '8px',
  sm: '16px',
  md: '24px',
  lg: '32px',
  xl: '48px',
  '2xl': '64px',
  '3xl': '96px',
  '4xl': '128px',
  '5xl': '160px',
};

/** イージング（100万円レベル：入り抜けの質） */
const EASE = {
  outExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
  inOutSmooth: 'cubic-bezier(0.65, 0, 0.35, 1)',
  outQuart: 'cubic-bezier(0.25, 1, 0.5, 1)',
};

/** 共通: 検品20項準拠 — タイポ階層・字間・余白呼吸・多層影・0.5px線・ノイズ・イージング・scroll-in・CTA押下感・a11y */
const HELL_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const commonBase = `
  @keyframes hell-page-in { from { opacity: 0; } to { opacity: 1; } }
  html { overflow-x: hidden; width: 100%; max-width: 100%; box-sizing: border-box; }
  body.page-wrapper {
    overflow-x: hidden; width: 100%; max-width: 100%; margin: 0; padding: 0; box-sizing: border-box; -webkit-overflow-scrolling: touch;
    position: relative;
  }
  @media (prefers-reduced-motion: no-preference) {
    body.page-wrapper { animation: hell-page-in 1.1s ${HELL_EASE} forwards; opacity: 0; }
  }
  @media (prefers-reduced-motion: reduce) {
    body.page-wrapper { opacity: 1 !important; animation: none !important; }
  }
  body.page-wrapper::after {
    content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 10000;
    opacity: 0.028; mix-blend-mode: multiply;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }
  .page-wrapper {
    box-sizing: border-box; margin: 0; padding: 0; overflow-x: hidden; max-width: 100%; overflow-wrap: break-word; word-wrap: break-word;
    --space-xs: ${SPACE.xs}; --space-sm: ${SPACE.sm}; --space-md: ${SPACE.md}; --space-lg: ${SPACE.lg};
    --space-xl: ${SPACE.xl}; --space-2xl: ${SPACE['2xl']}; --space-3xl: ${SPACE['3xl']}; --space-4xl: ${SPACE['4xl']}; --space-5xl: ${SPACE['5xl']};
    --ease-out-expo: ${EASE.outExpo}; --ease-in-out: ${EASE.inOutSmooth}; --ease-out-quart: ${EASE.outQuart}; --hell-ease: ${HELL_EASE};
    --shadow-lift: 0 1px 1px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.05), 0 20px 40px rgba(0,0,0,0.06);
    --shadow-press: 0 1px 2px rgba(0,0,0,0.06);
    --hairline: rgba(0,0,0,0.1);
    --type-display: clamp(2.25rem, 6vw + 1rem, 4.25rem);
    --type-h2: clamp(1.5rem, 2.8vw + 0.75rem, 2.35rem);
    --type-lead: clamp(1.0625rem, 1.2vw + 0.9rem, 1.3125rem);
    --type-body: clamp(0.9375rem, 0.4vw + 0.875rem, 1.0625rem);
    --text-xs: 0.75rem; --text-sm: 0.875rem; --text-base: 1rem; --text-lg: 1.125rem; --text-xl: 1.25rem; --text-2xl: 1.5rem; --text-3xl: 1.875rem;
    --tp-bg: #fafaf8; --tp-heading: #1c1c1c; --tp-text: #3d3d3a; --tp-accent: #2563eb; --tp-border: rgba(28,28,28,0.1); --tp-bg-footer: #f4f4f1;
  }
  .page-wrapper * { box-sizing: border-box; }
  .skip-link { position: absolute; top: -4rem; left: var(--space-sm); z-index: 10001; padding: var(--space-xs) var(--space-sm); background: var(--tp-heading); color: #fafaf8; text-decoration: none; border-radius: 0.25rem; font-size: var(--text-sm); transition: top 0.35s var(--hell-ease); letter-spacing: 0.08em; }
  .skip-link:focus { top: var(--space-sm); outline: 2px solid var(--tp-accent); outline-offset: 3px; }
  .page-wrapper .hero h1, .wo-hero-inner h1 {
    font-size: var(--type-display); line-height: 1.08; letter-spacing: -0.02em;
    word-break: keep-all; line-break: strict; text-wrap: balance;
  }
  .page-wrapper .section h2 { font-size: var(--type-h2); font-weight: 700; line-height: 1.15; letter-spacing: 0.04em; margin: 0 0 var(--space-lg); }
  .page-wrapper p, .page-wrapper .subheadline { line-height: 1.72; letter-spacing: 0.01em; }
  .page-wrapper .section p { font-size: var(--type-body); }
  .page-wrapper .section-body > p:first-of-type { font-size: var(--type-lead); line-height: 1.75; color: var(--tp-text); letter-spacing: 0.02em; }
  .page-wrapper .container { max-width: 960px; margin: 0 auto; padding-left: var(--space-sm); padding-right: var(--space-sm); }
  @media (min-width: 769px) { .page-wrapper .container { padding-left: var(--space-lg); padding-right: var(--space-lg); } }
  .page-wrapper img { max-width: 100%; height: auto; vertical-align: middle; }
  .page-wrapper header {
    padding: var(--space-md) 0;
    border-bottom: 0.5px solid var(--tp-border);
    transition: background 0.45s var(--hell-ease), border-color 0.45s var(--hell-ease), box-shadow 0.45s var(--hell-ease);
  }
  @supports not (border-width: 0.5px) { .page-wrapper header { border-bottom-width: 1px; } }
  .header-inner { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--space-md); }
  .page-wrapper .logo { font-size: clamp(1.2rem, 2.2vw + 0.5rem, 1.5rem); font-weight: 700; color: var(--tp-heading); text-decoration: none; letter-spacing: 0.06em; transition: letter-spacing 0.5s var(--hell-ease), opacity 0.35s var(--hell-ease); }
  .page-wrapper .logo:hover { letter-spacing: 0.1em; opacity: 0.88; }
  .nav { display: flex; flex-wrap: wrap; gap: var(--space-md); align-items: center; }
  .nav-link { position: relative; color: inherit; text-decoration: none; font-size: var(--text-sm); letter-spacing: 0.06em; opacity: 0.9; transition: opacity 0.4s var(--hell-ease), letter-spacing 0.45s var(--hell-ease); }
  .nav-link::after { content: ''; position: absolute; left: 0; bottom: -4px; height: 0.5px; width: 0; background: currentColor; transition: width 0.5s var(--hell-ease); }
  .nav-link:hover, .nav-link:focus-visible { opacity: 1; letter-spacing: 0.12em; outline: none; }
  .nav-link:hover::after, .nav-link:focus-visible::after { width: 100%; }
  .nav-link:focus-visible { outline: 2px solid var(--tp-accent); outline-offset: 4px; }
  .cta-btn {
    display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: var(--space-sm) var(--space-xl);
    font-size: var(--text-sm); font-weight: 600; letter-spacing: 0.08em; text-decoration: none; border-radius: 0.375rem;
    box-shadow: var(--shadow-lift);
    transition: transform 0.35s var(--hell-ease), box-shadow 0.35s var(--hell-ease), opacity 0.35s var(--hell-ease), background-color 0.35s var(--hell-ease), border-color 0.35s var(--hell-ease), letter-spacing 0.45s var(--hell-ease);
  }
  .cta-btn:hover { letter-spacing: 0.14em; transform: translateY(-2px); box-shadow: 0 2px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.08), 0 28px 56px rgba(0,0,0,0.08); }
  .cta-btn:active { transform: translateY(1px); box-shadow: var(--shadow-press); }
  .cta-btn:focus-visible { outline: 2px solid var(--tp-accent); outline-offset: 3px; }
  .cta-btn-primary { min-height: 52px; padding: var(--space-sm) var(--space-2xl); font-size: var(--text-base); }
  .cta-block { text-align: center; padding: var(--space-3xl) var(--space-md); margin: var(--space-xl) 0; border: 0.5px solid var(--hairline); box-shadow: var(--shadow-lift); background: rgba(255,255,255,0.5); }
  @supports not (border-width: 0.5px) { .cta-block { border-width: 1px; } }
  .section-img-wrap { margin-bottom: var(--space-md); }
  .section-img { width: 100%; height: auto; max-height: 360px; object-fit: cover; display: block; }
  .page-wrapper main { padding: var(--space-3xl) 0 var(--space-4xl); min-height: 40vh; }
  .page-wrapper .section { margin-bottom: 0; }
  .page-wrapper .section p:last-child { margin-bottom: 0; }
  .footer-cols { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2xl); text-align: left; }
  @media (max-width: 600px) { .footer-cols { grid-template-columns: 1fr; gap: var(--space-xl); } }
  .footer-col p { margin: 0 0 var(--space-xs); font-size: var(--text-sm); letter-spacing: 0.02em; }
  .footer-brand { font-weight: 700; letter-spacing: 0.05em; }
  .footer-link { color: inherit; transition: opacity 0.35s var(--hell-ease); }
  .footer-link:hover { opacity: 0.75; }
  .page-wrapper footer { padding: var(--space-4xl) 0 var(--space-3xl); border-top: 0.5px solid var(--tp-border); background: var(--tp-bg-footer); text-align: center; font-size: var(--text-sm); }
  @supports not (border-width: 0.5px) { .page-wrapper footer { border-top-width: 1px; } }
  .footer-legal { margin-top: var(--space-xl); padding-top: var(--space-md); border-top: 0.5px solid var(--tp-border); font-size: 0.8125rem; opacity: 0.82; letter-spacing: 0.03em; }
  .page-wrapper .sns-links a { margin-right: var(--space-sm); letter-spacing: 0.05em; transition: letter-spacing 0.35s var(--hell-ease); }
  .page-wrapper .sns-links a:hover { letter-spacing: 0.1em; }
  .page-wrapper .presented-by { font-size: 0.75rem; opacity: 0.65; margin-top: var(--space-sm); letter-spacing: 0.04em; }
  .page-wrapper .qr-block { margin-top: var(--space-lg); text-align: center; }
  .page-wrapper .qr-block img { max-width: 120px; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.08)); }
  .page-wrapper .qr-placeholder { font-size: 0.875rem; color: var(--tp-text, #666); margin: var(--space-xs) 0; }
  .quote-block { margin: var(--space-3xl) 0; padding: var(--space-xl); font-size: clamp(1.125rem, 2vw, 1.35rem); font-style: italic; text-align: center; letter-spacing: 0.03em; line-height: 1.65; }
  .stats-block { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: var(--space-lg); margin-bottom: var(--space-3xl); text-align: center; padding: var(--space-lg) 0; }
  .stat-value { display: block; font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 800; letter-spacing: -0.02em; }
  .stat-label { font-size: 0.8125rem; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.88; margin-top: var(--space-xs); }
  .hero-with-bg, .hero-full-img { position: relative; background-size: cover; background-position: center; background-image: var(--hero-bg-img); min-height: 52vh; display: flex; align-items: center; justify-content: center; }
  .hero-bg-overlay { position: absolute; inset: 0; background: rgba(22,22,20,0.42); }
  .hero-with-bg .hero-inner, .hero-full-img .hero-inner { position: relative; z-index: 1; padding: var(--space-4xl) var(--space-lg); text-align: center; color: #faf9f7; }
  .hero-with-bg .hero-inner .cta-btn, .hero-full-img .hero-inner .cta-btn { background: #faf9f7; color: #1a1917; box-shadow: var(--shadow-lift); }
  .hero-sample-img { width: 100%; max-height: 300px; object-fit: cover; border-radius: 0.5rem; margin-bottom: var(--space-sm); }
  .section-rhythm-after-hero { padding-top: var(--space-4xl); padding-bottom: var(--space-3xl); }
  .section-rhythm-default { padding-top: var(--space-3xl); padding-bottom: var(--space-3xl); }
  .section-rhythm-breath { padding-top: var(--space-4xl); padding-bottom: var(--space-4xl); }
  .section-rhythm-before-footer { padding-top: var(--space-3xl); padding-bottom: var(--space-4xl); }
  .page-wrapper .section { display: flex; flex-direction: column; gap: var(--space-xl); }
  .page-wrapper .section.section-alt { flex-direction: row; align-items: center; }
  .page-wrapper .section.section-alt.section-alt-reverse { flex-direction: row-reverse; }
  .page-wrapper .section.section-alt .section-img-wrap { flex: 0 0 42%; max-width: 420px; margin-bottom: 0; }
  .page-wrapper .section.section-alt .section-body { flex: 1; min-width: 0; }
  @media (max-width: 768px) { .page-wrapper .section.section-alt { flex-direction: column; } .page-wrapper .section.section-alt.section-alt-reverse { flex-direction: column; } .page-wrapper .section.section-alt .section-img-wrap { max-width: none; } }
  .page-wrapper [data-scroll-in] { opacity: 0; transform: translateY(36px); transition: opacity 1.05s var(--hell-ease), transform 1.05s var(--hell-ease); }
  .page-wrapper [data-scroll-in].in-view { opacity: 1; transform: translateY(0); }
  @media (prefers-reduced-motion: reduce) {
    .page-wrapper [data-scroll-in] { opacity: 1; transform: none; transition: none; }
  }
`;

function makeTemplate(
  id: string,
  name: string,
  description: string,
  css: string
): TemplateOption {
  return {
    id,
    industryId: 'general',
    styleId: id as TemplateOption['styleId'],
    name,
    description,
    css: commonBase + css,
  };
}

/** テンプレ3〜10用の共通CSS（プレビュー用） */
const GENERIC_TEMPLATE_CSS = `
  .page-wrapper.template-bakery, .page-wrapper.template-clinic_chiropractic, .page-wrapper.template-gym_yoga, .page-wrapper.template-builder, .page-wrapper.template-professional, .page-wrapper.template-cram_school, .page-wrapper.template-izakaya, .page-wrapper.template-pet_salon { --tp-bg: #F9F9F7; --tp-heading: #1A1A1A; --tp-text: #333; --tp-accent: #666; --tp-border: #e8e8e8; --tp-bg-footer: #F5F5F2; --hero-min-h: 75vh; background: var(--tp-bg); color: var(--tp-heading); }
  .page-wrapper.template-bakery .container, .page-wrapper.template-clinic_chiropractic .container, .page-wrapper.template-gym_yoga .container, .page-wrapper.template-builder .container, .page-wrapper.template-professional .container, .page-wrapper.template-cram_school .container, .page-wrapper.template-izakaya .container, .page-wrapper.template-pet_salon .container { max-width: 960px; margin: 0 auto; padding: 0 24px; }
  .page-wrapper.template-bakery header, .page-wrapper.template-clinic_chiropractic header, .page-wrapper.template-gym_yoga header, .page-wrapper.template-builder header, .page-wrapper.template-professional header, .page-wrapper.template-cram_school header, .page-wrapper.template-izakaya header, .page-wrapper.template-pet_salon header { padding: 20px 0; border-bottom: 1px solid var(--tp-border); }
  .page-wrapper.template-bakery .cta-btn, .page-wrapper.template-clinic_chiropractic .cta-btn, .page-wrapper.template-gym_yoga .cta-btn, .page-wrapper.template-builder .cta-btn, .page-wrapper.template-professional .cta-btn, .page-wrapper.template-cram_school .cta-btn, .page-wrapper.template-izakaya .cta-btn, .page-wrapper.template-pet_salon .cta-btn { background: #1a1a1a; color: #fff; border: none; padding: 14px 28px; }
  .page-wrapper.template-bakery .hero-full-img, .page-wrapper.template-clinic_chiropractic .hero-full-img, .page-wrapper.template-gym_yoga .hero-full-img, .page-wrapper.template-builder .hero-full-img, .page-wrapper.template-professional .hero-full-img, .page-wrapper.template-cram_school .hero-full-img, .page-wrapper.template-izakaya .hero-full-img, .page-wrapper.template-pet_salon .hero-full-img { min-height: var(--hero-min-h); }
`;

export const TEMPLATES: TemplateOption[] = [
  makeTemplate('salon_barber', '個人美容室・理容室', '予約動線・雑誌風レイアウト（GOALD/LECO/ALBUM参照）', `
  .page-wrapper.template-salon_barber { --tp-bg: #fff; --tp-heading: #1a1a1a; --tp-text: #333; --tp-accent: #000; --tp-border: #e8e8e8; --tp-bg-footer: #f5f5f5; --hero-min-h: 75vh; background: var(--tp-bg); font-family: "Hiragino Sans", "Noto Sans JP", sans-serif; }
  .page-wrapper.template-salon_barber .container { max-width: 960px; margin: 0 auto; padding: 0 24px; }
  .page-wrapper.template-salon_barber header { padding: 20px 0; border-bottom: 1px solid var(--tp-border); }
  .page-wrapper.template-salon_barber .logo { font-size: 1.5rem; font-weight: 600; letter-spacing: 0.12em; }
  .page-wrapper.template-salon_barber .cta-btn { background: #000; color: #fff; border: none; padding: 14px 28px; }
  .page-wrapper.template-salon_barber .hero-full-img { min-height: var(--hero-min-h); }
  `),
  makeTemplate(
    'cafe_tea',
    '隠れ家カフェ・喫茶店',
    '落ち着いたトーン・メニュー表の美しさ（旧4番）',
    (() => {
      const wo = `
  .page-wrapper.template-cafe_tea { --tp-bg: #f2efe8; --tp-heading: #2c2418; --tp-text: #5c5348; --tp-accent: #b45309; --tp-brand: #3d5245; --tp-band: #ebe8e0; --tp-hours-bg: #e5dfd2; --tp-border: rgba(61,82,69,0.2); --hero-min-h: 72vh; font-family: "Hiragino Sans", "Noto Sans JP", sans-serif; color: var(--tp-text); background: var(--tp-bg); }
  .page-wrapper.template-cafe_tea .container { padding: 0 var(--space-lg); max-width: 56rem; margin: 0 auto; }
  @media (min-width: 1024px) { .page-wrapper.template-cafe_tea .container { padding: 0 var(--space-2xl); } }
  .page-wrapper.template-cafe_tea header { display: none; }
  .page-wrapper.template-cafe_tea .section.wo-sec { border: none; border-radius: 0; margin-bottom: 0; background: var(--tp-bg); border-bottom: 1px solid rgba(44,36,24,0.06); }
  .page-wrapper.template-cafe_tea .wo-hero { position: relative; min-height: var(--hero-min-h); overflow: hidden; background: var(--tp-brand); }
  .page-wrapper.template-cafe_tea .wo-hero-inner { position: absolute; left: 0; right: 0; bottom: 0; z-index: 10; text-align: center; padding: 2rem 1.5rem 4.5rem; color: #fff; }
  .page-wrapper.template-cafe_tea .cta-btn { background: #fff; color: var(--tp-brand); font-weight: 600; border: none; }
  .page-wrapper.template-cafe_tea footer.footer-wo { background: var(--tp-brand); color: #fff; padding: var(--space-2xl); }
  `;
      return wo;
    })(),
  ),
  makeTemplate(
    'bakery',
    '街のパン屋・ケーキ屋',
    '焼き立て・本日のラインナップ・温かみのある配色',
    GENERIC_TEMPLATE_CSS
  ),
  makeTemplate(
    'clinic_chiropractic',
    '整骨院・整体・鍼灸',
    '清潔感と信頼感・院長の顔写真と選ばれる理由',
    GENERIC_TEMPLATE_CSS
  ),
  makeTemplate(
    'gym_yoga',
    'パーソナルジム・ヨガ',
    'ビフォーアフター・体験予約・やる気を起こさせる動き',
    GENERIC_TEMPLATE_CSS
  ),
  makeTemplate(
    'builder',
    '工務店・リノベ',
    '施工事例ギャラリー・職人のこだわり',
    GENERIC_TEMPLATE_CSS
  ),
  makeTemplate(
    'professional',
    '士業',
    'ネイビー・白の整然としたグリッド',
    GENERIC_TEMPLATE_CSS
  ),
  makeTemplate(
    'cram_school',
    '塾・習い事教室',
    '親御さんが安心する優しいトーン',
    GENERIC_TEMPLATE_CSS
  ),
  makeTemplate(
    'izakaya',
    'こだわり居酒屋・バー',
    '夜の雰囲気・ダーク配色',
    GENERIC_TEMPLATE_CSS
  ),
  makeTemplate(
    'pet_salon',
    'ペットサロン・ドッグ',
    'プロの専門性と安心感',
    GENERIC_TEMPLATE_CSS
  ),
];