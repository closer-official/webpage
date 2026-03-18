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
  .page-wrapper .presented-by a { color: inherit; text-decoration: none; }
  .page-wrapper .presented-by a:hover { text-decoration: underline; }
  .page-wrapper .qr-block { margin-top: var(--space-lg); text-align: center; }
  .page-wrapper .qr-block img { max-width: 120px; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.08)); }
  .page-wrapper .section-payment .section-payment-note { font-size: 0.9375rem; color: var(--tp-text); margin: 0 0 1rem; }
  .page-wrapper .payment-iframe-wrap { width: 100%; min-height: 420px; border: 1px solid var(--tp-border); border-radius: 8px; overflow: hidden; background: #f8f8f8; }
  .page-wrapper .payment-iframe { width: 100%; height: 520px; border: 0; display: block; }
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

/** テンプレ3〜11用の共通CSS（プレビュー用・builder・clinic・gym 除く） */
const GENERIC_TEMPLATE_CSS = `
  .page-wrapper.template-professional, .page-wrapper.template-cram_school, .page-wrapper.template-izakaya, .page-wrapper.template-pet_salon, .page-wrapper.template-apparel, .page-wrapper.template-event { --tp-bg: #F9F9F7; --tp-heading: #1A1A1A; --tp-text: #333; --tp-accent: #666; --tp-border: #e8e8e8; --tp-bg-footer: #F5F5F2; --hero-min-h: 75vh; background: var(--tp-bg); color: var(--tp-heading); }
  .page-wrapper.template-professional .container, .page-wrapper.template-cram_school .container, .page-wrapper.template-izakaya .container, .page-wrapper.template-pet_salon .container, .page-wrapper.template-apparel .container, .page-wrapper.template-event .container { max-width: 960px; margin: 0 auto; padding: 0 24px; }
  .page-wrapper.template-professional header, .page-wrapper.template-cram_school header, .page-wrapper.template-izakaya header, .page-wrapper.template-pet_salon header, .page-wrapper.template-apparel header, .page-wrapper.template-event header { padding: 20px 0; border-bottom: 1px solid var(--tp-border); }
  .page-wrapper.template-professional .cta-btn, .page-wrapper.template-cram_school .cta-btn, .page-wrapper.template-izakaya .cta-btn, .page-wrapper.template-pet_salon .cta-btn, .page-wrapper.template-apparel .cta-btn, .page-wrapper.template-event .cta-btn { background: #1a1a1a; color: #fff; border: none; padding: 14px 28px; }
  .page-wrapper.template-professional .hero-full-img, .page-wrapper.template-cram_school .hero-full-img, .page-wrapper.template-izakaya .hero-full-img, .page-wrapper.template-pet_salon .hero-full-img, .page-wrapper.template-apparel .hero-full-img, .page-wrapper.template-event .hero-full-img { min-height: var(--hero-min-h); }
`;

/** 整骨院・整体・鍼灸用（悩み→選ばれる理由→実績→図解・透明感・視認性） */
const CLINIC_TEMPLATE_CSS = `
  .page-wrapper.template-clinic_chiropractic { --tp-bg: #F8FAFB; --tp-heading: #1a2b34; --tp-text: #333; --tp-accent: #5eb5c0; --tp-border: #e2e8ec; --tp-bg-footer: #eef2f4; --hero-min-h: 58vh; font-family: "Hiragino Sans", "Noto Sans JP", sans-serif; background: var(--tp-bg); color: var(--tp-heading); font-weight: 500; }
  .page-wrapper.template-clinic_chiropractic .container { max-width: 960px; margin: 0 auto; padding: 0 24px; }
  .page-wrapper.template-clinic_chiropractic header { position: sticky; top: 0; z-index: 100; padding: 14px 0; border-bottom: 1px solid var(--tp-border); background: #fff; }
  .page-wrapper.template-clinic_chiropractic .cta-btn { background: var(--tp-accent); color: #fff; border: none; padding: 14px 28px; min-height: 48px; font-weight: 600; border-radius: 999px; }
  .page-wrapper.template-clinic_chiropractic .hero-full-img { min-height: var(--hero-min-h); }
  .page-wrapper.template-clinic_chiropractic .hero-bg-overlay { background: rgba(0,0,0,0.35); }
  .page-wrapper.template-clinic_chiropractic .hero-inner h1 { font-size: clamp(1.5rem, 4.5vw, 2.25rem); font-weight: 700; color: #fff; text-shadow: 0 2px 16px rgba(0,0,0,0.5); }
  .page-wrapper.template-clinic_chiropractic .hero-inner .subheadline { color: rgba(255,255,255,0.95); font-weight: 500; text-shadow: 0 1px 8px rgba(0,0,0,0.4); }
  .clinic-symptoms { padding: var(--space-2xl) var(--space-lg); background: var(--tp-bg); }
  .clinic-symptoms h2 { font-size: 1.125rem; font-weight: 700; color: var(--tp-heading); margin: 0 0 1.25rem; text-align: center; }
  .clinic-symptoms-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.75rem; max-width: 28rem; margin-left: auto; margin-right: auto; }
  .clinic-symptoms-list li { font-size: 1rem; font-weight: 500; color: var(--tp-text); padding: 0.6rem 1rem; background: #fff; border-radius: 8px; border: 1px solid var(--tp-border); }
  .clinic-symptoms-list li::before { content: ''; display: inline-block; width: 6px; height: 6px; background: var(--tp-accent); border-radius: 50%; margin-right: 0.6rem; vertical-align: 0.2em; }
  .clinic-cta-banner { display: block; text-align: center; padding: 1rem 1.5rem; margin-top: 1.5rem; background: var(--tp-accent); color: #fff; font-weight: 700; font-size: 1rem; text-decoration: none; border-radius: 8px; }
  .clinic-reasons { padding: var(--space-2xl) var(--space-lg); background: #fff; border-top: 1px solid var(--tp-border); }
  .clinic-reasons h2 { font-size: 1rem; font-weight: 700; letter-spacing: 0.08em; color: var(--tp-heading); margin: 0 0 1.5rem; text-align: center; }
  .clinic-reason-list { display: flex; flex-direction: column; gap: 1.5rem; max-width: 32rem; margin: 0 auto; }
  .clinic-reason-item { display: flex; gap: 1rem; align-items: flex-start; text-align: left; }
  .clinic-reason-num { flex-shrink: 0; width: 2.5rem; height: 2.5rem; display: flex; align-items: center; justify-content: center; background: var(--tp-accent); color: #fff; font-size: 0.8125rem; font-weight: 700; border-radius: 50%; }
  .clinic-reason-body h3 { font-size: 1.0625rem; font-weight: 700; color: var(--tp-heading); margin: 0 0 0.35rem; }
  .clinic-reason-body p { font-size: 0.9375rem; line-height: 1.8; color: var(--tp-text); margin: 0; }
  .clinic-stats-wrap { padding: var(--space-xl) var(--space-lg); background: linear-gradient(180deg, rgba(94,181,192,0.12) 0%, transparent 100%); }
  .clinic-stats-wrap .stats-block { display: flex; flex-wrap: wrap; justify-content: center; gap: 2rem; margin: 0; }
  .clinic-stats-wrap .stat-value { font-size: 2rem; font-weight: 800; color: var(--tp-accent); display: block; }
  .clinic-stats-wrap .stat-label { font-size: 0.875rem; font-weight: 500; color: var(--tp-text); margin-top: 0.25rem; }
  .clinic-diagram { padding: var(--space-2xl) var(--space-lg); background: var(--tp-bg); }
  .clinic-diagram h2 { font-size: 0.9375rem; font-weight: 700; letter-spacing: 0.06em; color: var(--tp-heading); margin: 0 0 1.25rem; text-align: center; }
  .clinic-diagram-circles { display: flex; align-items: center; justify-content: center; gap: 0.5rem; flex-wrap: wrap; margin: 0 auto; max-width: 20rem; }
  .clinic-diagram-circles span { width: 4.5rem; height: 4.5rem; display: flex; align-items: center; justify-content: center; background: rgba(94,181,192,0.2); color: var(--tp-heading); font-size: 0.75rem; font-weight: 700; border: 2px solid var(--tp-accent); border-radius: 50%; }
  .page-wrapper.template-clinic_chiropractic .section h2 { font-size: 1rem; font-weight: 700; letter-spacing: 0.05em; color: var(--tp-heading); margin: 0 0 0.75rem; }
  .page-wrapper.template-clinic_chiropractic .section p { font-size: 1rem; line-height: 1.85; color: var(--tp-text); font-weight: 500; }
  .page-wrapper.template-clinic_chiropractic .section-img-wrap { border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
  .page-wrapper.template-clinic_chiropractic footer { padding: var(--space-2xl) 0; border-top: 1px solid var(--tp-border); background: var(--tp-bg-footer); }
  .page-wrapper.template-clinic_chiropractic .clinic-map-wrap { margin-top: 1rem; border-radius: 10px; overflow: hidden; }
  .page-wrapper.template-clinic_chiropractic .qr-block .qr-block-mobile-note { font-size: 0.875rem; margin-bottom: 0.75rem; }
  @media (max-width: 768px) { .page-wrapper.template-clinic_chiropractic .qr-block .qr-block-img { display: none; } }
`;

/** パーソナルジム・ヨガ用（黒×ゴールド・実績の巨大化・選ばれる理由・固定CTA・シャープ） */
const GYM_TEMPLATE_CSS = `
  .page-wrapper.template-gym_yoga { --tp-bg: #fff; --tp-heading: #0a0a0a; --tp-text: #1a1a1a; --tp-accent: #c9a227; --tp-border: #e5e5e5; --tp-bg-footer: #0a0a0a; --hero-min-h: 70vh; font-family: "Hiragino Sans", "Noto Sans JP", sans-serif; font-weight: 600; background: var(--tp-bg); }
  .page-wrapper.template-gym_yoga .container { max-width: 960px; margin: 0 auto; padding: 0 24px; }
  .page-wrapper.template-gym_yoga header { position: sticky; top: 0; z-index: 100; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.15); background: #0a0a0a; }
  .page-wrapper.template-gym_yoga .logo { font-size: 1.125rem; font-weight: 800; color: #fff; text-decoration: none; letter-spacing: 0.08em; }
  .page-wrapper.template-gym_yoga .nav-link { color: rgba(255,255,255,0.9); }
  .page-wrapper.template-gym_yoga .cta-btn { background: var(--tp-accent); color: #0a0a0a; border: none; padding: 12px 24px; min-height: 44px; font-weight: 700; letter-spacing: 0.08em; border-radius: 0; }
  .page-wrapper.template-gym_yoga .hero-full-img { min-height: var(--hero-min-h); }
  .page-wrapper.template-gym_yoga .hero-bg-overlay { background: rgba(0,0,0,0.55); }
  .page-wrapper.template-gym_yoga .hero-inner h1 { font-size: clamp(1.5rem, 4.5vw, 2.5rem); font-weight: 800; color: #fff; letter-spacing: 0.04em; text-shadow: 0 2px 20px rgba(0,0,0,0.5); }
  .page-wrapper.template-gym_yoga .hero-inner .subheadline { color: rgba(255,255,255,0.95); font-weight: 600; text-shadow: 0 1px 12px rgba(0,0,0,0.4); }
  .gym-results-block { padding: var(--space-2xl) var(--space-lg); background: #0a0a0a; color: #fff; }
  .gym-results-block h2 { font-size: 0.875rem; font-weight: 700; letter-spacing: 0.15em; color: var(--tp-accent); margin: 0 0 1.5rem; text-align: center; }
  .gym-results-stats { display: flex; flex-wrap: wrap; justify-content: center; gap: 2rem 3rem; margin: 0; }
  .gym-results-stats .gym-stat-value { font-size: clamp(2rem, 6vw, 3.5rem); font-weight: 800; color: var(--tp-accent); display: block; }
  .gym-results-stats .gym-stat-label { font-size: 0.875rem; font-weight: 600; color: rgba(255,255,255,0.85); margin-top: 0.35rem; }
  .gym-reasons-block { padding: var(--space-2xl) var(--space-lg); background: #fff; border-top: 3px solid var(--tp-accent); }
  .gym-reasons-block h2 { font-size: 0.9375rem; font-weight: 800; letter-spacing: 0.1em; color: var(--tp-heading); margin: 0 0 1.5rem; text-align: center; }
  .gym-reason-list { display: flex; flex-direction: column; gap: 1.5rem; max-width: 36rem; margin: 0 auto; }
  .gym-reason-item { display: flex; gap: 1rem; align-items: flex-start; padding: 1rem 0; border-bottom: 1px solid var(--tp-border); border-radius: 0; }
  .gym-reason-num { flex-shrink: 0; width: 2.75rem; height: 2.75rem; display: flex; align-items: center; justify-content: center; background: #0a0a0a; color: var(--tp-accent); font-size: 0.8125rem; font-weight: 800; border-radius: 0; }
  .gym-reason-body h3 { font-size: 1.0625rem; font-weight: 800; color: var(--tp-heading); margin: 0 0 0.35rem; }
  .gym-reason-body p { font-size: 0.9375rem; line-height: 1.8; color: var(--tp-text); margin: 0; font-weight: 500; }
  .page-wrapper.template-gym_yoga .section h2 { font-size: 1rem; font-weight: 800; letter-spacing: 0.05em; }
  .page-wrapper.template-gym_yoga .section-img-wrap { border-radius: 0; overflow: hidden; border: 1px solid var(--tp-border); }
  .page-wrapper.template-gym_yoga footer { padding: var(--space-2xl) 0; border-top: 3px solid var(--tp-accent); background: var(--tp-bg-footer); color: #fff; }
  .page-wrapper.template-gym_yoga footer .footer-brand { color: var(--tp-accent); }
  .gym-sticky-cta { position: fixed; bottom: 0; left: 0; right: 0; z-index: 90; display: flex; align-items: center; justify-content: center; gap: 1rem; padding: 12px 16px; background: #0a0a0a; border-top: 2px solid var(--tp-accent); }
  .gym-sticky-cta .cta-btn { flex: 1; max-width: 320px; }
  .page-wrapper.template-gym_yoga main { padding-bottom: 80px; }
  .page-wrapper.template-gym_yoga .gym-map-wrap { margin-top: 1rem; border-radius: 0; overflow: hidden; }
  @media (max-width: 768px) { .page-wrapper.template-gym_yoga .qr-block .qr-block-img { display: none; } }
`;

/** 塾・習い事教室用（信頼ブロック直下・曲線区切り・円形バッジ・固定フッター2CTA・親しみやすさ） */
const CRAM_SCHOOL_TEMPLATE_CSS = `
  .page-wrapper.template-cram_school { --cram-bg: #FDFBF7; --cram-heading: #2c2418; --cram-text: #4a4238; --cram-accent: #c73e3a; --tp-bg: var(--cram-bg); --tp-heading: var(--cram-heading); --tp-text: var(--cram-text); --tp-accent: var(--cram-accent); --tp-border: rgba(44,36,24,0.1); --tp-bg-footer: #f5f2ed; --hero-min-h: 58vh; font-family: "Hiragino Sans", "Noto Sans JP", sans-serif; font-weight: 500; background: var(--tp-bg); color: var(--tp-heading); }
  .page-wrapper.template-cram_school .container { max-width: 960px; margin: 0 auto; padding: 0 24px; }
  .page-wrapper.template-cram_school header { position: sticky; top: 0; z-index: 100; padding: 14px 0; border-bottom: 1px solid var(--tp-border); background: #fff; }
  .page-wrapper.template-cram_school .logo { font-size: 1.125rem; font-weight: 700; color: var(--cram-accent); text-decoration: none; }
  .page-wrapper.template-cram_school .nav-link { color: var(--cram-text); font-size: 0.9375rem; }
  .page-wrapper.template-cram_school .cta-btn { background: var(--cram-accent); color: #fff; border: none; padding: 14px 28px; min-height: 48px; font-weight: 600; border-radius: 999px; font-size: 0.9375rem; }
  .page-wrapper.template-cram_school .hero-full-img { min-height: var(--hero-min-h); }
  .page-wrapper.template-cram_school .hero-bg-overlay { background: rgba(0,0,0,0.25); }
  .page-wrapper.template-cram_school .hero-inner h1 { font-size: clamp(1.35rem, 4vw, 2rem); font-weight: 700; color: #fff; text-shadow: 0 2px 16px rgba(0,0,0,0.4); }
  .page-wrapper.template-cram_school .hero-inner .subheadline { color: rgba(255,255,255,0.95); font-size: 0.9375rem; text-shadow: 0 1px 8px rgba(0,0,0,0.35); }
  .cram-trust { padding: 1.5rem 1rem 2rem; background: linear-gradient(180deg, var(--cram-accent) 0%, #b53531 100%); position: relative; }
  .cram-trust::after { content: ''; position: absolute; bottom: -12px; left: 0; right: 0; height: 24px; background: var(--cram-bg); border-radius: 24px 24px 0 0; }
  .cram-trust-badges { display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem 1.5rem; margin: 0; padding: 0; list-style: none; }
  .cram-trust-badges li { display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 100px; padding: 1rem 1.25rem; background: #fff; border-radius: 50%; box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
  .cram-trust-badges .cram-badge-value { font-size: 1.25rem; font-weight: 800; color: var(--cram-accent); line-height: 1.2; display: block; }
  .cram-trust-badges .cram-badge-label { font-size: 0.75rem; font-weight: 600; color: var(--cram-text); margin-top: 0.25rem; text-align: center; }
  .cram-cta-primary-wrap { text-align: center; padding: 1.5rem 1rem 2rem; }
  .cram-cta-primary-wrap .cta-btn { min-height: 52px; padding: 16px 40px; font-size: 1rem; }
  .cram-segment { padding: 0 1rem 2rem; }
  .cram-segment h2 { font-size: 0.875rem; font-weight: 700; letter-spacing: 0.08em; color: var(--cram-heading); margin: 0 0 1rem; text-align: center; }
  .cram-segment-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; max-width: 28rem; margin: 0 auto; }
  .cram-segment-grid a { display: flex; align-items: center; justify-content: center; min-height: 48px; padding: 0.875rem 1rem; background: #fff; border: 2px solid var(--tp-border); border-radius: 12px; color: var(--cram-heading); font-weight: 600; font-size: 0.9375rem; text-decoration: none; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
  .cram-segment-grid a:hover { border-color: var(--cram-accent); color: var(--cram-accent); background: rgba(199,62,58,0.04); }
  .cram-reasons { padding: 2rem 1rem; background: #fff; position: relative; }
  .cram-reasons::before { content: ''; position: absolute; top: -12px; left: 0; right: 0; height: 24px; background: #fff; border-radius: 0 0 24px 24px; }
  .cram-reasons h2 { font-size: 1rem; font-weight: 700; letter-spacing: 0.06em; color: var(--cram-heading); margin: 0 0 1.5rem; text-align: center; }
  .cram-reason-list { display: flex; flex-direction: column; gap: 1.25rem; max-width: 32rem; margin: 0 auto; }
  .cram-reason-item { display: flex; gap: 1rem; align-items: flex-start; padding: 1rem; background: var(--cram-bg); border-radius: 12px; border-left: 4px solid var(--cram-accent); }
  .cram-reason-num { flex-shrink: 0; width: 2.25rem; height: 2.25rem; display: flex; align-items: center; justify-content: center; background: var(--cram-accent); color: #fff; font-size: 0.8125rem; font-weight: 800; border-radius: 50%; }
  .cram-reason-body h3 { font-size: 1rem; font-weight: 700; color: var(--cram-heading); margin: 0 0 0.35rem; }
  .cram-reason-body p { font-size: 0.9375rem; line-height: 1.75; color: var(--cram-text); margin: 0; }
  .page-wrapper.template-cram_school .section { position: relative; }
  .page-wrapper.template-cram_school .section::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 20px; background: var(--tp-bg); border-radius: 0 0 20px 20px; }
  .page-wrapper.template-cram_school .section h2 { font-size: 1.125rem; font-weight: 700; color: var(--cram-heading); margin: 0 0 0.75rem; }
  .page-wrapper.template-cram_school .section p { font-size: 1rem; line-height: 1.8; color: var(--cram-text); }
  .page-wrapper.template-cram_school .section-rhythm-after-hero { padding-top: 2rem; padding-bottom: 2rem; }
  .page-wrapper.template-cram_school .section-rhythm-default { padding-top: 2rem; padding-bottom: 2rem; }
  .page-wrapper.template-cram_school .section-img-wrap { border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
  .page-wrapper.template-cram_school footer { padding: 3rem 0 100px; border-top: 1px solid var(--tp-border); background: var(--tp-bg-footer); }
  .cram-sticky-cta { position: fixed; bottom: 0; left: 0; right: 0; z-index: 90; display: flex; gap: 0.75rem; padding: 12px 16px; background: #fff; border-top: 2px solid var(--tp-border); box-shadow: 0 -4px 20px rgba(0,0,0,0.08); }
  .cram-sticky-cta .cta-btn { flex: 1; min-height: 48px; border-radius: 999px; }
  .cram-sticky-cta .cta-btn-secondary { background: #fff; color: var(--cram-accent); border: 2px solid var(--cram-accent); }
  .page-wrapper.template-cram_school main { padding-bottom: 88px; }
  .page-wrapper.template-cram_school .cram-map-wrap { margin-top: 1rem; border-radius: 16px; overflow: hidden; border: 1px solid var(--tp-border); }
  @media (max-width: 768px) { .page-wrapper.template-cram_school .qr-block .qr-block-img { display: none; } }
`;

/** 工務店・リノベ用（SUPPOSE 参照・洗練されたミニマリズム・白黒・ハンバーガーメニュー） */
const BUILDER_TEMPLATE_CSS = `
  .page-wrapper.template-builder { --tp-bg: #fff; --tp-heading: #0a0a0a; --tp-text: #1a1a1a; --tp-border: #e5e5e5; font-family: "Hiragino Sans", "Noto Sans JP", sans-serif; }
  .page-wrapper.template-builder .container { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
  .builder-views { position: relative; width: 100%; min-height: 100vh; }
  .builder-view { position: fixed; inset: 0; z-index: 20; overflow-y: auto; display: none; background: #fff; }
  .builder-view.active { display: block; }
  .builder-view-hero { position: fixed; inset: 0; display: none; z-index: 25; }
  .builder-view-hero.active { display: block; }
  .builder-view-hero .builder-hero-bg { position: absolute; inset: 0; background-size: cover; background-position: center; background-color: #111; }
  .builder-view-hero .builder-hero-bg::after { content: ''; position: absolute; inset: 0; background: rgba(0,0,0,0.35); }
  .builder-view-hero .builder-hero-overlay { position: absolute; inset: 0; display: flex; flex-direction: column; padding: 24px; color: #fff; pointer-events: none; }
  .builder-view-hero .builder-hero-overlay a { pointer-events: auto; }
  .builder-view-hero .builder-hero-search { font-size: 0.75rem; letter-spacing: 0.15em; opacity: 0.9; }
  .builder-view-hero .builder-hero-logo { position: absolute; bottom: 24px; left: 24px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; line-height: 1.4; }
  .builder-view-hero .builder-hero-copy { flex: 1; display: flex; flex-direction: column; justify-content: center; }
  .builder-view-hero .builder-hero-catchphrase { font-size: 0.875rem; letter-spacing: 0.06em; margin: 0 0 0.25rem; opacity: 0.95; }
  .builder-view-hero .builder-hero-title { font-size: clamp(1.35rem, 4vw, 2rem); font-weight: 600; letter-spacing: 0.08em; margin: 0; text-shadow: 0 2px 20px rgba(0,0,0,0.4); }
  .builder-view-hero .builder-hero-menu-btn { position: absolute; bottom: 24px; right: 24px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #fff; text-decoration: none; }
  .builder-view-hero .builder-hero-dots { position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px; }
  .builder-view-hero .builder-hero-dots span { width: 6px; height: 6px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.8); background: transparent; }
  .builder-view-menu { background: #0a0a0a; color: #fff; padding: 32px 24px 48px; }
  .builder-view-menu .builder-menu-inner { max-width: 320px; }
  .builder-view-menu .builder-nav-close { display: inline-block; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #fff; text-decoration: none; margin-bottom: 2rem; }
  .builder-view-menu .builder-nav-primary { display: flex; flex-direction: column; gap: 1.25rem; margin-top: 2rem; }
  .builder-view-menu .builder-nav-primary a { font-size: 1.5rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #fff; text-decoration: none; }
  .builder-view-menu .builder-nav-secondary { margin-top: 2.5rem; display: flex; flex-direction: column; gap: 0.6rem; }
  .builder-view-menu .builder-nav-secondary a { font-size: 0.8125rem; color: rgba(255,255,255,0.8); text-decoration: none; text-transform: lowercase; }
  .builder-content-bar { padding: 20px 24px; border-bottom: 1px solid var(--tp-border); background: #fff; }
  .builder-content-bar a { font-size: 0.8125rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--tp-heading); text-decoration: none; }
  .builder-content-inner { padding: 48px 0 80px; }
  .page-wrapper.template-builder .section h2 { font-size: 0.8125rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #888; margin-bottom: 1rem; }
  .page-wrapper.template-builder .section p { font-size: 0.9375rem; line-height: 1.85; letter-spacing: 0.02em; color: var(--tp-text); }
  .page-wrapper.template-builder .section-img-wrap { margin-bottom: 1.25rem; overflow: hidden; }
  .page-wrapper.template-builder .section-img { width: 100%; height: auto; max-height: 420px; object-fit: cover; display: block; }
`;

export const TEMPLATES: TemplateOption[] = [
  makeTemplate('salon_barber', '個人美容室・理容室', '予約動線・雑誌風レイアウト（GOALD/LECO/ALBUM参照）', `
  .page-wrapper.template-salon_barber { --tp-bg: #fff; --tp-heading: #1a1a1a; --tp-text: #333; --tp-text-muted: #666; --tp-accent: #000; --tp-border: #e8e8e8; --tp-bg-footer: #f5f5f5; --hero-min-h: 75vh; background: var(--tp-bg); font-family: "Hiragino Sans", "Noto Sans JP", sans-serif; }
  .page-wrapper.template-salon_barber .container { max-width: 960px; margin: 0 auto; padding: 0 24px; }
  .page-wrapper.template-salon_barber header { position: sticky; top: 0; z-index: 100; padding: 16px 0; border-bottom: 1px solid var(--tp-border); background: #fff; }
  .page-wrapper.template-salon_barber .header-inner { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; width: 100%; }
  .page-wrapper.template-salon_barber .logo { font-size: 1.25rem; font-weight: 700; letter-spacing: 0.12em; text-decoration: none; color: var(--tp-heading); }
  .page-wrapper.template-salon_barber .cta-btn { background: #000; color: #fff; border: none; padding: 12px 24px; min-height: 44px; }
  .page-wrapper.template-salon_barber .hero-full-img { min-height: var(--hero-min-h); }
  .page-wrapper.template-salon_barber .hero-bg-overlay { background: rgba(0,0,0,0.5); }
  .page-wrapper.template-salon_barber .salon-sec-title { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--tp-text-muted); margin: 0 0 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--tp-border); }
  .page-wrapper.template-salon_barber .section-concept-lede .section-concept-prose { text-align: left; }
  .page-wrapper.template-salon_barber .salon-hours-dl { margin: 0; display: grid; gap: 0.5rem 1.5rem; }
  .page-wrapper.template-salon_barber .salon-catalog-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .page-wrapper.template-salon_barber .salon-catalog-img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 6px; }
  .page-wrapper.template-salon_barber .salon-form-control { width: 100%; padding: 0.75rem 1rem; border: 1px solid var(--tp-border); border-radius: 6px; }
  .page-wrapper.template-salon_barber .salon-form-submit { min-height: 48px; padding: 0.875rem 2rem; background: #000; color: #fff; border: none; }
  `),
  makeTemplate(
    'cafe_tea',
    'カフェ・喫茶・パン・スイーツ',
    '落ち着いたトーン・メニュー表の美しさ（カフェ・パン屋共通）',
    (() => {
      const wo = `
  .page-wrapper.template-cafe_tea { --tp-bg: #f2efe8; --tp-heading: #2c2418; --tp-text: #5c5348; --tp-accent: #b45309; --tp-brand: #3d5245; --tp-border: rgba(61,82,69,0.2); --hero-min-h: 72vh; font-family: "Hiragino Sans", "Noto Sans JP", sans-serif; color: var(--tp-text); background: var(--tp-bg); }
  .page-wrapper.template-cafe_tea .container { padding: 0 var(--space-lg); max-width: 56rem; margin: 0 auto; }
  .page-wrapper.template-cafe_tea header { display: none; }
  .page-wrapper.template-cafe_tea .section.wo-sec { border: none; margin-bottom: 0; background: var(--tp-bg); border-bottom: 1px solid rgba(44,36,24,0.06); }
  .page-wrapper.template-cafe_tea .wo-hero { position: relative; min-height: var(--hero-min-h); overflow: hidden; background: var(--tp-brand); }
  .page-wrapper.template-cafe_tea .wo-hero-inner { position: absolute; left: 0; right: 0; bottom: 0; z-index: 10; text-align: left; padding: 2rem 1.5rem 4rem; color: #fff; text-shadow: 0 2px 20px rgba(0,0,0,0.5); }
  .page-wrapper.template-cafe_tea .cta-btn { background: #fff; color: var(--tp-brand); font-weight: 600; border: none; min-height: 48px; padding: 0.75rem 1.5rem; }
  .page-wrapper.template-cafe_tea .wo-nav-drawer a { min-height: 48px; padding: 0.75rem 1rem; display: flex; align-items: center; }
  .page-wrapper.template-cafe_tea .wo-lede-prose p, .page-wrapper.template-cafe_tea .wo-sec-prose p { line-height: 1.9; }
  .page-wrapper.template-cafe_tea .section-img-wrap { border-radius: 12px; overflow: hidden; }
  .page-wrapper.template-cafe_tea .section-img-wrap.wo-img-wide .section-img { aspect-ratio: 16/10; object-fit: cover; }
  .page-wrapper.template-cafe_tea .section-img-wrap.wo-img-tall .section-img { aspect-ratio: 3/4; object-fit: cover; }
  .page-wrapper.template-cafe_tea .wo-faq-item { border-bottom: 1px solid rgba(44,36,24,0.1); }
  .page-wrapper.template-cafe_tea .wo-faq-q { width: 100%; padding: 1rem 0; text-align: left; background: none; border: none; font-size: 1rem; cursor: pointer; }
  .page-wrapper.template-cafe_tea .wo-faq-a { max-height: 0; overflow: hidden; transition: max-height 0.35s ease; }
  .page-wrapper.template-cafe_tea .wo-faq-item.is-open .wo-faq-a { max-height: 30em; }
  .page-wrapper.template-cafe_tea .wo-price-table { width: 100%; border-collapse: collapse; }
  .page-wrapper.template-cafe_tea .wo-price-table td { padding: 0.65rem 0.75rem; border-bottom: 1px solid rgba(44,36,24,0.12); }
  .page-wrapper.template-cafe_tea .wo-price-value { text-align: right; font-weight: 600; color: var(--tp-accent); }
  .page-wrapper.template-cafe_tea .wo-form-control { padding: 0.9rem 1.05rem; border-radius: 8px; border: 1px solid rgba(44,36,24,0.14); }
  .page-wrapper.template-cafe_tea .wo-form-submit { min-height: 48px; padding: 0.875rem 2rem; }
  .page-wrapper.template-cafe_tea .quote-block { text-align: left; border-left: 4px solid #c47c2a; padding-left: 1.25rem; background: rgba(180,83,9,0.06); }
  .page-wrapper.template-cafe_tea footer.footer-wo { background: var(--tp-brand); color: #fff; padding: var(--space-2xl); }
  .page-wrapper.template-cafe_tea .qr-block-mobile-note { font-size: 0.875rem; margin-bottom: 0.75rem; }
  @media (max-width: 768px) { .page-wrapper.template-cafe_tea .qr-block-img { display: none; } }
  `;
      return wo;
    })(),
  ),
  makeTemplate(
    'clinic_chiropractic',
    '整骨院・整体・鍼灸',
    '悩みの早期提示・選ばれる理由のナンバリング・実績・図解で信頼感',
    CLINIC_TEMPLATE_CSS
  ),
  makeTemplate(
    'gym_yoga',
    'パーソナルジム・ヨガ',
    '黒×ゴールド・実績の可視化・無料カウンセリング固定CTA・選ばれる理由',
    GYM_TEMPLATE_CSS
  ),
  makeTemplate(
    'builder',
    '工務店・リノベ',
    '洗練されたミニマリズム・白黒・ハンバーガーメニュー（SUPPOSE参照）',
    BUILDER_TEMPLATE_CSS
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
    '信頼ブロック直下・曲線区切り・円形バッジ・固定フッター2CTA（資料請求／体験申込）',
    CRAM_SCHOOL_TEMPLATE_CSS
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
  makeTemplate(
    'apparel',
    'アパレル',
    'ファッション・ブランド・コレクション',
    GENERIC_TEMPLATE_CSS
  ),
  makeTemplate(
    'event',
    'イベント',
    'フェス・セミナー・ワークショップ・お申し込み',
    GENERIC_TEMPLATE_CSS
  ),
];