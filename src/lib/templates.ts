import type { TemplateOption } from '../types';

const EASE_PRO = 'cubic-bezier(0.16, 1, 0.3, 1)';
const TRANSITION_PRO = `0.8s ${EASE_PRO}`;

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

/** 共通: 余白スケール変数・スキップリンク・見出し字間・本文行間 */
const commonBase = `
  .page-wrapper {
    box-sizing: border-box; margin: 0; padding: 0;
    --space-xs: ${SPACE.xs}; --space-sm: ${SPACE.sm}; --space-md: ${SPACE.md}; --space-lg: ${SPACE.lg};
    --space-xl: ${SPACE.xl}; --space-2xl: ${SPACE['2xl']}; --space-3xl: ${SPACE['3xl']}; --space-4xl: ${SPACE['4xl']}; --space-5xl: ${SPACE['5xl']};
  }
  .page-wrapper * { box-sizing: border-box; }
  .skip-link { position: absolute; top: -4rem; left: var(--space-sm); z-index: 100; padding: var(--space-xs) var(--space-sm); background: #1a1a1a; color: #fff; text-decoration: none; border-radius: 0.25rem; font-size: 0.875rem; transition: top 0.2s; }
  .skip-link:focus { top: var(--space-sm); outline: 2px solid #1d4ed8; outline-offset: 2px; }
  .page-wrapper h1, .page-wrapper h2 { letter-spacing: -0.025em; }
  .page-wrapper p, .page-wrapper .subheadline { line-height: 1.625; }
  .page-wrapper .container { max-width: 960px; margin: 0 auto; }
  .page-wrapper header { padding: var(--space-sm) 0; border-bottom: 1px solid var(--tp-border, #e5e7eb); }
  .header-inner { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--space-sm); }
  .page-wrapper .logo { font-size: 1.25rem; font-weight: 700; color: var(--tp-heading); text-decoration: none; }
  .nav { display: flex; flex-wrap: wrap; gap: var(--space-md); align-items: center; }
  .nav-link { color: inherit; text-decoration: none; font-size: 0.9375rem; opacity: 0.9; }
  .nav-link:hover, .nav-link:focus-visible { opacity: 1; text-decoration: underline; outline: none; }
  .cta-btn { display: inline-block; padding: var(--space-xs) var(--space-sm); font-size: 0.875rem; font-weight: 600; text-decoration: none; border-radius: 0.25rem; transition: opacity 0.2s, transform 0.2s; }
  .cta-block { text-align: center; padding: var(--space-2xl) 0; }
  .section-img-wrap { margin-bottom: var(--space-sm); }
  .section-img { width: 100%; height: auto; max-height: 320px; object-fit: cover; display: block; }
  .section-body { }
  .page-wrapper main { padding: var(--space-2xl) 0 var(--space-3xl); }
  .page-wrapper .section { margin-bottom: 0; }
  .page-wrapper .section h2 { font-size: 1.5rem; font-weight: 600; margin: 0 0 var(--space-md); letter-spacing: -0.025em; }
  .page-wrapper .section p { margin: 0 0 var(--space-sm); line-height: 1.625; }
  .page-wrapper .section p:last-child { margin-bottom: 0; }
  .footer-cols { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2xl); text-align: left; }
  .footer-col p { margin: 0 0 var(--space-xs); font-size: 0.875rem; }
  .footer-brand { font-weight: 700; }
  .footer-link { color: inherit; }
  .page-wrapper footer { padding: var(--space-3xl) 0 var(--space-2xl); border-top: 1px solid var(--tp-border, #e5e7eb); text-align: center; font-size: 0.875rem; }
  .page-wrapper .sns-links a { margin-right: var(--space-xs); }
  .page-wrapper .presented-by { font-size: 0.75rem; opacity: 0.7; margin-top: var(--space-xs); }
  .page-wrapper .qr-block { margin-top: var(--space-md); text-align: center; }
  .page-wrapper .qr-block img { max-width: 120px; }
  .page-wrapper .qr-placeholder { font-size: 0.875rem; color: var(--tp-text, #666); margin: var(--space-xs) 0; }
  .quote-block { margin: var(--space-2xl) 0; padding: var(--space-md); font-size: 1.125rem; font-style: italic; text-align: center; }
  .stats-block { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: var(--space-md); margin-bottom: var(--space-2xl); text-align: center; }
  .stat-value { display: block; font-size: 2rem; font-weight: 800; }
  .stat-label { font-size: 0.875rem; opacity: 0.9; }
  .hero-with-bg, .hero-full-img { position: relative; background-size: cover; background-position: center; background-image: var(--hero-bg-img); min-height: 50vh; display: flex; align-items: center; justify-content: center; }
  .hero-bg-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); }
  .hero-with-bg .hero-inner, .hero-full-img .hero-inner { position: relative; z-index: 1; padding: var(--space-3xl) var(--space-lg); text-align: center; color: #fff; }
  .hero-with-bg .hero-inner .cta-btn, .hero-full-img .hero-inner .cta-btn { background: #fff; color: #111; }
  .hero-sample-img { width: 100%; max-height: 280px; object-fit: cover; border-radius: 0.5rem; margin-bottom: var(--space-sm); }
  /* セクション余白リズム（テンプレートで上書き可） */
  .section-rhythm-after-hero { padding-top: var(--space-3xl); padding-bottom: var(--space-2xl); }
  .section-rhythm-default { padding-top: var(--space-2xl); padding-bottom: var(--space-2xl); }
  .section-rhythm-breath { padding-top: var(--space-3xl); padding-bottom: var(--space-3xl); }
  .section-rhythm-before-footer { padding-top: var(--space-2xl); padding-bottom: var(--space-3xl); }
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
  /* A-1: 余白スケールで高級感 — 広めのリズム */
  .page-wrapper.template-minimal_luxury { background: #F9F9F7; color: #1A1A1A; }
  .page-wrapper.template-minimal_luxury .container { max-width: 1280px; margin: 0 auto; padding: 0 var(--space-lg); }
  @media (min-width: 1024px) {
    .page-wrapper.template-minimal_luxury .container { padding: 0 var(--space-3xl); }
  }
  .page-wrapper.template-minimal_luxury .section-rhythm-after-hero { padding-top: var(--space-4xl); padding-bottom: var(--space-3xl); }
  .page-wrapper.template-minimal_luxury .section-rhythm-default { padding-top: var(--space-3xl); padding-bottom: var(--space-3xl); }
  .page-wrapper.template-minimal_luxury .section-rhythm-breath { padding-top: var(--space-4xl); padding-bottom: var(--space-4xl); }
  .page-wrapper.template-minimal_luxury .section-rhythm-before-footer { padding-top: var(--space-3xl); padding-bottom: var(--space-4xl); }
  .page-wrapper.template-minimal_luxury header { padding: var(--space-lg) 0; border-bottom: 1px solid rgba(26,26,26,0.08); }
  .page-wrapper.template-minimal_luxury footer { padding: var(--space-4xl) 0 var(--space-3xl); border-top: 1px solid rgba(26,26,26,0.08); color: #1A1A1A; }
  .page-wrapper.template-minimal_luxury .logo { color: #1A1A1A; font-family: "Playfair Display", "Yu Mincho", serif; }
  .page-wrapper.template-minimal_luxury .section h2 { margin-bottom: var(--space-lg); }
  .page-wrapper.template-minimal_luxury .section p { margin-bottom: var(--space-sm); }
  /* Typography */
  .page-wrapper.template-minimal_luxury .hero h1 { font-family: "Playfair Display", "Yu Mincho", serif; font-size: 3.75rem; font-weight: 400; letter-spacing: 0.15em; color: #1A1A1A; margin: 0 0 var(--space-sm); line-height: 1.15; }
  .page-wrapper.template-minimal_luxury .hero .subheadline { font-family: system-ui, -apple-system, sans-serif; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.3em; color: #1A1A1A; opacity: 0.85; }
  .page-wrapper.template-minimal_luxury .section h2 { font-family: "Playfair Display", serif; color: #1A1A1A; font-size: 1.5rem; letter-spacing: 0.08em; }
  .page-wrapper.template-minimal_luxury .section p { color: #1A1A1A; line-height: 1.75; }
  /* Hero: 画像は右に w-2/3、タイトルを半分被せる z-10、角丸禁止 */
  .page-wrapper.template-minimal_luxury .hero { display: grid; grid-template-columns: 1fr 2fr; gap: 0; min-height: 70vh; align-items: center; padding: 0; }
  .page-wrapper.template-minimal_luxury .hero .hero-a1-text { position: relative; z-index: 10; padding: var(--space-lg) var(--space-lg) var(--space-lg) 0; }
  @media (min-width: 1024px) { .page-wrapper.template-minimal_luxury .hero .hero-a1-text { padding: var(--space-lg) var(--space-3xl) var(--space-lg) 0; } }
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
    .page-wrapper.template-minimal_luxury .hero .hero-a1-text { order: 1; padding: var(--space-lg) 0; }
    .page-wrapper.template-minimal_luxury .hero h1 { font-size: 2.25rem; letter-spacing: 0.1em; }
  }
  .page-wrapper.template-minimal_luxury * { border-radius: 0; }
  /* Animation: initial opacity 0 y 40 → animate 1 0, duration 1.2, ease [0.22,1,0.36,1], viewport once */
  .page-wrapper.template-minimal_luxury [data-a1-animate] { opacity: 0; transform: translateY(40px); transition: opacity 1.2s cubic-bezier(0.22, 1, 0.36, 1), transform 1.2s cubic-bezier(0.22, 1, 0.36, 1); }
  .page-wrapper.template-minimal_luxury [data-a1-animate].a1-visible { opacity: 1; transform: translateY(0); }
  .page-wrapper.template-minimal_luxury .nav-link { color: #1A1A1A; }
  .page-wrapper.template-minimal_luxury .nav-link:hover { text-decoration: none; opacity: 0.7; }
  .page-wrapper.template-minimal_luxury .cta-btn { border: 1px solid #1A1A1A; color: #1A1A1A; background: transparent; }
  .page-wrapper.template-minimal_luxury .cta-btn:hover { background: rgba(26,26,26,0.06); }
  .page-wrapper.template-minimal_luxury .cta-block { padding: var(--space-3xl) 0 var(--space-2xl); }
  .page-wrapper.template-minimal_luxury .quote-block { font-family: "Playfair Display", serif; letter-spacing: 0.05em; color: #1A1A1A; margin: var(--space-3xl) 0; padding: var(--space-xl); }
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
  .page-wrapper.template-dark_edge { font-family: "Helvetica Neue", Arial, sans-serif; color: #fff; background: #080808; }
  .page-wrapper.template-dark_edge .hero { min-height: 100vh; position: relative; display: flex; align-items: center; justify-content: center; }
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
  .page-wrapper.template-dark_edge .nav-overlay { position: fixed; inset: 0; z-index: 50; background: #080808; display: flex; align-items: center; justify-content: center; opacity: 0; visibility: hidden; transition: opacity 0.3s, visibility 0.3s; }
  .page-wrapper.template-dark_edge .nav-toggle:checked ~ .nav-overlay { opacity: 1; visibility: visible; }
  .page-wrapper.template-dark_edge .nav-overlay-inner { display: flex; flex-direction: column; gap: var(--space-2xl); text-align: center; }
  .page-wrapper.template-dark_edge .nav-overlay-link { color: #fff; font-size: 1.5rem; text-transform: uppercase; letter-spacing: 0.2em; text-decoration: none; }
  .page-wrapper.template-dark_edge .nav-overlay-link:hover { color: #c9a227; }
  .page-wrapper.template-dark_edge .cta-btn-hero { border: 2px solid #fff; color: #fff; background: transparent; margin: 0 var(--space-xs); }
  .page-wrapper.template-dark_edge .cta-btn-hero:hover { background: #fff; color: #080808; }
  .page-wrapper.template-dark_edge .cta-btn-hero-outline { border: 2px solid #c9a227; color: #c9a227; background: transparent; }
  .page-wrapper.template-dark_edge .cta-btn-hero-outline:hover { background: #c9a227; color: #080808; }
  .page-wrapper.template-dark_edge .hero-cta-wrap { margin-top: var(--space-lg); display: flex; flex-wrap: wrap; gap: var(--space-sm); justify-content: center; }
  .page-wrapper.template-dark_edge .section-img-wrap { margin: 0 calc(-1 * var(--space-lg)) var(--space-sm); }
  .page-wrapper.template-dark_edge .section-img { width: 100%; max-height: 400px; transition: transform 0.5s ease; }
  .page-wrapper.template-dark_edge .footer-cols { color: #999; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.75rem; }
  @keyframes dark-ken-burns { 0% { transform: scale(1.12); } 100% { transform: scale(1); } }
  .page-wrapper.template-dark_edge .hero-bg-ken-burns { animation: dark-ken-burns 25s ease-out infinite alternate; }
  .page-wrapper.template-dark_edge [data-scroll-in] { opacity: 0; transform: translateY(28px); transition: opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1), transform 0.9s cubic-bezier(0.22, 1, 0.36, 1); }
  .page-wrapper.template-dark_edge [data-scroll-in].in-view { opacity: 1; transform: translateY(0); }
  .page-wrapper.template-dark_edge .section-img-wrap { overflow: hidden; }
  .page-wrapper.template-dark_edge .section-img-wrap:hover .section-img { transform: scale(1.05); }
  `
  ),
  makeTemplate(
    'corporate_trust',
    'Corporate Trust',
    '重厚と信頼（A-3）',
    `
  @keyframes ken-burns { 0% { transform: scale(1.1); } 100% { transform: scale(1); } }
  .page-wrapper.template-corporate_trust { font-family: "Noto Sans JP", "Hiragino Kaku Gothic ProN", sans-serif; font-weight: 700; color: #1e293b; background: #f8fafc; }
  .page-wrapper.template-corporate_trust .container { padding: 0 var(--space-lg); }
  @media (min-width: 1024px) { .page-wrapper.template-corporate_trust .container { padding: 0 var(--space-2xl); } }
  .page-wrapper.template-corporate_trust .hero { padding: var(--space-3xl) var(--space-lg); text-align: center; }
  .page-wrapper.template-corporate_trust .hero h1 { font-size: 2.25rem; font-weight: 700; color: #0f172a; margin: 0 0 var(--space-sm); }
  .page-wrapper.template-corporate_trust .section-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-lg); margin-top: var(--space-2xl); }
  .page-wrapper.template-corporate_trust .section-card { padding: var(--space-md); background: #fff; border-left: 4px solid #1e3a8a; border-radius: 0.5rem; }
  .page-wrapper.template-corporate_trust .section-card.section-rhythm-after-hero,
  .page-wrapper.template-corporate_trust .section-card.section-rhythm-default,
  .page-wrapper.template-corporate_trust .section-card.section-rhythm-breath,
  .page-wrapper.template-corporate_trust .section-card.section-rhythm-before-footer { padding-top: var(--space-md); padding-bottom: var(--space-md); }
  .page-wrapper.template-corporate_trust .section-card h2 { font-size: 1rem; margin: 0 0 var(--space-xs); }
  .page-wrapper.template-corporate_trust .section-card p { font-size: 0.875rem; font-weight: 500; margin: 0; }
  .page-wrapper.template-corporate_trust .hero-bg-img { animation: ken-burns 20s ease-out infinite alternate; }
  .page-wrapper.template-corporate_trust .section h2 { color: #0f172a; }
  .page-wrapper.template-corporate_trust footer { color: #475569; }
  .page-wrapper.template-corporate_trust .cta-btn { background: #1e3a8a; color: #fff; border: none; }
  .page-wrapper.template-corporate_trust .cta-btn:hover { background: #1e40af; }
  .page-wrapper.template-corporate_trust .nav-link { color: #1e293b; }
  .page-wrapper.template-corporate_trust .stats-block { padding: 2rem 0; }
  .page-wrapper.template-corporate_trust .stat-value { color: #1e3a8a; }
  .page-wrapper.template-corporate_trust .section-card { transition: box-shadow 0.2s, border-color 0.2s; }
  .page-wrapper.template-corporate_trust .section-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-left-color: #2563eb; }
  .page-wrapper.template-corporate_trust .section-card-img { aspect-ratio: 16/10; overflow: hidden; margin: -1rem -1rem 1rem -1rem; border-radius: 0.5rem 0.5rem 0 0; }
  .page-wrapper.template-corporate_trust .section-card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
  .page-wrapper.template-corporate_trust .footer-cols { border-top: 1px solid #e2e8f0; padding-top: var(--space-lg); }
  .page-wrapper.template-corporate_trust .hero-with-bg { overflow: hidden; background: #0f172a; }
  .page-wrapper.template-corporate_trust .hero-bg-layer { position: absolute; inset: 0; background-image: var(--hero-bg-img); background-size: cover; background-position: center; z-index: 0; animation: corp-ken-burns 28s ease-out infinite alternate; }
  @keyframes corp-ken-burns { 0% { transform: scale(1.1); } 100% { transform: scale(1); } }
  .page-wrapper.template-corporate_trust .hero-bg-overlay { z-index: 1; }
  .page-wrapper.template-corporate_trust .hero-inner { z-index: 2; }
  .page-wrapper.template-corporate_trust [data-scroll-in] { opacity: 0; transform: translateY(24px); transition: opacity 0.7s ease-out, transform 0.7s ease-out; }
  .page-wrapper.template-corporate_trust [data-scroll-in].in-view { opacity: 1; transform: translateY(0); }
  .page-wrapper.template-corporate_trust .section-card-img { overflow: hidden; }
  .page-wrapper.template-corporate_trust .section-card:hover .section-card-img img { transform: scale(1.05); }
  `
  ),
  makeTemplate(
    'warm_organic',
    'Warm Organic',
    '自然と調和（B-1）',
    `
  .page-wrapper.template-warm_organic { font-family: "Hiragino Sans", "Noto Sans JP", sans-serif; color: #5c4033; background: #FDFBF7; }
  .page-wrapper.template-warm_organic .container { padding: 0 var(--space-lg); }
  @media (min-width: 1024px) { .page-wrapper.template-warm_organic .container { padding: 0 var(--space-2xl); } }
  .page-wrapper.template-warm_organic .hero { padding: var(--space-3xl) var(--space-lg); text-align: center; }
  .page-wrapper.template-warm_organic .hero h1 { font-size: 2rem; font-weight: 600; color: #3d2914; margin: 0 0 var(--space-sm); }
  .page-wrapper.template-warm_organic .section { border: 2px dashed #c4a77d; border-radius: 40px; margin-bottom: 0; transition: transform ${TRANSITION_PRO}; }
  .page-wrapper.template-warm_organic .section-rhythm-after-hero { padding: var(--space-2xl); }
  .page-wrapper.template-warm_organic .section-rhythm-default { padding: var(--space-xl); }
  .page-wrapper.template-warm_organic .section-rhythm-breath { padding: var(--space-2xl); }
  .page-wrapper.template-warm_organic .section-rhythm-before-footer { padding: var(--space-xl) var(--space-2xl) var(--space-2xl); }
  .page-wrapper.template-warm_organic .section:hover { transform: scale(1.01); }
  .page-wrapper.template-warm_organic .section h2 { color: #3d2914; margin-bottom: var(--space-md); }
  .page-wrapper.template-warm_organic .section p { margin-bottom: var(--space-sm); }
  .page-wrapper.template-warm_organic .img-wrap-rotate { transform: rotate(3deg); display: inline-block; }
  .page-wrapper.template-warm_organic .img-wrap-rotate:nth-child(even) { transform: rotate(-2deg); }
  .page-wrapper.template-warm_organic footer { padding: var(--space-3xl) 0 var(--space-2xl); color: #5c4033; }
  .page-wrapper.template-warm_organic .cta-btn { background: #b45309; color: #fff; border: none; border-radius: 2rem; padding: var(--space-md) var(--space-lg); }
  .page-wrapper.template-warm_organic .cta-btn:hover { transform: scale(1.02); }
  .page-wrapper.template-warm_organic .nav-link { color: #5c4033; }
  .page-wrapper.template-warm_organic .section-img-wrap { border-radius: 40px; overflow: hidden; border: 2px dashed #c4a77d; padding: var(--space-xs); }
  .page-wrapper.template-warm_organic .quote-block { color: #3d2914; border-left: 4px solid #c4a77d; text-align: left; padding-left: var(--space-sm); margin: var(--space-2xl) 0; }
  .page-wrapper.template-warm_organic .footer-cols { border-top: 1px dashed #c4a77d; }
  .page-wrapper.template-warm_organic .section-img { transition: transform 0.5s ease; }
  .page-wrapper.template-warm_organic .section-img-wrap:hover .section-img { transform: scale(1.03); }
  `
  ),
  makeTemplate(
    'pop_friendly',
    'Pop & Friendly',
    '楽しさと躍動（B-2）',
    `
  .page-wrapper.template-pop_friendly { font-family: "Noto Sans JP", sans-serif; background: #fef08a; color: #1a1a1a; }
  .page-wrapper.template-pop_friendly .container { padding: 0 var(--space-lg); }
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
  .page-wrapper.template-pop_friendly .cta-btn { background: #f472b6; color: #1a1a1a; border: 4px solid #000; box-shadow: 8px 8px 0 0 #000; }
  .page-wrapper.template-pop_friendly .cta-btn:hover { transform: translateY(-2px); box-shadow: 12px 12px 0 0 #000; }
  .page-wrapper.template-pop_friendly .cta-btn.cta-btn-secondary { background: #fef08a; }
  .page-wrapper.template-pop_friendly .nav-link { color: #1a1a1a; font-weight: 600; }
  .page-wrapper.template-pop_friendly .footer-cols { border: 4px solid #000; box-shadow: 8px 8px 0 0 #000; padding: var(--space-lg); margin: 0 var(--space-lg); background: #fff; }
  .page-wrapper.template-pop_friendly .badge { display: inline-block; padding: 0.25rem 0.5rem; font-size: 0.75rem; font-weight: 800; background: #f472b6; border: 2px solid #000; margin-left: 0.5rem; }
  .page-wrapper.template-pop_friendly .section-img-wrap { overflow: hidden; }
  .page-wrapper.template-pop_friendly .section-img { transition: transform 0.25s ease; }
  .page-wrapper.template-pop_friendly .section-img-wrap:hover .section-img { transform: scale(1.02); }
  `
  ),
  makeTemplate(
    'high_energy',
    'High Energy',
    '力強さと勢い（B-3）',
    `
  @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  .page-wrapper.template-high_energy { font-family: "Noto Sans JP", sans-serif; font-weight: 900; color: #0f0f0f; background: #fff; }
  .page-wrapper.template-high_energy .marquee-bar { position: fixed; top: 0; left: 0; right: 0; z-index: 50; background: #0f0f0f; color: #fff; padding: var(--space-xs) 0; overflow: hidden; white-space: nowrap; font-size: 1rem; letter-spacing: 0.1em; }
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
  .page-wrapper.template-high_energy .cta-btn { background: #eab308; color: #0f0f0f; border: none; font-weight: 900; padding: var(--space-md) var(--space-lg); }
  .page-wrapper.template-high_energy .cta-btn:hover { background: #ca8a04; transform: scale(1.02); }
  .page-wrapper.template-high_energy .marquee-bar + header { position: sticky; top: 0; z-index: 40; background: #0f0f0f; }
  .page-wrapper.template-high_energy .nav-link { color: #fff; font-weight: 700; }
  .page-wrapper.template-high_energy .stats-block { background: #0f0f0f; color: #fff; padding: var(--space-lg); margin: 0 calc(-1 * var(--space-lg)) var(--space-2xl); }
  .page-wrapper.template-high_energy .stat-value { color: #eab308; }
  .page-wrapper.template-high_energy .section-img-wrap { margin-bottom: var(--space-sm); overflow: hidden; }
  .page-wrapper.template-high_energy .section-img { transition: transform 0.4s ease; }
  .page-wrapper.template-high_energy .section-img-wrap:hover .section-img { transform: scale(1.03); }
  .page-wrapper.template-high_energy .footer-cols { background: #f1f5f9; padding: var(--space-lg); margin: 0 calc(-1 * var(--space-lg)); }
  `
  ),
];
