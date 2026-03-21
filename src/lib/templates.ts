import type { TemplateOption } from '../types';
import { NAVY_DELIVERABLE_SCOPED_CSS } from './navyDeliverableScopedCss';

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
  .page-wrapper .payment-fallback-hint { font-size: 0.875rem; margin: 0 0 0.75rem; }
  .page-wrapper .payment-fallback-hint a { color: var(--tp-accent, #2563eb); text-decoration: underline; }
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
  css: string,
  options?: { omitCommonBase?: boolean }
): TemplateOption {
  return {
    id,
    industryId: 'general',
    styleId: id as TemplateOption['styleId'],
    name,
    description,
    css: (options?.omitCommonBase ? '' : commonBase) + css,
  };
}

const NAVY_DELIVERABLE_PAGE_CSS =
  `
  .skip-link { position: absolute; top: -4rem; left: 16px; z-index: 10001; padding: 8px 16px; background: #1a1a1a; color: #fff; text-decoration: none; border-radius: 0.25rem; font-size: 0.875rem; transition: top 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
  .skip-link:focus { top: 16px; outline: 2px solid #22d3ee; outline-offset: 2px; }
  .page-wrapper.template-navy_cyan_consult main#main-content { padding: 0; margin: 0; max-width: none; }
  .page-wrapper.template-navy_cyan_consult .nc-jh-deliverable { position: relative; overflow-x: hidden; width: 100%; }
` + NAVY_DELIVERABLE_SCOPED_CSS;

const APPAREL_LOOKBOOK_PAGE_CSS = `
  .skip-link { position: absolute; top: -4rem; left: 16px; z-index: 10001; padding: 8px 16px; background: #1a1a1a; color: #fff; text-decoration: none; border-radius: 0.25rem; font-size: 0.875rem; transition: top 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
  .skip-link:focus { top: 16px; outline: 2px solid #79acc4; outline-offset: 2px; }
  .page-wrapper.template-apparel_lookbook main#main-content { padding: 0; margin: 0; max-width: none; }
  .page-wrapper.template-apparel_lookbook .alb-deliverable { position: relative; overflow-x: hidden; width: 100%; }
`;

/** テンプレ3〜11用の共通CSS（プレビュー用・professional・pet_salon・builder・clinic・gym 除く） */
const GENERIC_TEMPLATE_CSS = `
  .page-wrapper.template-cram_school, .page-wrapper.template-izakaya, .page-wrapper.template-apparel, .page-wrapper.template-event { --tp-bg: #F9F9F7; --tp-heading: #1A1A1A; --tp-text: #333; --tp-accent: #666; --tp-border: #e8e8e8; --tp-bg-footer: #F5F5F2; --hero-min-h: 75vh; background: var(--tp-bg); color: var(--tp-heading); }
  .page-wrapper.template-cram_school .container, .page-wrapper.template-izakaya .container, .page-wrapper.template-apparel .container, .page-wrapper.template-event .container { max-width: 960px; margin: 0 auto; padding: 0 24px; }
  .page-wrapper.template-cram_school header, .page-wrapper.template-izakaya header, .page-wrapper.template-apparel header, .page-wrapper.template-event header { padding: 20px 0; border-bottom: 1px solid var(--tp-border); }
  .page-wrapper.template-cram_school .cta-btn, .page-wrapper.template-izakaya .cta-btn, .page-wrapper.template-apparel .cta-btn, .page-wrapper.template-event .cta-btn { background: #1a1a1a; color: #fff; border: none; padding: 14px 28px; }
  .page-wrapper.template-cram_school .hero-full-img, .page-wrapper.template-izakaya .hero-full-img, .page-wrapper.template-apparel .hero-full-img, .page-wrapper.template-event .hero-full-img { min-height: var(--hero-min-h); }
`;

/** 士業（ネイビー×白・オレンジCTA・ステップ・実績・曲線・親しみ） */
const PROFESSIONAL_TEMPLATE_CSS = `
  .page-wrapper.template-professional { --pro-navy: #1a2744; --pro-navy-mid: #2a3a5c; --pro-sky: #e8f0fa; --pro-sky-soft: #f4f8fc; --pro-orange: #e8952c; --pro-orange-dark: #c97a1a; --tp-bg: #fff; --tp-heading: var(--pro-navy); --tp-text: #334155; --tp-accent: var(--pro-navy); --tp-border: rgba(26,39,68,0.1); --tp-bg-footer: var(--pro-navy); --hero-min-h: 68vh; background: var(--tp-bg); color: var(--tp-text); font-family: "Hiragino Sans", "Noto Sans JP", sans-serif; }
  .page-wrapper.template-professional .container { max-width: 720px; margin: 0 auto; padding: 0 22px; }
  .page-wrapper.template-professional header { position: sticky; top: 0; z-index: 100; padding: 14px 0; background: rgba(255,255,255,0.97); backdrop-filter: blur(10px); border-bottom: 1px solid var(--tp-border); }
  .page-wrapper.template-professional .logo { font-size: 1.05rem; font-weight: 800; letter-spacing: 0.06em; color: var(--pro-navy); text-decoration: none; }
  .page-wrapper.template-professional .nav-link { font-size: 0.75rem; font-weight: 600; color: var(--pro-navy-mid); }
  .page-wrapper.template-professional .cta-btn { background: var(--pro-orange); color: #fff; border: none; padding: 12px 22px; min-height: 46px; font-size: 0.875rem; font-weight: 700; border-radius: 999px; }
  .page-wrapper.template-professional .pro-hero { min-height: var(--hero-min-h); }
  .page-wrapper.template-professional .pro-hero .hero-bg-overlay { background: linear-gradient(165deg, rgba(26,39,68,0.72) 0%, rgba(26,39,68,0.45) 45%, rgba(26,39,68,0.55) 100%); }
  .page-wrapper.template-professional .pro-hero .hero-inner h1 { font-size: clamp(1.4rem, 4.2vw, 2rem); font-weight: 800; color: #fff; text-shadow: 0 2px 24px rgba(0,0,0,0.35); }
  .page-wrapper.template-professional .pro-hero .cta-btn-primary { background: var(--pro-orange); color: #fff; }
  .page-wrapper.template-professional .pro-trust-wrap, .page-wrapper.template-professional .pro-flow, .page-wrapper.template-professional .pro-stats-panel, .page-wrapper.template-professional .pro-concept, .page-wrapper.template-professional .pro-services, .page-wrapper.template-professional .pro-staff, .page-wrapper.template-professional .pro-price-wrap, .page-wrapper.template-professional .pro-faq, .page-wrapper.template-professional .pro-contact-band { }
  .page-wrapper.template-professional .pro-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; text-align: center; }
  .page-wrapper.template-professional .pro-stat-value { font-size: clamp(1.75rem, 5vw, 2.35rem); font-weight: 800; color: var(--pro-navy); }
  .page-wrapper.template-professional .pro-ghost-cta { display: inline-flex; min-height: 44px; padding: 0.5rem 1.5rem; font-size: 0.8125rem; font-weight: 700; color: var(--pro-navy); border: 1.5px solid var(--pro-navy); border-radius: 999px; text-decoration: none; }
  .page-wrapper.template-professional .pro-sticky-cta { position: fixed; bottom: 0; left: 0; right: 0; z-index: 95; display: flex; gap: 8px; padding: 10px 12px; background: rgba(255,255,255,0.98); border-top: 1px solid var(--tp-border); }
  .page-wrapper.template-professional .pro-sticky-cta .pro-sticky-primary { background: var(--pro-orange); color: #fff; }
  .page-wrapper.template-professional footer { background: var(--tp-bg-footer); color: rgba(255,255,255,0.92); }
  .page-wrapper.template-professional main { padding-bottom: 72px; }
`;

/** ペットサロン（ミント×白×ベージュ・アコーディオン規約・ヒーロー暗幕・日本語ナビ） */
const PET_SALON_TEMPLATE_CSS = `
  .page-wrapper.template-pet_salon { --pet-mint: #6BAFA0; --pet-mint-dark: #4a8f82; --pet-mint-light: #E8F4F1; --pet-cream: #FAF8F5; --pet-beige: #EDE8E2; --pet-text: #2d3436; --pet-text-soft: #5c6560; --tp-bg: #fff; --tp-heading: #2d3436; --tp-text: #2d3436; --tp-accent: var(--pet-mint); --tp-border: rgba(107,175,160,0.2); --tp-bg-footer: var(--pet-mint-dark); --hero-min-h: 72vh; background: var(--tp-bg); color: var(--pet-text); font-family: "Hiragino Sans", "Noto Sans JP", sans-serif; }
  .page-wrapper.template-pet_salon .container { max-width: 720px; margin: 0 auto; padding: 0 22px; }
  .page-wrapper.template-pet_salon header { position: sticky; top: 0; z-index: 100; padding: 14px 0; background: rgba(255,255,255,0.96); backdrop-filter: blur(8px); border-bottom: 1px solid var(--tp-border); }
  .page-wrapper.template-pet_salon .logo { font-size: 1.125rem; font-weight: 700; letter-spacing: 0.06em; color: var(--pet-mint-dark); text-decoration: none; }
  .page-wrapper.template-pet_salon .nav { display: flex; flex-wrap: wrap; gap: 6px 14px; justify-content: center; }
  .page-wrapper.template-pet_salon .nav-link { font-size: 0.8125rem; font-weight: 600; color: var(--pet-text-soft); text-decoration: none; padding: 4px 0; }
  .page-wrapper.template-pet_salon .nav-link:hover { color: var(--pet-mint-dark); }
  .page-wrapper.template-pet_salon .cta-btn { background: var(--pet-mint); color: #fff; border: none; padding: 12px 22px; min-height: 46px; font-size: 0.875rem; font-weight: 700; border-radius: 999px; box-shadow: 0 4px 14px rgba(107,175,160,0.35); }
  .page-wrapper.template-pet_salon .cta-btn:hover { background: var(--pet-mint-dark); color: #fff; }
  .page-wrapper.template-pet_salon .pet-hero { min-height: var(--hero-min-h); }
  .page-wrapper.template-pet_salon .pet-hero .hero-bg-overlay { background: linear-gradient(180deg, rgba(35,55,50,0.55) 0%, rgba(35,55,50,0.42) 50%, rgba(35,55,50,0.5) 100%); }
  .page-wrapper.template-pet_salon .pet-hero .hero-inner h1 { font-size: clamp(1.65rem, 5.5vw, 2.35rem); font-weight: 800; color: #fff; letter-spacing: 0.04em; text-shadow: 0 2px 20px rgba(0,0,0,0.45), 0 0 40px rgba(0,0,0,0.25); line-height: 1.35; }
  .page-wrapper.template-pet_salon .pet-hero .hero-inner .subheadline { color: rgba(255,255,255,0.96); font-size: 1rem; line-height: 1.65; text-shadow: 0 1px 12px rgba(0,0,0,0.4); margin-top: 0.75rem; }
  .page-wrapper.template-pet_salon .pet-hero .cta-btn-primary { background: #fff; color: var(--pet-mint-dark); box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
  .page-wrapper.template-pet_salon .pet-hero .cta-btn-primary:hover { background: var(--pet-mint-light); color: var(--pet-mint-dark); }
  .page-wrapper.template-pet_salon .pet-services { background: #fff; padding: 3rem 0 2.5rem; }
  .page-wrapper.template-pet_salon .pet-sec-title { font-size: 1.35rem; font-weight: 800; color: var(--pet-mint-dark); margin: 0 0 0.5rem; letter-spacing: 0.04em; }
  .page-wrapper.template-pet_salon .pet-sec-lede { font-size: 0.9rem; color: var(--pet-text-soft); margin: 0 0 2rem; line-height: 1.7; }
  .page-wrapper.template-pet_salon .pet-service-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 1.75rem; }
  .page-wrapper.template-pet_salon .pet-service-card { display: flex; gap: 1.15rem; align-items: flex-start; padding: 1.25rem 1.1rem; background: var(--pet-cream); border-radius: 16px; border: 1px solid rgba(107,175,160,0.12); }
  .page-wrapper.template-pet_salon .pet-service-icon { flex-shrink: 0; width: 3.25rem; height: 3.25rem; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; line-height: 1; background: #fff; border-radius: 50%; box-shadow: 0 2px 10px rgba(107,175,160,0.15); border: 2px dashed rgba(107,175,160,0.35); }
  .page-wrapper.template-pet_salon .pet-service-card h3 { font-size: 1.05rem; font-weight: 800; color: var(--pet-mint-dark); margin: 0 0 0.45rem; }
  .page-wrapper.template-pet_salon .pet-service-card p { font-size: 0.95rem; line-height: 1.85; color: var(--pet-text); margin: 0; }
  .page-wrapper.template-pet_salon .pet-concept { background: var(--pet-beige); padding: 2.75rem 0; }
  .page-wrapper.template-pet_salon .pet-concept .section-body h2 { font-size: 1.25rem; font-weight: 800; color: var(--pet-mint-dark); margin: 0 0 1.25rem; }
  .page-wrapper.template-pet_salon .pet-concept .section-body p { font-size: 1rem; line-height: 1.9; color: var(--pet-text); margin: 0 0 1rem; }
  .page-wrapper.template-pet_salon .pet-concept .section-img-wrap { border-radius: 14px; overflow: hidden; margin-bottom: 1.25rem; box-shadow: 0 8px 28px rgba(0,0,0,0.08); }
  .page-wrapper.template-pet_salon .section:not(.pet-concept):not(.pet-services):not(.pet-gallery):not(.pet-policy) .section-body h2 { font-size: 1.2rem; font-weight: 800; color: var(--pet-mint-dark); margin: 0 0 1rem; }
  .page-wrapper.template-pet_salon .section:not(.pet-concept) .section-body p { font-size: 1rem; line-height: 1.88; color: var(--pet-text); margin: 0 0 0.85rem; }
  .page-wrapper.template-pet_salon .pet-gallery { background: var(--pet-cream); padding: 2.75rem 0; }
  .page-wrapper.template-pet_salon .pet-gallery h2 { font-size: 1.25rem; font-weight: 800; color: var(--pet-mint-dark); margin: 0 0 0.65rem; }
  .page-wrapper.template-pet_salon .pet-gallery-lede { font-size: 0.9rem; color: var(--pet-text-soft); margin: 0 0 1.5rem; line-height: 1.7; }
  .page-wrapper.template-pet_salon .pet-gallery-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
  @media (min-width: 520px) { .page-wrapper.template-pet_salon .pet-gallery-grid { grid-template-columns: repeat(3, 1fr); gap: 12px; } }
  .page-wrapper.template-pet_salon .pet-gallery-grid img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 10px; display: block; }
  .page-wrapper.template-pet_salon .pet-policy { background: #fff; padding: 2.5rem 0 3rem; }
  .page-wrapper.template-pet_salon .pet-policy-note { font-size: 0.875rem; color: var(--pet-text-soft); margin: 0 0 1.25rem; line-height: 1.7; }
  .page-wrapper.template-pet_salon .pet-acc-item { border: 1px solid var(--tp-border); border-radius: 12px; margin-bottom: 0.65rem; overflow: hidden; background: var(--pet-cream); }
  .page-wrapper.template-pet_salon .pet-acc-sum { padding: 1rem 1.1rem; font-size: 0.95rem; font-weight: 700; color: var(--pet-mint-dark); cursor: pointer; list-style: none; display: flex; align-items: center; justify-content: space-between; }
  .page-wrapper.template-pet_salon .pet-acc-sum::-webkit-details-marker { display: none; }
  .page-wrapper.template-pet_salon .pet-acc-sum::after { content: '+'; font-weight: 300; font-size: 1.25rem; color: var(--pet-mint); }
  .page-wrapper.template-pet_salon .pet-acc-item[open] .pet-acc-sum::after { content: '−'; }
  .page-wrapper.template-pet_salon .pet-acc-body { padding: 0 1.1rem 1.15rem; font-size: 0.875rem; line-height: 1.8; color: var(--pet-text); border-top: 1px solid rgba(107,175,160,0.12); }
  .page-wrapper.template-pet_salon .pet-map-wrap { margin-top: 1rem; border-radius: 12px; overflow: hidden; border: 1px solid var(--tp-border); }
  .page-wrapper.template-pet_salon footer { padding: 2.5rem 0 2rem; background: var(--tp-bg-footer); color: #fff; border-top: none; }
  .page-wrapper.template-pet_salon footer .container { color: rgba(255,255,255,0.95); }
  .page-wrapper.template-pet_salon footer p { font-size: 0.9rem; line-height: 1.75; margin: 0.35rem 0; }
  .page-wrapper.template-pet_salon .footer-brand { font-size: 1.15rem; font-weight: 800; letter-spacing: 0.06em; color: #fff; margin-bottom: 0.75rem; }
  .page-wrapper.template-pet_salon .footer-legal { border-top-color: rgba(255,255,255,0.2); }
  .page-wrapper.template-pet_salon .footer-legal .presented-by a { color: rgba(255,255,255,0.85); }
  .page-wrapper.template-pet_salon .section-rhythm-after-hero { padding-top: 0; }
  .page-wrapper.template-pet_salon .section-rhythm-default { padding-top: 0; padding-bottom: 0; }
  @media (max-width: 768px) { .page-wrapper.template-pet_salon .nav { max-width: 100%; } .page-wrapper.template-pet_salon .header-inner { flex-direction: column; gap: 10px; } }
`;

/** ラーメン（白×エンジ・シズルヒーロー・メニュー写真・余白・食欲訴求） */
const RAMEN_TEMPLATE_CSS = `
  .page-wrapper.template-ramen { --ramen-red: #8B2E2E; --ramen-red-dark: #6b2222; --ramen-red-soft: #f8eeee; --tp-bg: #fff; --tp-heading: #1a1a1a; --tp-text: #333; --tp-accent: var(--ramen-red); --tp-border: rgba(139,46,46,0.15); --tp-bg-footer: var(--ramen-red); --hero-min-h: 70vh; background: var(--tp-bg); color: var(--tp-text); font-family: "Hiragino Sans", "Noto Sans JP", sans-serif; }
  .page-wrapper.template-ramen .container { max-width: 720px; margin: 0 auto; padding: 0 20px; }
  .page-wrapper.template-ramen header { position: sticky; top: 0; z-index: 100; padding: 12px 0; background: #fff; border-bottom: 2px solid var(--ramen-red); }
  .page-wrapper.template-ramen .logo { font-size: 1.2rem; font-weight: 800; letter-spacing: 0.04em; color: var(--ramen-red); text-decoration: none; }
  .page-wrapper.template-ramen .nav { display: flex; flex-wrap: wrap; gap: 6px 14px; justify-content: center; }
  .page-wrapper.template-ramen .nav-link { font-size: 0.8125rem; font-weight: 600; color: #333; text-decoration: none; }
  .page-wrapper.template-ramen .nav-link:hover { color: var(--ramen-red); }
  .page-wrapper.template-ramen .cta-btn { background: var(--ramen-red); color: #fff; border: none; padding: 12px 24px; min-height: 44px; font-size: 0.875rem; font-weight: 700; border-radius: 8px; }
  .page-wrapper.template-ramen .cta-btn:hover { background: var(--ramen-red-dark); color: #fff; }
  .page-wrapper.template-ramen .ramen-hero { min-height: var(--hero-min-h); }
  .page-wrapper.template-ramen .ramen-hero .hero-bg-overlay { background: linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.5) 100%); }
  .page-wrapper.template-ramen .ramen-hero .hero-inner h1 { font-size: clamp(1.5rem, 4.5vw, 2.1rem); font-weight: 800; color: #fff; text-shadow: 0 2px 20px rgba(0,0,0,0.5); line-height: 1.35; }
  .page-wrapper.template-ramen .ramen-hero .hero-inner .subheadline { color: rgba(255,255,255,0.95); font-size: 0.95rem; margin-top: 0.75rem; text-shadow: 0 1px 10px rgba(0,0,0,0.4); }
  .page-wrapper.template-ramen .ramen-hero .cta-btn-primary { background: var(--ramen-red); color: #fff; }
  .page-wrapper.template-ramen .ramen-hero .cta-btn-primary:hover { background: var(--ramen-red-dark); color: #fff; }
  .page-wrapper.template-ramen .section h2 { font-size: 1.15rem; font-weight: 800; color: var(--ramen-red); margin: 0 0 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--tp-border); }
  .page-wrapper.template-ramen .section p { font-size: 0.9375rem; line-height: 1.8; margin: 0 0 1rem; color: var(--tp-text); }
  .page-wrapper.template-ramen .section-rhythm-after-hero { padding-top: 2.5rem; padding-bottom: 2rem; }
  .page-wrapper.template-ramen .section-rhythm-default { padding-top: 2rem; padding-bottom: 2rem; }
  .page-wrapper.template-ramen .section-rhythm-before-footer { padding-top: 2rem; padding-bottom: 2.5rem; }
  .page-wrapper.template-ramen .section-img-wrap { border-radius: 12px; overflow: hidden; margin-bottom: 1rem; box-shadow: 0 6px 24px rgba(0,0,0,0.08); }
  .page-wrapper.template-ramen .ramen-menu-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 1rem; }
  @media (min-width: 560px) { .page-wrapper.template-ramen .ramen-menu-grid { grid-template-columns: repeat(3, 1fr); gap: 1.25rem; } }
  .page-wrapper.template-ramen .ramen-menu-item { background: #fff; border: 1px solid var(--tp-border); border-radius: 12px; overflow: hidden; }
  .page-wrapper.template-ramen .ramen-menu-item img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; }
  .page-wrapper.template-ramen .ramen-menu-item .ramen-menu-body { padding: 0.75rem; }
  .page-wrapper.template-ramen .ramen-menu-item .ramen-menu-name { font-weight: 700; color: var(--tp-heading); font-size: 0.9rem; margin: 0 0 0.25rem; }
  .page-wrapper.template-ramen .ramen-menu-item .ramen-menu-price { font-weight: 800; color: var(--ramen-red); font-size: 0.95rem; }
  .page-wrapper.template-ramen .ramen-map-wrap { margin-top: 1rem; border-radius: 12px; overflow: hidden; border: 1px solid var(--tp-border); }
  .page-wrapper.template-ramen footer { padding: 2rem 0; background: var(--tp-bg-footer); color: #fff; border-top: none; }
  .page-wrapper.template-ramen footer .footer-brand { color: #fff; font-weight: 800; }
  .page-wrapper.template-ramen footer p, .page-wrapper.template-ramen footer .footer-link { color: rgba(255,255,255,0.92); }
  .page-wrapper.template-ramen .footer-legal { border-top-color: rgba(255,255,255,0.2); }
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

/** パーソナルジム・ヨガ用（ダーク×ネオン＋参考LP寄せのグリーンCTA） */
const GYM_TEMPLATE_CSS = `
  .page-wrapper.template-gym_yoga {
    --gym-red: #1fa36f; --gym-red-dark: #157a52; --gym-black: #121212; --gym-neon: #CCFF00; --gym-white: #FFFFFF;
    --tp-bg: var(--gym-black); --tp-heading: var(--gym-white); --tp-text: rgba(255,255,255,0.92); --tp-accent: var(--gym-red); --tp-border: rgba(255,255,255,0.12); --tp-bg-footer: var(--gym-black);
    --hero-min-h: 75vh; font-family: "Noto Sans JP", "Hiragino Sans", sans-serif; font-weight: 600; background: var(--tp-bg); color: var(--tp-text);
  }
  @keyframes gym-hero-fade-up { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
  .page-wrapper.template-gym_yoga .gym-hero-inner > * { opacity: 0; animation: gym-hero-fade-up 0.85s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .page-wrapper.template-gym_yoga .gym-hero-inner > *:nth-child(1) { animation-delay: 0.1s; }
  .page-wrapper.template-gym_yoga .gym-hero-inner > *:nth-child(2) { animation-delay: 0.26s; }
  .page-wrapper.template-gym_yoga .gym-hero-inner > *:nth-child(3) { animation-delay: 0.42s; }
  .page-wrapper.template-gym_yoga .gym-hero-inner > *:nth-child(4) { animation-delay: 0.56s; }
  @media (prefers-reduced-motion: reduce) {
    .page-wrapper.template-gym_yoga .gym-hero-inner > * { animation: none; opacity: 1; transform: none; }
    .page-wrapper.template-gym_yoga .gym-sticky-cta .cta-btn { animation: none !important; }
  }
  .gym-audience-block { padding: var(--space-2xl) var(--space-lg); background: linear-gradient(180deg, #0d0d0d 0%, #121212 100%); border-bottom: 2px solid var(--tp-border); color: #fff; }
  .gym-audience-block h2 { font-size: clamp(1.25rem, 3.5vw, 1.75rem); font-weight: 900; text-align: center; margin: 0 0 0.75rem; letter-spacing: 0.04em; }
  .gym-audience-lede { max-width: 40rem; margin: 0 auto 1.75rem; text-align: center; font-size: 0.9375rem; line-height: 1.85; color: rgba(255,255,255,0.88); }
  .gym-audience-grid { display: grid; gap: 1.25rem; max-width: 960px; margin: 0 auto; }
  @media (min-width: 700px) { .gym-audience-grid { grid-template-columns: repeat(3, 1fr); } }
  .gym-audience-card { background: #1a1a1a; border: 1px solid var(--tp-border); border-radius: 14px; padding: 1.35rem 1.25rem; transition: border-color 0.35s ease, transform 0.35s ease; }
  .gym-audience-card:hover { border-color: var(--gym-neon); transform: translateY(-3px); }
  .gym-audience-tag { display: inline-block; font-size: 0.6875rem; font-weight: 800; letter-spacing: 0.14em; color: var(--gym-black); background: var(--gym-neon); padding: 0.35rem 0.65rem; border-radius: 4px; margin-bottom: 0.75rem; }
  .gym-audience-card h3 { font-size: 1.05rem; font-weight: 800; margin: 0 0 0.5rem; color: var(--gym-white); }
  .gym-audience-card p { margin: 0; font-size: 0.875rem; line-height: 1.75; color: rgba(255,255,255,0.88); }
  .gym-audience-cta { text-align: center; margin: 2rem 0 0; }
  .gym-ba-lede { text-align: center; font-size: 0.875rem; color: rgba(255,255,255,0.78); margin: -0.5rem 0 0.5rem; max-width: 36rem; margin-left: auto; margin-right: auto; padding: 0 1rem; }
  .gym-ba-section .gym-results-slide img { transform: scale(1.06); transition: transform 0.9s cubic-bezier(0.22, 1, 0.36, 1); }
  .gym-ba-section.in-view .gym-results-slide img { transform: scale(1); }
  @media (prefers-reduced-motion: reduce) { .gym-ba-section .gym-results-slide img { transform: none; transition: none; } }
  .gym-program-block { margin: 1.5rem auto 0; max-width: 720px; padding: 0 1rem; }
  .gym-program-heading { font-size: 1rem; font-weight: 800; color: var(--gym-neon); margin: 0 0 1rem; text-align: center; letter-spacing: 0.06em; }
  .gym-program-steps { list-style: none; margin: 0; padding: 0; counter-reset: gymstep; }
  .gym-program-step { display: flex; gap: 1rem; align-items: flex-start; padding: 1rem 0; border-bottom: 1px solid var(--tp-border); }
  .gym-program-step:last-child { border-bottom: none; }
  .gym-program-step-num { flex-shrink: 0; width: 2.5rem; height: 2.5rem; display: flex; align-items: center; justify-content: center; background: var(--gym-red); color: #fff; font-weight: 800; border-radius: 50%; font-size: 0.9375rem; }
  .gym-program-step-title { display: block; font-size: 1rem; color: var(--gym-white); margin-bottom: 0.35rem; }
  .gym-program-step p { margin: 0; font-size: 0.875rem; line-height: 1.7; color: var(--tp-text); }
  .gym-compare-wrap { margin: 2rem auto 0; max-width: 720px; padding: 0 1rem; }
  .gym-compare-heading { font-size: 1rem; font-weight: 800; color: var(--gym-white); text-align: center; margin: 0 0 1rem; }
  .gym-compare-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; border-radius: 12px; border: 1px solid var(--tp-border); }
  .gym-compare-table { width: 100%; min-width: 520px; border-collapse: collapse; font-size: 0.8125rem; background: #1a1a1a; }
  .gym-compare-table th, .gym-compare-table td { padding: 0.75rem 0.85rem; text-align: left; border-bottom: 1px solid var(--tp-border); vertical-align: top; }
  .gym-compare-table thead th { background: rgba(31,163,111,0.2); color: var(--gym-neon); font-weight: 800; }
  .gym-compare-table tbody th { color: var(--gym-white); font-weight: 700; width: 28%; }
  .gym-compare-table tbody td { color: rgba(255,255,255,0.88); }
  .gym-menu-section .gym-menu-cards { margin-top: 1.5rem; }
  .page-wrapper.template-gym_yoga .container { max-width: 960px; margin: 0 auto; padding: 0 20px; }
  .page-wrapper.template-gym_yoga header { position: sticky; top: 0; z-index: 100; padding: 12px 0; border-bottom: 1px solid var(--tp-border); background: var(--gym-black); }
  .page-wrapper.template-gym_yoga .logo { font-size: 1.125rem; font-weight: 800; color: var(--gym-white); text-decoration: none; letter-spacing: 0.06em; }
  .page-wrapper.template-gym_yoga .nav-link { color: rgba(255,255,255,0.9); }
  .page-wrapper.template-gym_yoga .cta-btn { background: var(--gym-red); color: #fff; border: none; padding: 14px 28px; min-height: 48px; font-weight: 700; letter-spacing: 0.06em; border-radius: 8px; }
  .page-wrapper.template-gym_yoga .cta-btn:hover { background: var(--gym-red-dark); color: #fff; }
  .page-wrapper.template-gym_yoga .hero-full-img { min-height: var(--hero-min-h); }
  .page-wrapper.template-gym_yoga .hero-bg-overlay { background: linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.4) 50%, rgba(18,18,18,0.85) 100%); }
  .page-wrapper.template-gym_yoga .hero-inner { text-align: center; }
  .page-wrapper.template-gym_yoga .hero-inner h1 { font-size: clamp(1.5rem, 4.5vw, 2.5rem); font-weight: 900; color: var(--gym-white); letter-spacing: 0.02em; text-shadow: 0 2px 24px rgba(0,0,0,0.6); line-height: 1.3; }
  .page-wrapper.template-gym_yoga .hero-inner .subheadline { color: rgba(255,255,255,0.95); font-size: 1rem; margin-top: 0.75rem; text-shadow: 0 1px 12px rgba(0,0,0,0.5); }
  .page-wrapper.template-gym_yoga .hero-full-img { min-height: 85vh; }
  .gym-hero-badge { display: inline-block; margin-bottom: 1rem; padding: 0.5rem 1rem; background: rgba(255,255,255,0.12); border: 2px solid var(--gym-neon); color: var(--gym-neon); font-size: 0.8125rem; font-weight: 800; letter-spacing: 0.12em; border-radius: 6px; }
  .gym-results-block { padding: var(--space-2xl) var(--space-lg); background: var(--gym-black); color: #fff; }
  .gym-results-block h2 { font-size: 0.875rem; font-weight: 700; letter-spacing: 0.12em; color: var(--gym-neon); margin: 0 0 1.5rem; text-align: center; }
  .gym-results-stats { display: flex; flex-wrap: wrap; justify-content: center; gap: 2rem 3rem; margin: 0; }
  .gym-results-stats .gym-stat-value { font-size: clamp(2rem, 6vw, 3.5rem); font-weight: 800; color: var(--gym-neon); display: block; letter-spacing: 0.02em; line-height: 1.1; }
  .gym-results-stats .gym-stat-label { font-size: 0.875rem; font-weight: 600; color: rgba(255,255,255,0.85); margin-top: 0.35rem; }
  .gym-results-slider { display: flex; gap: 1rem; overflow-x: auto; scroll-snap-type: x mandatory; padding: 1rem 0; margin-top: 1rem; -webkit-overflow-scrolling: touch; }
  .gym-results-slider::-webkit-scrollbar { height: 6px; }
  .gym-results-slider::-webkit-scrollbar-thumb { background: var(--gym-red); border-radius: 3px; }
  .gym-results-slide { flex: 0 0 85%; max-width: 320px; scroll-snap-align: start; border-radius: 12px; overflow: hidden; border: 1px solid var(--tp-border); background: #1a1a1a; }
  .gym-results-slide img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; }
  .gym-results-slide-caption { padding: 0.75rem 1rem; font-size: 0.875rem; font-weight: 700; color: var(--gym-neon); }
  .gym-results-slide-voice { padding: 0 1rem 0.75rem; font-size: 0.8125rem; color: rgba(255,255,255,0.9); font-style: italic; }
  .gym-quote-block { padding: 1.5rem var(--space-lg); background: #1a1a1a; text-align: center; border-top: 2px solid var(--tp-border); }
  .gym-trainer-quote { margin: 0; padding: 1rem 1.5rem; background: var(--gym-black); border: 2px solid var(--gym-neon); border-radius: 16px; font-size: 1.1rem; font-weight: 800; color: var(--gym-neon); display: inline-block; position: relative; }
  .gym-trainer-quote::before { content: ''; position: absolute; bottom: -12px; left: 50%; transform: translateX(-50%); border: 8px solid transparent; border-top-color: var(--gym-neon); }
  .gym-reasons-block { padding: var(--space-2xl) var(--space-lg); background: #1a1a1a; border-top: 2px solid var(--tp-border); }
  .gym-reasons-block h2 { font-size: 0.9375rem; font-weight: 800; letter-spacing: 0.08em; color: var(--gym-white); margin: 0 0 1.5rem; text-align: center; }
  .gym-reason-list { display: flex; flex-direction: column; gap: 1.5rem; max-width: 40rem; margin: 0 auto; }
  @media (min-width: 640px) { .gym-reason-list { flex-direction: row; flex-wrap: wrap; justify-content: center; gap: 1.5rem; } .gym-reason-item { flex: 1 1 280px; border-bottom: none; border: 1px solid var(--tp-border); border-radius: 12px; padding: 1.25rem; } }
  .gym-reason-item { display: flex; gap: 1rem; align-items: flex-start; padding: 1rem 0; border-bottom: 1px solid var(--tp-border); }
  .gym-reason-item:last-child { border-bottom: none; }
  .gym-reason-icon { font-size: 1.5rem; line-height: 1; flex-shrink: 0; }
  .gym-reason-num { flex-shrink: 0; width: 2.75rem; height: 2.75rem; display: flex; align-items: center; justify-content: center; background: var(--gym-red); color: #fff; font-size: 0.8125rem; font-weight: 800; border-radius: 8px; }
  .gym-reason-body h3 { font-size: 1.0625rem; font-weight: 800; color: var(--gym-white); margin: 0 0 0.35rem; }
  .gym-reason-body p { font-size: 0.9375rem; line-height: 1.8; color: var(--tp-text); margin: 0; }
  .gym-menu-lede { font-size: 0.9375rem; color: var(--tp-text); margin: 0 auto 1.25rem; max-width: 720px; padding: 0 1rem; text-align: center; }
  .gym-menu-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; max-width: 720px; margin: 0 auto; padding: 0 1rem; }
  @media (max-width: 600px) { .gym-menu-cards { grid-template-columns: 1fr; } }
  .gym-trainer-qa { background: #1a1a1a; }
  .gym-trainer-qa-list { max-width: 36rem; margin: 0 auto; }
  .gym-trainer-qa-item { padding: 1rem 0; border-bottom: 1px solid var(--tp-border); }
  .gym-trainer-qa-q { font-weight: 700; color: var(--gym-neon); margin: 0 0 0.35rem; font-size: 0.9375rem; }
  .gym-trainer-qa-a { margin: 0; color: var(--tp-text); font-size: 0.9375rem; line-height: 1.7; }
  .gym-menu-card { padding: 1.5rem; background: #1a1a1a; border: 2px solid var(--tp-border); border-radius: 12px; transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease; }
  .gym-menu-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.4); border-color: var(--gym-neon); }
  .gym-menu-card h3 { font-size: 1.1rem; font-weight: 800; color: var(--gym-white); margin: 0 0 0.75rem; }
  .gym-menu-card p { font-size: 0.9375rem; line-height: 1.75; color: var(--tp-text); margin: 0 0 0.5rem; }
  .gym-menu-card .gym-menu-price { font-size: 1rem; font-weight: 800; color: var(--gym-neon); }
  .page-wrapper.template-gym_yoga .section h2 { font-size: 1.1rem; font-weight: 800; letter-spacing: 0.04em; color: var(--gym-white); }
  .page-wrapper.template-gym_yoga .section p { color: var(--tp-text); }
  .page-wrapper.template-gym_yoga .section-rhythm-after-hero { padding-top: var(--space-2xl); padding-bottom: var(--space-2xl); }
  .page-wrapper.template-gym_yoga .section-rhythm-default { padding-top: var(--space-xl); padding-bottom: var(--space-xl); }
  .page-wrapper.template-gym_yoga .section-img-wrap { border-radius: 12px; overflow: hidden; border: 1px solid var(--tp-border); }
  .page-wrapper.template-gym_yoga footer { padding: var(--space-2xl) 0; border-top: 2px solid var(--gym-red); background: var(--tp-bg-footer); color: #fff; }
  .page-wrapper.template-gym_yoga footer .footer-brand { color: var(--gym-red); }
  .page-wrapper.template-gym_yoga footer p, .page-wrapper.template-gym_yoga footer a { color: rgba(255,255,255,0.88); }
  @keyframes gym-cta-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.03); } }
  .gym-sticky-cta { position: fixed; bottom: 1.25rem; right: 1.25rem; z-index: 90; padding: 0; text-align: right; }
  .gym-sticky-cta-note { font-size: 0.75rem; color: var(--gym-neon); margin: 0 0 0.5rem; padding: 0 0.25rem; font-weight: 700; }
  .gym-sticky-cta .cta-btn { min-width: 160px; padding: 14px 24px; box-shadow: 0 4px 20px rgba(31,163,111,0.45); animation: gym-cta-pulse 2s ease-in-out infinite; }
  .gym-footer-inner { padding: var(--space-2xl) var(--space-lg); text-align: center; }
  .gym-footer-sns { display: flex; justify-content: center; gap: 1.5rem; margin-bottom: 1rem; }
  .gym-footer-sns-link { color: var(--gym-neon); font-weight: 700; font-size: 0.9375rem; text-decoration: none; }
  .gym-footer-sns-link:hover { text-decoration: underline; }
  .gym-footer-badge { font-size: 0.8125rem; font-weight: 800; letter-spacing: 0.1em; color: var(--gym-red); margin: 0 0 1rem; }
  .reserve-cushion { font-size: 0.9375rem; text-align: center; padding: 0 1rem 0.5rem; margin: 0; color: #333; }
  .reserve-payment-note { font-size: 0.875rem; font-weight: 700; text-align: center; padding: 0 1rem 1rem; margin: 0; color: #2d5a4a; background: rgba(90,122,117,0.12); border-radius: 8px; margin-left: 1rem; margin-right: 1rem; margin-bottom: 1rem; }
  .page-wrapper.template-gym_yoga main { padding-bottom: 100px; }
  .page-wrapper.template-gym_yoga .gym-map-wrap { margin-top: 1rem; border-radius: 12px; overflow: hidden; border: 1px solid var(--tp-border); }
  .page-wrapper.template-gym_yoga .gym-faq-item { border-bottom: 1px solid var(--tp-border); }
  .page-wrapper.template-gym_yoga .gym-faq-q { width: 100%; padding: 1rem 0; text-align: left; background: none; border: none; color: var(--gym-white); font-size: 0.9375rem; font-weight: 600; cursor: pointer; }
  .page-wrapper.template-gym_yoga .gym-faq-a { padding: 0 0 1rem; color: var(--tp-text); font-size: 0.875rem; line-height: 1.75; }
  .reserve-screen-lite { background: #f5f2ec; color: #1a1a1a; padding: var(--space-2xl) var(--space-md); border-radius: 0; }
  .reserve-screen-lite .reserve-screen-title { position: static; width: auto; height: auto; clip: auto; font-size: 1.1rem; font-weight: 800; margin: 0 0 1rem; color: #1a1a1a; }
  .reserve-screen { background: #f5f5f3; color: #1a1a1a; padding: 1rem 0 5rem; min-height: 80vh; }
  .reserve-screen-title { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }
  .reserve-week { display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 1rem; }
  .reserve-week-prev, .reserve-week-next, .reserve-week-cal { background: #fff; border: 1px solid #ddd; border-radius: 6px; padding: 0.35rem 0.6rem; font-size: 1rem; cursor: pointer; }
  .reserve-week-range { font-size: 0.9375rem; font-weight: 600; min-width: 7rem; text-align: center; }
  .reserve-dates { display: flex; gap: 0.5rem; padding: 0 1rem; margin-bottom: 0.75rem; overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .reserve-date-tab { flex: 0 0 auto; padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid #e0e0e0; background: #fff; font-size: 0.8125rem; font-weight: 600; color: #333; cursor: pointer; }
  .reserve-date-tab-active { background: #5a7a75; color: #fff; border-color: #5a7a75; }
  .reserve-date-bar { background: #5a7a75; color: #fff; padding: 0.6rem 1rem; font-size: 0.9375rem; font-weight: 700; margin-bottom: 0.75rem; }
  .reserve-grid { padding: 0 1rem; }
  .reserve-grid-headers { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 0.5rem; }
  .reserve-col-header { font-size: 0.8125rem; font-weight: 700; color: #333; }
  .reserve-room-cap { font-weight: 500; color: #666; }
  .reserve-grid-body { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
  .reserve-col { display: flex; flex-direction: column; gap: 0.75rem; }
  .reserve-slot { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 0.75rem; font-size: 0.8125rem; display: flex; flex-direction: column; gap: 0.25rem; }
  .reserve-slot-time { font-weight: 700; color: #1a1a1a; }
  .reserve-slot-label { font-size: 0.75rem; color: #666; }
  .reserve-slot-full { background: #4a4a4a; border-color: #4a4a4a; color: #fff; position: relative; }
  .reserve-slot-full .reserve-slot-time { color: rgba(255,255,255,0.8); }
  .reserve-slot-full-label { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); font-size: 1.25rem; font-weight: 800; color: #fff; }
  .reserve-bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; z-index: 80; display: flex; align-items: flex-end; justify-content: space-around; padding: 0.5rem 0.5rem max(0.5rem, env(safe-area-inset-bottom)); background: #fff; border-top: 1px solid #e0e0e0; }
  .reserve-nav-item { font-size: 0.625rem; color: #666; text-decoration: none; display: flex; flex-direction: column; align-items: center; gap: 0.25rem; padding: 0.25rem; }
  .reserve-nav-item::before { content: ''; width: 24px; height: 24px; background: #ccc; border-radius: 50%; }
  .reserve-nav-item-active { color: #5a7a75; font-weight: 700; }
  .reserve-nav-item-active::before { background: #5a7a75; }
  .reserve-nav-qr { width: 48px; height: 48px; border-radius: 50%; background: #333; margin-top: -24px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 0.75rem; font-weight: 700; }
  .reserve-nav-qr::before { display: none; }
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
    'cafe_1',
    'カフェ（複数店舗・ミニマル）',
    '白基調・セリフアクセント・ヒーロースライド・右上メニュー・店舗別メニュー別タブ',
    `
  /* drawer + hero slider（cafe_tea と共通クラス・cafe_1 用トーン差分） */
  .wo-nav-cb { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
  .page-wrapper.template-cafe_1 .wo-nav-fab {
    position: fixed; top: max(1rem, env(safe-area-inset-top)); right: max(1rem, env(safe-area-inset-right)); z-index: 300;
    width: 3rem; height: 3rem; border-radius: 50%; background: rgba(255,255,255,0.92); border: 1px solid rgba(0,0,0,0.12); cursor: pointer;
    box-shadow: 0 6px 28px rgba(0,0,0,0.12); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .page-wrapper.template-cafe_1 .wo-nav-fab:hover { transform: scale(1.04); }
  .page-wrapper.template-cafe_1 .wo-nav-fab span { display: block; width: 1.1rem; height: 2px; background: #1a1a1a; border-radius: 1px; transition: transform 0.25s ease, opacity 0.2s; }
  .page-wrapper.template-cafe_1 .wo-nav-cb:checked ~ .wo-nav-fab span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .page-wrapper.template-cafe_1 .wo-nav-cb:checked ~ .wo-nav-fab span:nth-child(2) { opacity: 0; }
  .page-wrapper.template-cafe_1 .wo-nav-cb:checked ~ .wo-nav-fab span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
  .page-wrapper.template-cafe_1 .wo-nav-drawer {
    position: fixed; inset: 0; z-index: 250; background: rgba(18,18,18,0.35);
    display: flex; align-items: center; justify-content: flex-end; padding: 0;
    opacity: 0; visibility: hidden; transition: opacity 0.35s ease, visibility 0.35s;
  }
  .page-wrapper.template-cafe_1 .wo-nav-cb:checked ~ .wo-nav-drawer { opacity: 1; visibility: visible; }
  .page-wrapper.template-cafe_1 .wo-nav-backdrop { position: absolute; inset: 0; z-index: 0; cursor: pointer; }
  .page-wrapper.template-cafe_1 .wo-nav-drawer-inner {
    position: relative; z-index: 1; text-align: left; max-width: min(20rem, 88vw); width: 100%; height: 100%;
    background: #fafafa; padding: max(4rem, env(safe-area-inset-top)) 1.75rem 2rem; box-shadow: -12px 0 48px rgba(0,0,0,0.12);
    overflow-y: auto;
  }
  .page-wrapper.template-cafe_1 .wo-nav-drawer .wo-nav-brand { color: #9a9a9a; font-size: 0.7rem; letter-spacing: 0.22em; text-transform: uppercase; margin: 0 0 1.75rem; }
  .page-wrapper.template-cafe_1 .wo-nav-drawer a {
    display: flex; align-items: center; min-height: 48px; padding: 0.65rem 0; color: #111; text-decoration: none; font-size: 0.9375rem; font-weight: 500;
    border-bottom: 1px solid rgba(0,0,0,0.06); letter-spacing: 0.06em;
  }
  .page-wrapper.template-cafe_1 .wo-nav-drawer a:hover { color: #555; }
  .page-wrapper.template-cafe_1 .wo-nav-drawer .cta-btn { margin-top: 1.75rem; min-height: 48px; width: 100%; justify-content: center; background: #111; color: #fff; border: none; border-radius: 2px; }
  .page-wrapper.template-cafe_1 { --tp-bg: #fff; --tp-heading: #111; --tp-text: #3a3a3a; --tp-accent: #8b6914; --tp-brand: #1a1a1a; --tp-border: rgba(0,0,0,0.08); --hero-min-h: 78vh;
    font-family: "Noto Sans JP", "Hiragino Sans", sans-serif; color: var(--tp-text); background: var(--tp-bg); }
  .page-wrapper.template-cafe_1 .container { padding: 0 var(--space-lg); max-width: 40rem; margin: 0 auto; }
  .page-wrapper.template-cafe_1 header { display: none; }
  .page-wrapper.template-cafe_1 .wo-hero { position: relative; min-height: var(--hero-min-h); overflow: hidden; background: #222; }
  .page-wrapper.template-cafe_1 .wo-hero-viewport { position: absolute; inset: 0; overflow: hidden; }
  .page-wrapper.template-cafe_1 .wo-hero-track { display: flex; height: 100%; width: 100%; transition: transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94); will-change: transform; }
  .page-wrapper.template-cafe_1 .wo-hero-slide { flex: 0 0 100%; width: 100%; height: 100%; background-size: cover; background-position: center; }
  .page-wrapper.template-cafe_1 .wo-hero::after { content: ""; position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 40%, transparent 72%); z-index: 3; pointer-events: none; }
  .page-wrapper.template-cafe_1 .c1-hero-inner { position: absolute; left: 0; right: 0; bottom: 0; z-index: 10; text-align: center; padding: 2rem 1.5rem 4.5rem; color: #fff; text-shadow: 0 2px 24px rgba(0,0,0,0.45); }
  .page-wrapper.template-cafe_1 .c1-hero-brand { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.35em; text-transform: uppercase; margin: 0 0 0.35rem; }
  .page-wrapper.template-cafe_1 .c1-hero-tagline { font-family: "Cormorant Garamond", "Times New Roman", serif; font-size: clamp(1rem, 3vw, 1.25rem); font-style: italic; font-weight: 500; margin: 0; opacity: 0.95; letter-spacing: 0.02em; }
  .page-wrapper.template-cafe_1 .wo-hero-dots { position: absolute; bottom: 1.25rem; left: 50%; transform: translateX(-50%); z-index: 12; display: flex; gap: 0.45rem; }
  .page-wrapper.template-cafe_1 .wo-hero-dot { width: 7px; height: 7px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.9); background: transparent; padding: 0; cursor: pointer; }
  .page-wrapper.template-cafe_1 .wo-hero-dot.active { background: #fff; }
  .page-wrapper.template-cafe_1 .section.wo-sec { border: none; margin-bottom: 0; background: var(--tp-bg); border-bottom: 1px solid var(--tp-border); }
  .page-wrapper.template-cafe_1 .wo-sec-heading { font-size: 0.78rem; font-weight: 600; letter-spacing: 0.28em; text-transform: uppercase; color: #888; margin: 0 0 1rem; }
  .page-wrapper.template-cafe_1 .wo-lede-heading { font-size: 0.78rem; font-weight: 600; letter-spacing: 0.28em; text-transform: uppercase; color: #888; margin: 0 0 0.75rem; }
  .page-wrapper.template-cafe_1 .c1-lede-sub { font-family: "Cormorant Garamond", "Times New Roman", serif; font-size: 1.35rem; font-style: italic; color: var(--tp-heading); margin: 0 0 1.25rem; }
  .page-wrapper.template-cafe_1 .wo-lede-prose p, .page-wrapper.template-cafe_1 .wo-sec-prose p { font-size: 0.98rem; line-height: 2; color: var(--tp-text); }
  .page-wrapper.template-cafe_1 .section-img-wrap { border-radius: 0; overflow: hidden; }
  .page-wrapper.template-cafe_1 .c1-menu-zone { font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase; color: #aaa; margin: 1.5rem 0 0.75rem; }
  .page-wrapper.template-cafe_1 .c1-menu-zone:first-child { margin-top: 0; }
  .page-wrapper.template-cafe_1 .c1-menu-grid { display: flex; flex-direction: column; gap: 0.65rem; margin-top: 0.5rem; }
  .page-wrapper.template-cafe_1 .c1-menu-branch-btn {
    display: flex; align-items: center; justify-content: center; min-height: 52px; padding: 0.75rem 1rem; border: 1px solid var(--tp-heading); color: var(--tp-heading);
    text-decoration: none; font-size: 0.82rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; transition: background 0.2s, color 0.2s;
  }
  .page-wrapper.template-cafe_1 .c1-menu-branch-btn:hover { background: var(--tp-heading); color: #fff; }
  .page-wrapper.template-cafe_1 .c1-shop-card { margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--tp-border); }
  .page-wrapper.template-cafe_1 .c1-shop-card:first-of-type { margin-top: 1rem; padding-top: 0; border-top: none; }
  .page-wrapper.template-cafe_1 .c1-shop-img { width: 100%; aspect-ratio: 16/9; object-fit: cover; display: block; margin-bottom: 1rem; }
  .page-wrapper.template-cafe_1 .c1-shop-name { font-size: 1rem; font-weight: 600; letter-spacing: 0.08em; margin: 0 0 0.75rem; color: var(--tp-heading); }
  .page-wrapper.template-cafe_1 .c1-shop-detail p { margin: 0 0 0.4rem; font-size: 0.9rem; line-height: 1.75; }
  .page-wrapper.template-cafe_1 .c1-shop-actions { display: flex; flex-wrap: wrap; gap: 0.75rem 1.25rem; align-items: center; margin-top: 1rem; }
  .page-wrapper.template-cafe_1 .c1-shop-map { font-size: 0.8rem; letter-spacing: 0.06em; color: var(--tp-heading); text-decoration: none; border-bottom: 1px solid currentColor; }
  .page-wrapper.template-cafe_1 .c1-shop-res { display: inline-flex; align-items: center; justify-content: center; min-height: 40px; padding: 0 1rem; border: 1px solid var(--tp-heading); font-size: 0.75rem; letter-spacing: 0.12em; text-decoration: none; color: var(--tp-heading); }
  .page-wrapper.template-cafe_1 .c1-shop-res:hover { background: var(--tp-heading); color: #fff; }
  .page-wrapper.template-cafe_1 footer.footer-c1 { padding: var(--space-3xl) var(--space-md) calc(var(--space-3xl) + 2rem); text-align: center; background: var(--tp-bg); border-top: 1px solid var(--tp-border); position: relative; }
  .page-wrapper.template-cafe_1 .footer-c1-inner { position: relative; }
  .page-wrapper.template-cafe_1 .footer-c1-ig { display: inline-flex; width: 2.5rem; height: 2.5rem; align-items: center; justify-content: center; border: 1px solid var(--tp-border); border-radius: 50%; text-decoration: none; color: var(--tp-heading); font-size: 1.1rem; margin-bottom: 1.25rem; }
  .page-wrapper.template-cafe_1 .footer-c1-text { font-size: 0.75rem; letter-spacing: 0.04em; color: #666; margin: 0; }
  .page-wrapper.template-cafe_1 .c1-page-top {
    position: fixed; bottom: max(1.25rem, env(safe-area-inset-bottom)); right: max(1rem, env(safe-area-inset-right)); z-index: 200;
    width: 2.5rem; height: 2.5rem; border-radius: 50%; border: 1px solid #ccc; background: #fff; color: #666; text-decoration: none; font-size: 0.85rem;
    display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  }
  .page-wrapper.template-cafe_1 .wo-faq-item { border-bottom: 1px solid var(--tp-border); }
  .page-wrapper.template-cafe_1 .wo-faq-q { width: 100%; padding: 1rem 0; text-align: left; background: none; border: none; font-size: 1rem; cursor: pointer; }
  .page-wrapper.template-cafe_1 .wo-faq-a { max-height: 0; overflow: hidden; transition: max-height 0.35s ease; }
  .page-wrapper.template-cafe_1 .wo-faq-item.is-open .wo-faq-a { max-height: 30em; }
  .page-wrapper.template-cafe_1 .wo-price-table { width: 100%; border-collapse: collapse; }
  .page-wrapper.template-cafe_1 .wo-price-table td { padding: 0.65rem 0.75rem; border-bottom: 1px solid var(--tp-border); }
  .page-wrapper.template-cafe_1 .wo-form-control { padding: 0.85rem 1rem; border-radius: 2px; border: 1px solid var(--tp-border); }
  .page-wrapper.template-cafe_1 .wo-form-submit { min-height: 48px; background: #111; color: #fff; border: none; }
  .page-wrapper.template-cafe_1 .quote-block { text-align: center; border: none; border-left: 3px solid var(--tp-accent); padding: 1rem 1.25rem; background: rgba(139,105,20,0.06); }
  `,
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
    'Energetic Trust：ビビッドレッド×リッチブラック×ネオンイエロー・バッジ・Before/Afterスライダー・フローティングCTA',
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
    'ネイビー×白・オレンジCTA・流れ・実績数字・曲線で親しみやすく',
    PROFESSIONAL_TEMPLATE_CSS
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
    'ミント×ベージュの清潔感、手描き風アイコン付きサービス、規約はアコーディオンで読みやすく',
    PET_SALON_TEMPLATE_CSS
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
  makeTemplate(
    'ramen',
    'ラーメン',
    '白×エンジ・シズルヒーロー・お品書き・こだわり・店舗',
    RAMEN_TEMPLATE_CSS
  ),
  makeTemplate(
    'academy_lp',
    'ハイコンバージョンLP（テンプレ13）',
    '強い見出し・実績訴求・FAQ・申込導線を中心にした縦長LP',
    `
  .page-wrapper.template-academy_lp { --tp-bg:#0f1115; --tp-heading:#ffffff; --tp-text:#d7dce6; --tp-accent:#f7b500; --tp-border:rgba(255,255,255,0.12); --tp-bg-footer:#0b0d11; --hero-min-h:72vh; background:var(--tp-bg); color:var(--tp-text); font-family:"Noto Sans JP","Hiragino Sans",sans-serif; }
  .page-wrapper.template-academy_lp .container { max-width: 860px; margin: 0 auto; padding: 0 22px; }
  .page-wrapper.template-academy_lp header { position: sticky; top: 0; z-index: 100; background: rgba(11,13,17,0.85); backdrop-filter: blur(8px); border-bottom: 1px solid var(--tp-border); }
  .page-wrapper.template-academy_lp .logo { color: #fff; font-weight: 800; letter-spacing: .04em; }
  .page-wrapper.template-academy_lp .nav-link { color: #d7dce6; font-size: .82rem; }
  .page-wrapper.template-academy_lp .cta-btn { background: var(--tp-accent); color: #111; border: none; border-radius: 999px; padding: 12px 24px; min-height: 46px; font-weight: 800; }
  .page-wrapper.template-academy_lp .hero-full-img { min-height: var(--hero-min-h); }
  .page-wrapper.template-academy_lp .hero-bg-overlay { background: linear-gradient(180deg,rgba(0,0,0,.65),rgba(0,0,0,.4)); }
  .page-wrapper.template-academy_lp .hero-inner h1 { color: #fff; font-size: clamp(1.8rem,5vw,2.8rem); font-weight: 900; letter-spacing: .01em; text-shadow: 0 6px 24px rgba(0,0,0,.35); }
  .page-wrapper.template-academy_lp .hero-inner .subheadline { color: rgba(255,255,255,.92); max-width: 42rem; margin: .7rem auto 0; }
  .page-wrapper.template-academy_lp .section h2 { color: #fff; font-size: 1.35rem; border-left: 4px solid var(--tp-accent); padding-left: .7rem; margin-bottom: 1rem; }
  .page-wrapper.template-academy_lp .section { background: #131821; border: 1px solid var(--tp-border); border-radius: 14px; padding: 1.2rem; margin-bottom: 1rem; }
  .page-wrapper.template-academy_lp .section p { color: var(--tp-text); }
  .page-wrapper.template-academy_lp .cta-block { background: linear-gradient(135deg,#161d2a,#10141d); border: 1px solid var(--tp-border); border-radius: 14px; }
  .page-wrapper.template-academy_lp footer { background: var(--tp-bg-footer); color: #c8cfdb; border-top: 1px solid var(--tp-border); }
  `
  ),
  makeTemplate(
    'navy_cyan_consult',
    'ネイビー×シアン（Web制作・LP）',
    'テンプレ14：web-closer-intro 既定の固定HTML＋スコープCSS（納品デモは navyDeliverableSlug で切替）',
    NAVY_DELIVERABLE_PAGE_CSS,
    { omitCommonBase: true }
  ),
  makeTemplate(
    'apparel_lookbook',
    'アパレル・ルックブック',
    'テンプレ15：一色オープニング→写真→全画面動画、番号タップ横スライド、BASEのBUY導線（apparel-lookbook-intro）',
    APPAREL_LOOKBOOK_PAGE_CSS,
    { omitCommonBase: true }
  ),
];