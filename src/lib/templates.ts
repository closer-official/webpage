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
  .page-wrapper .hero h1 { font-size: var(--type-display); line-height: 1.08; letter-spacing: -0.02em; }
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

export const TEMPLATES: TemplateOption[] = [
  makeTemplate(
    'minimal_luxury',
    'Minimal Luxury',
    '超高級ホテル・エステ向け（A-1）',
    `
  /* A-1: オーバーホール命令書 — デザイントークン・角丸禁止・余白128px最小 */
  .page-wrapper.template-minimal_luxury { --tp-bg: #F9F9F7; --tp-heading: #1A1A1A; --tp-text: #1A1A1A; --tp-accent: #666666; --tp-border: rgba(26,26,26,0.08); --tp-bg-footer: #F5F5F2; --hero-min-h: 75vh; background: var(--tp-bg); color: var(--tp-heading); }
  .page-wrapper.template-minimal_luxury .container { max-width: 1280px; margin: 0 auto; padding: 0 32px; }
  @media (min-width: 1024px) {
    .page-wrapper.template-minimal_luxury .container { padding: 0 96px; }
  }
  .page-wrapper.template-minimal_luxury .section-rhythm-after-hero { padding-top: 128px; padding-bottom: 128px; }
  .page-wrapper.template-minimal_luxury .section-rhythm-default { padding-top: 128px; padding-bottom: 128px; }
  .page-wrapper.template-minimal_luxury .section-rhythm-breath { padding-top: 128px; padding-bottom: 128px; }
  .page-wrapper.template-minimal_luxury .section-rhythm-before-footer { padding-top: 128px; padding-bottom: 128px; }
  .page-wrapper.template-minimal_luxury header { padding: 32px 0; border-bottom: 1px solid var(--tp-border); background: transparent; }
  .page-wrapper.template-minimal_luxury header.scrolled { background: rgba(249,249,247,0.96); backdrop-filter: saturate(180%) blur(8px); }
  .page-wrapper.template-minimal_luxury footer { padding: 128px 0 96px; border-top: 1px solid var(--tp-border); background: var(--tp-bg-footer); color: var(--tp-heading); }
  .page-wrapper.template-minimal_luxury .section h2 { margin-bottom: 32px; }
  .page-wrapper.template-minimal_luxury .section p { margin-bottom: 16px; }
  /* Header A-1: ロゴ中央・serif text-6xl tracking 0.3em uppercase / ナビ極小 10px tracking 0.2em hover opacity-50 */
  .page-wrapper.template-minimal_luxury .header-a1-inner { display: flex; flex-direction: column; align-items: center; gap: 32px; }
  .page-wrapper.template-minimal_luxury .logo-a1 { font-family: "Playfair Display", "Yu Mincho", Georgia, serif; font-size: 3.75rem; font-weight: 400; letter-spacing: 0.3em; text-transform: uppercase; color: #1A1A1A; }
  .page-wrapper.template-minimal_luxury .nav-a1 { display: flex; flex-wrap: wrap; justify-content: center; gap: 32px; }
  .page-wrapper.template-minimal_luxury .nav-a1 .nav-link { font-size: 10px; letter-spacing: 0.2em; opacity: 1; transition: opacity 0.3s cubic-bezier(0.22, 1, 0.36, 1); }
  .page-wrapper.template-minimal_luxury .nav-a1 .nav-link::after { display: none; }
  .page-wrapper.template-minimal_luxury .nav-a1 .nav-link:hover { opacity: 0.5; }
  /* Typography */
  .page-wrapper.template-minimal_luxury .hero h1 { font-family: "Playfair Display", "Yu Mincho", serif; font-size: 3.75rem; font-weight: 400; letter-spacing: 0.15em; color: #1A1A1A; margin: 0 0 16px; line-height: 1.15; }
  .page-wrapper.template-minimal_luxury .hero .subheadline { font-family: system-ui, -apple-system, sans-serif; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.3em; color: #1A1A1A; opacity: 0.85; }
  .page-wrapper.template-minimal_luxury .section h2 { font-family: "Playfair Display", serif; color: #1A1A1A; font-size: 1.5rem; letter-spacing: 0.08em; }
  .page-wrapper.template-minimal_luxury .section p { color: #1A1A1A; line-height: 1.75; }
  /* Hero: grid-cols-12 非対称・垂直中央揃え禁止 */
  .page-wrapper.template-minimal_luxury .hero { display: grid; grid-template-columns: repeat(12, 1fr); gap: 0; min-height: var(--hero-min-h); align-items: stretch; padding: 0; }
  .page-wrapper.template-minimal_luxury .hero .hero-a1-text { grid-column: 1 / 5; position: relative; z-index: 10; padding: 32px 32px 32px 0; display: flex; flex-direction: column; justify-content: center; }
  .page-wrapper.template-minimal_luxury .hero .hero-a1-img-wrap { grid-column: 4 / -1; }
  @media (min-width: 1024px) { .page-wrapper.template-minimal_luxury .hero .hero-a1-text { padding: 32px 96px 32px 0; } }
  .page-wrapper.template-minimal_luxury .hero .hero-a1-img-wrap { position: relative; width: 100%; height: 100%; min-height: 400px; overflow: hidden; }
  .page-wrapper.template-minimal_luxury .hero .hero-a1-img, .page-wrapper.template-minimal_luxury .hero .hero-ken-burns { width: 100%; height: 100%; min-height: 400px; object-fit: cover; border-radius: 0; }
  @keyframes a1-ken-burns { 0% { transform: scale(1.06); } 100% { transform: scale(1); } }
  .page-wrapper.template-minimal_luxury .hero .hero-ken-burns { animation: a1-ken-burns 22s ease-out infinite alternate; }
  .page-wrapper.template-minimal_luxury .hero .hero-a1-slides { position: absolute; inset: 0; width: 100%; height: 100%; }
  .page-wrapper.template-minimal_luxury .hero .hero-a1-slide { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; animation: a1-slide-fade 14s ease-in-out infinite; }
  .page-wrapper.template-minimal_luxury .hero .hero-a1-slide[data-slide="1"] { animation-delay: 4.5s; }
  .page-wrapper.template-minimal_luxury .hero .hero-a1-slide[data-slide="2"] { animation-delay: 9s; }
  @keyframes a1-slide-fade { 0%, 20% { opacity: 0; } 28%, 68% { opacity: 1; } 76%, 100% { opacity: 0; } }
  .page-wrapper.template-minimal_luxury .section-img-wrap { overflow: hidden; }
  .page-wrapper.template-minimal_luxury .section-img { transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1); }
  .page-wrapper.template-minimal_luxury .section-img-wrap:hover .section-img { transform: scale(1.04); }
  @media (max-width: 768px) {
    .page-wrapper.template-minimal_luxury .hero { grid-template-columns: 1fr; grid-template-rows: auto 1fr; }
    .page-wrapper.template-minimal_luxury .hero .hero-a1-text { grid-column: 1 / -1; order: 1; padding: 32px 0; }
    .page-wrapper.template-minimal_luxury .hero .hero-a1-img-wrap { grid-column: 1 / -1; }
    .page-wrapper.template-minimal_luxury .hero h1 { font-size: 2.25rem; letter-spacing: 0.1em; }
  }
  .page-wrapper.template-minimal_luxury * { border-radius: 0; }
  /* 登場アニメ: y:40→0, duration 1.2, ease [0.22,1,0.36,1], viewport once */
  .page-wrapper.template-minimal_luxury [data-a1-animate] { opacity: 0; transform: translateY(40px); transition: opacity 1.2s cubic-bezier(0.22, 1, 0.36, 1), transform 1.2s cubic-bezier(0.22, 1, 0.36, 1); }
  .page-wrapper.template-minimal_luxury [data-a1-animate].a1-visible { opacity: 1; transform: translateY(0); }
  .page-wrapper.template-minimal_luxury .nav-link { color: #1A1A1A; }
  .page-wrapper.template-minimal_luxury .cta-btn,
  .page-wrapper.template-minimal_luxury .cta-btn-a1,
  .page-wrapper.template-minimal_luxury .cta-btn-primary { border: 0.5px solid #1A1A1A; color: #1A1A1A; background: transparent; padding: 16px 48px; border-radius: 0; box-shadow: none; }
  .page-wrapper.template-minimal_luxury .cta-btn:hover,
  .page-wrapper.template-minimal_luxury .cta-btn-a1:hover,
  .page-wrapper.template-minimal_luxury .cta-btn-primary:hover { background: transparent; opacity: 0.65; transform: none; box-shadow: none; letter-spacing: 0.2em; }
  .page-wrapper.template-minimal_luxury .cta-btn:active { transform: translateY(1px); opacity: 0.5; }
  body.template-minimal_luxury::after { opacity: 0.022; mix-blend-mode: multiply; }
  .page-wrapper.template-minimal_luxury .cta-block { padding: 96px 0 64px; }
  .page-wrapper.template-minimal_luxury .quote-block { font-family: "Playfair Display", serif; letter-spacing: 0.05em; color: #1A1A1A; margin: 96px 0; padding: 48px; }
  .page-wrapper.template-minimal_luxury input,
  .page-wrapper.template-minimal_luxury textarea { border: none; border-bottom: 1px solid #1A1A1A; border-radius: 0; background: transparent; padding: 8px 0; }
  .page-wrapper.template-minimal_luxury input:focus,
  .page-wrapper.template-minimal_luxury textarea:focus { outline: none; border-bottom-color: #666666; }
  .page-wrapper.template-minimal_luxury .section-img-wrap { aspect-ratio: 3/4; overflow: hidden; }
  .page-wrapper.template-minimal_luxury .section-img { max-height: none; height: 100%; }
  .page-wrapper.template-minimal_luxury .footer-cols { grid-template-columns: 1fr 1fr; }
  .page-wrapper.template-minimal_luxury .footer-brand { font-family: "Playfair Display", serif; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.1em; }
  `
  ),
  makeTemplate(
    'dark_edge',
    'Dark Edge',
    '漆黒とインパクト（A-2）',
    `
  body.template-dark_edge::after { mix-blend-mode: overlay; opacity: 0.055; }
  .page-wrapper.template-dark_edge { --tp-bg: #0c0c0c; --tp-heading: #f5f3ef; --tp-text: #d4d2ce; --tp-accent: #c9a227; --tp-border: rgba(201,162,39,0.15); --tp-bg-footer: #0a0a0a; --hero-min-h: 100vh; font-family: "Helvetica Neue", Arial, sans-serif; color: #f5f3ef; background: var(--tp-bg); }
  .page-wrapper.template-dark_edge .hero { min-height: var(--hero-min-h); position: relative; display: flex; align-items: center; justify-content: center; }
  .page-wrapper.template-dark_edge header { background: transparent; }
  .page-wrapper.template-dark_edge header.scrolled { background: rgba(8,8,8,0.95); }
  .page-wrapper.template-dark_edge .hero-bg { position: absolute; inset: 0; background-size: cover; background-position: center; background-attachment: fixed; z-index: 0; }
  .page-wrapper.template-dark_edge .hero-text { position: relative; z-index: 1; text-align: center; }
  .page-wrapper.template-dark_edge .hero h1 { font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; margin: 0 0 var(--space-sm); mix-blend-mode: difference; color: #fff; }
  .page-wrapper.template-dark_edge .hero .subheadline { text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.9; }
  .page-wrapper.template-dark_edge .container { padding: 0 var(--space-lg); }
  @media (min-width: 1024px) { .page-wrapper.template-dark_edge .container { padding: 0 var(--space-2xl); } }
  .page-wrapper.template-dark_edge .section-rhythm-after-hero { padding-top: var(--space-3xl); padding-bottom: var(--space-2xl); }
  .page-wrapper.template-dark_edge .section-rhythm-default { padding-top: var(--space-2xl); padding-bottom: var(--space-2xl); }
  .page-wrapper.template-dark_edge .section-rhythm-breath { padding-top: var(--space-3xl); padding-bottom: var(--space-3xl); }
  .page-wrapper.template-dark_edge .section-rhythm-before-footer { padding-top: var(--space-2xl); padding-bottom: var(--space-3xl); }
  .page-wrapper.template-dark_edge .section h2 { color: #fff; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: var(--space-md); }
  .page-wrapper.template-dark_edge .section p { color: #e5e5e5; margin-bottom: var(--space-sm); }
  .page-wrapper.template-dark_edge header { padding: var(--space-md) 0; border-color: #222; }
  .page-wrapper.template-dark_edge footer { padding: var(--space-3xl) 0 var(--space-2xl); border-color: #222; color: #999; }
  .page-wrapper.template-dark_edge .nav-toggle { display: none; }
  .page-wrapper.template-dark_edge .nav-toggle-label { display: flex; flex-direction: column; gap: 6px; cursor: pointer; }
  .page-wrapper.template-dark_edge .nav-toggle-label span { display: block; width: 24px; height: 2px; background: #fff; }
  .page-wrapper.template-dark_edge .nav-overlay { position: fixed; inset: 0; z-index: 50; background: rgba(10,10,10,0.97); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; opacity: 0; visibility: hidden; transition: opacity 0.45s ${HELL_EASE}, visibility 0.45s ${HELL_EASE}; }
  .page-wrapper.template-dark_edge .nav-toggle:checked ~ .nav-overlay { opacity: 1; visibility: visible; }
  .page-wrapper.template-dark_edge .nav-overlay-inner { display: flex; flex-direction: column; gap: var(--space-2xl); text-align: center; }
  .page-wrapper.template-dark_edge .nav-overlay-link { color: #fff; font-size: 1.5rem; text-transform: uppercase; letter-spacing: 0.2em; text-decoration: none; }
  .page-wrapper.template-dark_edge .nav-overlay-link:hover { color: #c9a227; }
  .page-wrapper.template-dark_edge .cta-btn-hero { border: 0.5px solid #f5f3ef; color: #f5f3ef; background: transparent; margin: 0 var(--space-xs); box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
  .page-wrapper.template-dark_edge .cta-btn-hero:hover { background: #f5f3ef; color: #0c0c0c; letter-spacing: 0.18em; box-shadow: 0 12px 40px rgba(201,162,39,0.15); }
  .page-wrapper.template-dark_edge .cta-btn-hero-outline { border: 2px solid #c9a227; color: #c9a227; background: transparent; }
  .page-wrapper.template-dark_edge .cta-btn-hero-outline:hover { background: #c9a227; color: #080808; }
  .page-wrapper.template-dark_edge .hero-cta-wrap { margin-top: var(--space-lg); display: flex; flex-wrap: wrap; gap: var(--space-sm); justify-content: center; }
  .page-wrapper.template-dark_edge .section-img-wrap { margin: 0 calc(-1 * var(--space-lg)) var(--space-sm); }
  .page-wrapper.template-dark_edge .section-img { width: 100%; max-height: 400px; transition: transform 0.5s ease; }
  .page-wrapper.template-dark_edge .footer-cols { color: #999; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.75rem; }
  @keyframes dark-ken-burns { 0% { transform: scale(1.12); } 100% { transform: scale(1); } }
  .page-wrapper.template-dark_edge .hero-bg-ken-burns { animation: dark-ken-burns 25s ease-out infinite alternate; }
  .page-wrapper.template-dark_edge .section-img-wrap { overflow: hidden; }
  .page-wrapper.template-dark_edge .section-img-wrap:hover .section-img { transform: scale(1.05); }
  .page-wrapper.template-dark_edge .quote-block { color: #e5e5e5; border-left: 3px solid #c9a227; text-align: left; padding-left: var(--space-lg); background: rgba(255,255,255,0.03); }
  `
  ),
  makeTemplate(
    'corporate_trust',
    'Corporate Trust',
    '重厚と信頼（A-3）',
    `
  @keyframes ken-burns { 0% { transform: scale(1.1); } 100% { transform: scale(1); } }
  .page-wrapper.template-corporate_trust { --tp-bg: #f8fafc; --tp-heading: #0f172a; --tp-text: #1e293b; --tp-accent: #2563eb; --tp-border: #e2e8f0; --tp-bg-footer: #f1f5f9; --hero-min-h: 60vh; font-family: "Noto Sans JP", "Hiragino Kaku Gothic ProN", sans-serif; font-weight: 700; color: #1e293b; background: var(--tp-bg); }
  .page-wrapper.template-corporate_trust .container { padding: 0 var(--space-lg); }
  .page-wrapper.template-corporate_trust header { background: transparent; }
  .page-wrapper.template-corporate_trust header.scrolled { background: rgba(255,255,255,0.95); backdrop-filter: saturate(180%) blur(8px); border-color: var(--tp-border); }
  @media (min-width: 1024px) { .page-wrapper.template-corporate_trust .container { padding: 0 var(--space-2xl); } }
  .page-wrapper.template-corporate_trust .hero { padding: var(--space-3xl) var(--space-lg); text-align: center; }
  .page-wrapper.template-corporate_trust .hero h1 { font-size: 2.25rem; font-weight: 700; color: #0f172a; margin: 0 0 var(--space-sm); }
  .page-wrapper.template-corporate_trust .section-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-lg); margin-top: var(--space-2xl); }
  body.template-corporate_trust::after { opacity: 0.02; }
  .page-wrapper.template-corporate_trust .section-card { padding: var(--space-md); background: #fff; border-left: 3px solid #1e3a8a; border-radius: 0.5rem; box-shadow: 0 1px 2px rgba(15,23,42,0.04), 0 6px 20px rgba(15,23,42,0.06), 0 24px 48px rgba(15,23,42,0.05); border: 0.5px solid rgba(30,58,138,0.08); border-left-width: 3px; }
  .page-wrapper.template-corporate_trust .section-card.section-rhythm-after-hero,
  .page-wrapper.template-corporate_trust .section-card.section-rhythm-default,
  .page-wrapper.template-corporate_trust .section-card.section-rhythm-breath,
  .page-wrapper.template-corporate_trust .section-card.section-rhythm-before-footer { padding-top: var(--space-md); padding-bottom: var(--space-md); }
  .page-wrapper.template-corporate_trust .section-card h2 { font-size: 1rem; margin: 0 0 var(--space-xs); }
  .page-wrapper.template-corporate_trust .section-card p { font-size: 0.875rem; font-weight: 500; margin: 0; }
  .page-wrapper.template-corporate_trust .hero-bg-img { animation: ken-burns 20s ease-out infinite alternate; }
  .page-wrapper.template-corporate_trust .section h2 { color: #0f172a; }
  .page-wrapper.template-corporate_trust footer { color: #475569; }
  .page-wrapper.template-corporate_trust .cta-btn { background: #1e3a8a; color: #fafbfc; border: 0.5px solid rgba(255,255,255,0.12); }
  .page-wrapper.template-corporate_trust .cta-btn:hover { background: #2563eb; letter-spacing: 0.12em; }
  .page-wrapper.template-corporate_trust .nav-link { color: #1e293b; }
  .page-wrapper.template-corporate_trust .stats-block { padding: 2rem 0; }
  .page-wrapper.template-corporate_trust .stat-value { color: #1e3a8a; }
  .page-wrapper.template-corporate_trust .section-card { transition: box-shadow 0.5s ${HELL_EASE}, transform 0.5s ${HELL_EASE}, border-color 0.5s ${HELL_EASE}; }
  .page-wrapper.template-corporate_trust .section-card:hover { box-shadow: 0 4px 12px rgba(37,99,235,0.08), 0 16px 40px rgba(15,23,42,0.1); border-left-color: #2563eb; transform: translateY(-3px); transition: box-shadow 0.5s ${HELL_EASE}, transform 0.5s ${HELL_EASE}, border-color 0.5s ${HELL_EASE}; }
  .page-wrapper.template-corporate_trust .section-card-img { aspect-ratio: 16/10; overflow: hidden; margin: -1rem -1rem 1rem -1rem; border-radius: 0.5rem 0.5rem 0 0; }
  .page-wrapper.template-corporate_trust .section-card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
  .page-wrapper.template-corporate_trust .footer-cols { border-top: 1px solid #e2e8f0; padding-top: var(--space-lg); }
  .page-wrapper.template-corporate_trust .hero-with-bg { overflow: hidden; background: #0f172a; }
  .page-wrapper.template-corporate_trust .hero-bg-layer { position: absolute; inset: 0; background-image: var(--hero-bg-img); background-size: cover; background-position: center; z-index: 0; animation: corp-ken-burns 28s ease-out infinite alternate; }
  @keyframes corp-ken-burns { 0% { transform: scale(1.1); } 100% { transform: scale(1); } }
  .page-wrapper.template-corporate_trust .hero-bg-overlay { z-index: 1; }
  .page-wrapper.template-corporate_trust .hero-inner { z-index: 2; }
  .page-wrapper.template-corporate_trust .section-card-img { overflow: hidden; }
  .page-wrapper.template-corporate_trust .section-card:hover .section-card-img img { transform: scale(1.05); }
  .page-wrapper.template-corporate_trust .hero-with-bg { min-height: var(--hero-min-h); }
  .page-wrapper.template-corporate_trust .quote-block { color: #0f172a; border-left: 4px solid #1e3a8a; text-align: left; padding-left: var(--space-lg); background: #fff; padding: var(--space-lg); }
  .page-wrapper.template-corporate_trust .stats-block .stat-value { font-size: 2.5rem; }
  `
  ),
  makeTemplate(
    'warm_organic',
    'Warm Organic',
    '自然と調和（B-1）— カルーセル・固定ナビ・ブランド帯',
    `
  .page-wrapper.template-warm_organic {
    --tp-bg: #f2efe8; --tp-heading: #2c2418; --tp-text: #5c5348; --tp-accent: #b45309;
    --tp-brand: #3d5245; --tp-band: #ebe8e0; --tp-hours-bg: #e5dfd2; --tp-border: rgba(61,82,69,0.2);
    --hero-min-h: 72vh; font-family: "Hiragino Sans", "Noto Sans JP", sans-serif; color: var(--tp-text); background: var(--tp-bg);
  }
  .page-wrapper.template-warm_organic .container { padding: 0 var(--space-lg); max-width: 56rem; margin: 0 auto; }
  @media (min-width: 1024px) { .page-wrapper.template-warm_organic .container { padding: 0 var(--space-2xl); } }
  .page-wrapper.template-warm_organic header { display: none; }
  .wo-nav-cb { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
  .wo-nav-fab {
    position: fixed; top: max(1rem, env(safe-area-inset-top)); right: max(1rem, env(safe-area-inset-right)); z-index: 300;
    width: 3.25rem; height: 3.25rem; border-radius: 50%; background: var(--tp-brand); border: none; cursor: pointer;
    box-shadow: 0 4px 20px rgba(45,60,50,0.35); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .wo-nav-fab:hover { transform: scale(1.05); }
  .wo-nav-fab span { display: block; width: 1.15rem; height: 2px; background: #fff; border-radius: 1px; }
  .wo-nav-cb:checked ~ .wo-nav-fab span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .wo-nav-cb:checked ~ .wo-nav-fab span:nth-child(2) { opacity: 0; }
  .wo-nav-cb:checked ~ .wo-nav-fab span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
  .wo-nav-fab span { transition: transform 0.25s ease, opacity 0.2s; }
  .wo-nav-drawer {
    position: fixed; inset: 0; z-index: 250; background: rgba(45,55,48,0.4);
    display: flex; align-items: center; justify-content: center; padding: 2rem;
    opacity: 0; visibility: hidden; transition: opacity 0.35s ease, visibility 0.35s;
  }
  .wo-nav-cb:checked ~ .wo-nav-drawer { opacity: 1; visibility: visible; }
  .wo-nav-backdrop { position: absolute; inset: 0; z-index: 0; cursor: pointer; }
  .wo-nav-drawer-inner { position: relative; z-index: 1; text-align: center; max-width: 20rem; width: 100%; background: rgba(35,45,38,0.97); padding: 2rem 1.5rem; border-radius: 0.5rem; box-shadow: 0 24px 64px rgba(0,0,0,0.35); }
  .wo-nav-drawer .wo-nav-brand { color: rgba(255,255,255,0.5); font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 2rem; }
  .wo-nav-drawer a {
    display: block; color: #fff; text-decoration: none; font-size: 1.05rem; font-weight: 500; padding: 0.65rem 0;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .wo-nav-drawer a:hover { color: #c9d4c9; }
  .wo-nav-drawer .cta-btn { margin-top: 1.5rem; border: none; }
  .wo-hero {
    position: relative; min-height: var(--hero-min-h); overflow: hidden; background: var(--tp-brand);
  }
  .wo-hero-viewport { position: absolute; inset: 0; overflow: hidden; }
  .wo-hero-track {
    display: flex; height: 100%; width: 100%; transition: transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94); will-change: transform;
  }
  .wo-hero-slide {
    flex: 0 0 100%; width: 100%; height: 100%; background-size: cover; background-position: center;
  }
  .wo-hero-strip {
    position: absolute; left: 0; top: 0; bottom: 0; width: min(18%, 5.5rem); background: var(--tp-brand); z-index: 2; pointer-events: none;
    opacity: 0.92;
  }
  .wo-hero::after {
    content: ""; position: absolute; inset: 0; background: linear-gradient(to top, rgba(30,35,30,0.55) 0%, transparent 45%); z-index: 3; pointer-events: none;
  }
  .wo-hero-inner {
    position: absolute; left: 0; right: 0; bottom: 0; z-index: 10; text-align: center; padding: 2rem 1.5rem 4.5rem; color: #fff;
    text-shadow: 0 2px 24px rgba(0,0,0,0.35);
  }
  .wo-hero-eyebrow { font-size: 0.7rem; letter-spacing: 0.28em; text-transform: uppercase; opacity: 0.9; margin: 0 0 0.5rem; }
  .wo-hero-inner h1 { font-size: clamp(1.65rem, 5vw, 2.35rem); font-weight: 600; margin: 0 0 0.5rem; line-height: 1.25; }
  .wo-hero-inner .subheadline { font-size: 0.95rem; font-weight: 400; opacity: 0.95; margin: 0 0 1.25rem; line-height: 1.6; }
  .wo-hero-inner .cta-btn { background: #fff; color: var(--tp-brand); font-weight: 600; border: none; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
  .wo-hero-inner .cta-btn:hover { background: #f5f5f0; letter-spacing: 0.06em; }
  .wo-hero-dots {
    position: absolute; bottom: 1.25rem; left: 50%; transform: translateX(-50%); z-index: 12; display: flex; gap: 0.5rem; align-items: center;
  }
  .wo-hero-dot {
    width: 8px; height: 8px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.85); background: transparent; padding: 0; cursor: pointer; transition: background 0.2s, transform 0.2s;
  }
  .wo-hero-dot.active { background: #fff; box-shadow: 0 0 0 2px var(--tp-brand); transform: scale(1.15); }
  .wo-hero-dot:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
  .page-wrapper.template-warm_organic .section.wo-sec {
    border: none; border-radius: 0; margin-bottom: 0; background: var(--tp-bg);
    border-bottom: 1px solid rgba(44,36,24,0.06);
  }
  .page-wrapper.template-warm_organic .section.wo-sec:last-of-type { border-bottom: none; }
  .page-wrapper.template-warm_organic .section.wo-sec:hover { transform: none; }
  .page-wrapper.template-warm_organic .wo-sec-heading {
    font-size: 0.8125rem; font-weight: 600; letter-spacing: 0.1em; color: #6e665c; margin: 0 0 0.85rem;
  }
  .page-wrapper.template-warm_organic .wo-lede-heading {
    font-size: 1.3125rem; font-weight: 600; letter-spacing: -0.02em; color: var(--tp-heading); margin: 0 0 1rem; line-height: 1.45;
  }
  .page-wrapper.template-warm_organic .wo-lede-prose p,
  .page-wrapper.template-warm_organic .wo-sec-prose p {
    font-size: 1rem; line-height: 1.85; color: var(--tp-text); margin: 0 0 0.85rem;
  }
  .page-wrapper.template-warm_organic .wo-lede-prose p:last-child,
  .page-wrapper.template-warm_organic .wo-sec-prose p:last-child { margin-bottom: 0; }
  .page-wrapper.template-warm_organic .wo-text-mark {
    background: linear-gradient(transparent 62%, rgba(235, 218, 168, 0.72) 62%);
    padding: 0.06em 0.15em; box-decoration-break: clone; -webkit-box-decoration-break: clone;
  }
  .page-wrapper.template-warm_organic .wo-hours-emphasis { font-size: 1.0625rem; font-weight: 500; line-height: 1.65; margin: 0 0 0.65rem; color: var(--tp-heading); }
  .page-wrapper.template-warm_organic .wo-hours-detail { font-size: 0.9375rem; line-height: 1.75; color: var(--tp-text); margin: 0 0 0.4rem; opacity: 0.92; }
  .page-wrapper.template-warm_organic .wo-sns-caption { font-size: 0.8125rem; color: #8a8278; margin: -0.35rem 0 0.85rem; }
  .page-wrapper.template-warm_organic .wo-sns-row { display: flex; flex-direction: row; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
  .page-wrapper.template-warm_organic .wo-sns-emoji {
    font-size: 2.5rem; line-height: 1; text-decoration: none; transition: transform 0.2s ease, opacity 0.2s ease;
    filter: drop-shadow(0 2px 6px rgba(44,36,24,0.08));
  }
  .page-wrapper.template-warm_organic .wo-sns-emoji:hover { transform: scale(1.08); opacity: 0.88; }
  .page-wrapper.template-warm_organic .wo-form-block .wo-form { max-width: 36rem; margin-top: 0.25rem; }
  .page-wrapper.template-warm_organic .wo-form-field { margin-bottom: 1.35rem; }
  .page-wrapper.template-warm_organic .wo-form-label { display: block; font-size: 0.8125rem; font-weight: 600; letter-spacing: 0.06em; color: var(--tp-heading); margin-bottom: 0.45rem; }
  .page-wrapper.template-warm_organic .wo-form-control {
    width: 100%; box-sizing: border-box; padding: 0.9rem 1.05rem; font-size: 1.0625rem; line-height: 1.5;
    border: 1px solid rgba(44,36,24,0.14); border-radius: 8px; background: #fff; color: var(--tp-heading);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .page-wrapper.template-warm_organic .wo-form-control:focus { outline: none; border-color: rgba(180,83,9,0.45); box-shadow: 0 0 0 3px rgba(180,83,9,0.12); }
  .page-wrapper.template-warm_organic .wo-form-textarea { min-height: 11rem; resize: vertical; font-family: inherit; }
  .page-wrapper.template-warm_organic .wo-form-submit { margin-top: 0.25rem; cursor: pointer; border: none; min-width: 12rem; }
  .page-wrapper.template-warm_organic .section-rhythm-after-hero { padding: var(--space-2xl) var(--space-lg); }
  .page-wrapper.template-warm_organic .section-rhythm-default { padding: var(--space-xl) var(--space-lg); }
  .page-wrapper.template-warm_organic .section-rhythm-breath { padding: var(--space-2xl) var(--space-lg); }
  .page-wrapper.template-warm_organic .section-rhythm-before-footer { padding: var(--space-xl) var(--space-lg) var(--space-2xl); }
  .page-wrapper.template-warm_organic .section.wo-alt { display: grid; gap: var(--space-lg); }
  @media (min-width: 768px) {
    .page-wrapper.template-warm_organic .section.wo-alt { grid-template-columns: 1fr 1fr; align-items: center; }
    .page-wrapper.template-warm_organic .section.wo-alt-rev .section-img-wrap { order: 2; }
  }
  .page-wrapper.template-warm_organic .section-img-wrap { border-radius: 0.35rem; overflow: hidden; border: none; padding: 0; box-shadow: 0 8px 32px rgba(45,55,48,0.12); }
  .page-wrapper.template-warm_organic .section-img { transition: transform 0.5s ease; }
  .page-wrapper.template-warm_organic .section-img-wrap:hover .section-img { transform: scale(1.02); }
  .page-wrapper.template-warm_organic .cta-btn {
    background: var(--tp-accent); color: #fff; border: none; border-radius: 2rem; padding: var(--space-md) var(--space-lg);
    box-shadow: 0 4px 14px rgba(180,83,9,0.22); display: inline-block; text-decoration: none; font-weight: 600;
  }
  .page-wrapper.template-warm_organic .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(180,83,9,0.28); }
  body.template-warm_organic::after { opacity: 0.028; mix-blend-mode: multiply; }
  .page-wrapper.template-warm_organic .quote-block {
    color: var(--tp-heading); border: none; border-top: 1px solid rgba(44,36,24,0.08); border-bottom: 1px solid rgba(44,36,24,0.08);
    background: transparent; padding: 1.5rem 0; margin: var(--space-xl) 0; font-style: italic; font-size: 1.05rem; line-height: 1.75; text-align: center;
  }
  .page-wrapper.template-warm_organic footer.footer-wo {
    background: var(--tp-brand); color: rgba(255,255,255,0.92); padding: var(--space-2xl) 0 var(--space-xl); margin-top: var(--space-xl);
  }
  .page-wrapper.template-warm_organic footer.footer-wo .footer-brand { color: #fff; font-size: 1.05rem; font-weight: 600; }
  .page-wrapper.template-warm_organic footer.footer-wo .footer-address, .page-wrapper.template-warm_organic footer.footer-wo p { color: rgba(255,255,255,0.8); font-size: 0.88rem; line-height: 1.65; }
  .page-wrapper.template-warm_organic footer.footer-wo a { color: #e8f0e8; }
  .page-wrapper.template-warm_organic footer.footer-wo .footer-cols { border-top: 1px solid rgba(255,255,255,0.12); padding-top: var(--space-lg); }
  .page-wrapper.template-warm_organic .wo-page-top {
    display: block; text-align: center; color: rgba(255,255,255,0.85); text-decoration: none; font-size: 0.8rem; letter-spacing: 0.15em; padding: 1rem 0 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: var(--space-lg);
  }
  .page-wrapper.template-warm_organic .wo-page-top:hover { color: #fff; }
  .page-wrapper.template-warm_organic .footer-legal .presented-by { color: rgba(255,255,255,0.45); font-size: 0.75rem; }
  `
  ),
  makeTemplate(
    'pop_friendly',
    'Pop & Friendly',
    '楽しさと躍動（B-2）',
    `
  .page-wrapper.template-pop_friendly { --tp-bg: #fef08a; --tp-heading: #1a1a1a; --tp-text: #1a1a1a; --tp-accent: #dc2626; --tp-border: #000; --tp-bg-footer: #fef9c3; --hero-min-h: 60vh; font-family: "Noto Sans JP", sans-serif; background: var(--tp-bg); color: #1a1a1a; }
  .page-wrapper.template-pop_friendly .container { padding: 0 var(--space-lg); }
  .page-wrapper.template-pop_friendly header { background: #fef08a; }
  .page-wrapper.template-pop_friendly header.scrolled { box-shadow: 0 4px 0 0 #000; }
  @media (min-width: 1024px) { .page-wrapper.template-pop_friendly .container { padding: 0 var(--space-2xl); } }
  .page-wrapper.template-pop_friendly .hero { padding: var(--space-3xl) var(--space-lg); text-align: center; background: #fef08a; border: 4px solid #000; border-radius: 0; box-shadow: 8px 8px 0 0 #000; margin: 0 var(--space-lg); }
  .page-wrapper.template-pop_friendly .hero h1 { font-size: 2rem; font-weight: 800; color: #1a1a1a; margin: 0 0 var(--space-sm); }
  .page-wrapper.template-pop_friendly .section { background: #fff; border: 4px solid #000; box-shadow: 8px 8px 0 0 #000; margin-bottom: 0; }
  .page-wrapper.template-pop_friendly .section-rhythm-after-hero { padding: var(--space-xl); }
  .page-wrapper.template-pop_friendly .section-rhythm-default { padding: var(--space-lg); }
  .page-wrapper.template-pop_friendly .section-rhythm-breath { padding: var(--space-xl); }
  .page-wrapper.template-pop_friendly .section-rhythm-before-footer { padding: var(--space-lg) var(--space-xl) var(--space-xl); }
  .page-wrapper.template-pop_friendly .section h2 { margin-bottom: var(--space-md); }
  .page-wrapper.template-pop_friendly .section p { margin-bottom: var(--space-sm); }
  .page-wrapper.template-pop_friendly .hero h1, .page-wrapper.template-pop_friendly .section h2 { font-family: "M PLUS Rounded 1c", "Hiragino Sans", sans-serif; color: #1a1a1a; }
  .page-wrapper.template-pop_friendly button, .page-wrapper.template-pop_friendly .btn { border: 4px solid #000; background: #f472b6; font-weight: 700; padding: var(--space-xs) var(--space-sm); cursor: pointer; transition: transform 0.1s; }
  .page-wrapper.template-pop_friendly button:active, .page-wrapper.template-pop_friendly .btn:active { transform: scale(0.95); }
  .page-wrapper.template-pop_friendly header { padding: var(--space-md) 0; border: 4px solid #000; }
  .page-wrapper.template-pop_friendly footer { padding: var(--space-3xl) 0 var(--space-2xl); border-top: 4px solid #000; color: #1a1a1a; }
  .page-wrapper.template-pop_friendly .cta-btn { background: #f472b6; color: #1a1a1a; border: 4px solid #000; box-shadow: 8px 8px 0 0 #000; transition: transform 0.2s ${HELL_EASE}, box-shadow 0.2s ${HELL_EASE}, letter-spacing 0.25s ${HELL_EASE}; }
  .page-wrapper.template-pop_friendly .cta-btn:hover { transform: translate(-2px,-3px); box-shadow: 12px 14px 0 0 #000; letter-spacing: 0.06em; }
  .page-wrapper.template-pop_friendly .cta-btn:active { transform: translate(2px,2px); box-shadow: 4px 4px 0 0 #000; }
  body.template-pop_friendly::after { opacity: 0.045; mix-blend-mode: multiply; }
  .page-wrapper.template-pop_friendly .cta-btn.cta-btn-secondary { background: #fef08a; }
  .page-wrapper.template-pop_friendly .nav-link { color: #1a1a1a; font-weight: 600; }
  .page-wrapper.template-pop_friendly .footer-cols { border: 4px solid #000; box-shadow: 8px 8px 0 0 #000; padding: var(--space-lg); margin: 0 var(--space-lg); background: #fff; }
  .page-wrapper.template-pop_friendly .badge { display: inline-block; padding: 0.25rem 0.5rem; font-size: 0.75rem; font-weight: 800; background: #f472b6; border: 2px solid #000; margin-left: 0.5rem; }
  .page-wrapper.template-pop_friendly .section-img-wrap { overflow: hidden; }
  .page-wrapper.template-pop_friendly .section-img { transition: transform 0.25s ease; }
  .page-wrapper.template-pop_friendly .section-img-wrap:hover .section-img { transform: scale(1.02); }
  .page-wrapper.template-pop_friendly .hero-full-img .hero-bg-overlay { background: rgba(0,0,0,0.35); }
  .page-wrapper.template-pop_friendly .hero-full-img .hero-inner { color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.4); }
  .page-wrapper.template-pop_friendly .quote-block { background: #fff; border: 4px solid #000; box-shadow: 6px 6px 0 0 #000; padding: var(--space-lg); font-weight: 700; }
  `
  ),
  makeTemplate(
    'high_energy',
    'High Energy',
    '力強さと勢い（B-3）',
    `
  @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  .page-wrapper.template-high_energy { --tp-bg: #fff; --tp-heading: #0f0f0f; --tp-text: #334155; --tp-accent: #eab308; --tp-border: #e2e8f0; --tp-bg-footer: #f1f5f9; --hero-min-h: 65vh; font-family: "Noto Sans JP", sans-serif; font-weight: 900; color: #0f0f0f; background: #fff; }
  .page-wrapper.template-high_energy .marquee-bar { position: fixed; top: 0; left: 0; right: 0; z-index: 50; background: #0f0f0f; color: #fff; padding: var(--space-xs) 0; overflow: hidden; white-space: nowrap; font-size: 1rem; letter-spacing: 0.1em; }
  .page-wrapper.template-high_energy header { background: transparent; }
  .page-wrapper.template-high_energy header.scrolled { background: rgba(15,15,15,0.98); }
  .page-wrapper.template-high_energy .marquee-inner { display: inline-block; animation: marquee 25s linear infinite; padding-right: 2em; }
  .page-wrapper.template-high_energy .container { padding: 0 var(--space-lg); }
  @media (min-width: 1024px) { .page-wrapper.template-high_energy .container { padding: 0 var(--space-2xl); } }
  .page-wrapper.template-high_energy .hero { padding: var(--space-3xl) var(--space-lg) var(--space-lg); text-align: center; }
  .page-wrapper.template-high_energy .hero h1 { font-size: 2.5rem; font-weight: 900; color: #0f0f0f; margin: 0 0 var(--space-sm); }
  .page-wrapper.template-high_energy .section { transform: skewY(-3deg); margin-bottom: 0; background: #f1f5f9; }
  .page-wrapper.template-high_energy .section-rhythm-after-hero { padding: var(--space-2xl); }
  .page-wrapper.template-high_energy .section-rhythm-default { padding: var(--space-xl); }
  .page-wrapper.template-high_energy .section-rhythm-breath { padding: var(--space-2xl); }
  .page-wrapper.template-high_energy .section-rhythm-before-footer { padding: var(--space-xl) var(--space-2xl) var(--space-2xl); }
  .page-wrapper.template-high_energy .section-inner { transform: skewY(3deg); }
  .page-wrapper.template-high_energy .section h2 { font-weight: 900; color: #0f0f0f; margin-bottom: var(--space-md); }
  .page-wrapper.template-high_energy .section p { margin-bottom: var(--space-sm); }
  .page-wrapper.template-high_energy footer { padding: var(--space-3xl) 0 var(--space-2xl); font-weight: 700; color: #334155; }
  .page-wrapper.template-high_energy .cta-btn { background: #eab308; color: #0f0f0f; border: none; font-weight: 900; padding: var(--space-md) var(--space-lg); box-shadow: 0 4px 0 #ca8a04, 0 8px 24px rgba(0,0,0,0.12); }
  .page-wrapper.template-high_energy .cta-btn:hover { background: #facc15; transform: translateY(-2px); box-shadow: 0 6px 0 #ca8a04, 0 14px 36px rgba(234,179,8,0.25); letter-spacing: 0.1em; }
  .page-wrapper.template-high_energy .cta-btn:active { transform: translateY(2px); box-shadow: 0 1px 0 #ca8a04, 0 4px 12px rgba(0,0,0,0.1); }
  .page-wrapper.template-high_energy { background: #f8f8f6 !important; }
  body.template-high_energy::after { opacity: 0.02; }
  .page-wrapper.template-high_energy .marquee-bar + header { position: sticky; top: 0; z-index: 40; background: #0f0f0f; }
  .page-wrapper.template-high_energy .nav-link { color: #fff; font-weight: 700; }
  .page-wrapper.template-high_energy .stats-block { background: #0f0f0f; color: #fff; padding: var(--space-lg); margin: 0 calc(-1 * var(--space-lg)) var(--space-2xl); }
  .page-wrapper.template-high_energy .stat-value { color: #eab308; }
  .page-wrapper.template-high_energy .section-img-wrap { margin-bottom: var(--space-sm); overflow: hidden; }
  .page-wrapper.template-high_energy .section-img { transition: transform 0.4s ease; }
  .page-wrapper.template-high_energy .section-img-wrap:hover .section-img { transform: scale(1.03); }
  .page-wrapper.template-high_energy .footer-cols { background: #f1f5f9; padding: var(--space-lg); margin: 0 calc(-1 * var(--space-lg)); }
  .page-wrapper.template-high_energy .hero-full-img { min-height: var(--hero-min-h); }
  .page-wrapper.template-high_energy .quote-block { color: #0f0f0f; font-weight: 800; background: #f1f5f9; padding: var(--space-xl); border-radius: 0.5rem; }
  .page-wrapper.template-high_energy .stats-block .stat-value { font-size: 2.75rem; }
  @media (max-width: 768px) {
    .page-wrapper.template-high_energy .stats-block { margin-left: 0; margin-right: 0; padding-left: var(--space-sm); padding-right: var(--space-sm); }
    .page-wrapper.template-high_energy .footer-cols { margin-left: 0; margin-right: 0; padding-left: var(--space-sm); padding-right: var(--space-sm); }
  }
  `
  ),
];
