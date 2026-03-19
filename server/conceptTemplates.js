/**
 * 6パターンテンプレート（絶対ルール準拠）
 * A-1 Minimal Luxury, A-2 Dark Edge, A-3 Corporate Trust
 * B-1 Warm Organic, B-2 Pop & Friendly, B-3 High Energy
 */
const EASE_PRO = 'cubic-bezier(0.16, 1, 0.3, 1)';
const TRANSITION_PRO = `0.8s ${EASE_PRO}`;

const SPACE = { xs: '8px', sm: '16px', md: '24px', lg: '32px', xl: '48px', '2xl': '64px', '3xl': '96px', '4xl': '128px', '5xl': '160px' };
const EASE = { outExpo: 'cubic-bezier(0.16, 1, 0.3, 1)', inOutSmooth: 'cubic-bezier(0.65, 0, 0.35, 1)' };
const HELL_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

const COMMON_BASE = `
  html { overflow-x: hidden; width: 100%; max-width: 100%; box-sizing: border-box; }
  body { overflow-x: hidden; width: 100%; max-width: 100%; margin: 0; padding: 0; box-sizing: border-box; -webkit-overflow-scrolling: touch; }
  .page-wrapper {
    box-sizing: border-box; margin: 0; padding: 0; overflow-x: hidden; max-width: 100%; overflow-wrap: break-word; word-wrap: break-word;
    --space-xs: ${SPACE.xs}; --space-sm: ${SPACE.sm}; --space-md: ${SPACE.md}; --space-lg: ${SPACE.lg};
    --space-xl: ${SPACE.xl}; --space-2xl: ${SPACE['2xl']}; --space-3xl: ${SPACE['3xl']}; --space-4xl: ${SPACE['4xl']}; --space-5xl: ${SPACE['5xl']};
    --ease-out-expo: ${EASE.outExpo}; --ease-in-out: ${EASE.inOutSmooth};
    --text-sm: 0.875rem; --text-base: 1rem; --text-lg: 1.125rem;
    --tp-bg: #fff; --tp-heading: #1a1a1a; --tp-text: #374151; --tp-accent: #1d4ed8; --tp-border: #e5e7eb; --tp-bg-footer: #f9fafb;
  }
  .page-wrapper * { box-sizing: border-box; }
  .skip-link { position: absolute; top: -4rem; left: var(--space-sm); z-index: 100; padding: var(--space-xs) var(--space-sm); background: #1a1a1a; color: #fff; text-decoration: none; border-radius: 0.25rem; font-size: var(--text-sm); transition: top 0.2s var(--ease-out-expo); }
  .skip-link:focus { top: var(--space-sm); outline: 2px solid var(--tp-accent); outline-offset: 2px; }
  .page-wrapper h1, .page-wrapper h2 { letter-spacing: -0.025em; }
  .page-wrapper p, .page-wrapper .subheadline { line-height: 1.625; }
  .page-wrapper .container { max-width: 960px; margin: 0 auto; padding-left: var(--space-sm); padding-right: var(--space-sm); }
  @media (min-width: 769px) { .page-wrapper .container { padding-left: var(--space-lg); padding-right: var(--space-lg); } }
  .page-wrapper img { max-width: 100%; height: auto; vertical-align: middle; }
  .page-wrapper header { padding: var(--space-sm) 0; border-bottom: 1px solid var(--tp-border); transition: background 0.35s var(--ease-out-expo), border-color 0.35s var(--ease-out-expo); }
  .header-inner { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--space-sm); }
  .page-wrapper .logo { font-size: clamp(1.125rem, 2vw + 0.5rem, 1.375rem); font-weight: 700; color: var(--tp-heading); text-decoration: none; }
  .nav { display: flex; flex-wrap: wrap; gap: var(--space-md); align-items: center; }
  .nav-link { position: relative; color: inherit; text-decoration: none; font-size: var(--text-sm); opacity: 0.92; transition: opacity 0.25s var(--ease-out-expo); }
  .nav-link::after { content: ''; position: absolute; left: 0; bottom: -3px; height: 1px; width: 0; background: currentColor; transition: width 0.3s var(--ease-out-expo); }
  .nav-link:hover, .nav-link:focus-visible { opacity: 1; outline: none; }
  .nav-link:hover::after, .nav-link:focus-visible::after { width: 100%; }
  .nav-link:focus-visible { outline: 2px solid var(--tp-accent); outline-offset: 2px; }
  .cta-btn { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: var(--space-sm) var(--space-lg); font-size: var(--text-sm); font-weight: 600; text-decoration: none; border-radius: 0.375rem; transition: opacity 0.25s var(--ease-out-expo), transform 0.25s var(--ease-out-expo); }
  .cta-btn:focus-visible { outline: 2px solid var(--tp-accent); outline-offset: 2px; }
  .cta-btn-primary { min-height: 48px; padding: var(--space-sm) var(--space-xl); font-size: var(--text-base); font-weight: 600; }
  .cta-block { text-align: center; padding: var(--space-2xl) 0; }
  .section-img-wrap { margin-bottom: var(--space-sm); }
  .section-img { width: 100%; height: auto; max-height: 320px; object-fit: cover; display: block; }
  .section-body { }
  .page-wrapper main { padding: var(--space-2xl) 0 var(--space-3xl); }
  .page-wrapper .section { margin-bottom: 0; }
  .page-wrapper .section h2 { font-size: clamp(1.25rem, 2vw + 0.5rem, 1.5rem); font-weight: 600; margin: 0 0 var(--space-md); letter-spacing: -0.025em; }
  .page-wrapper .section p { margin: 0 0 var(--space-sm); line-height: 1.625; font-size: var(--text-base); }
  .page-wrapper .section p:last-child { margin-bottom: 0; }
  .page-wrapper .section-body > p:first-of-type { font-size: var(--text-lg); line-height: 1.7; color: var(--tp-text); }
  .footer-cols { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2xl); text-align: left; }
  .footer-col p { margin: 0 0 var(--space-xs); font-size: var(--text-sm); }
  .footer-brand { font-weight: 700; }
  .footer-link { color: inherit; }
  .page-wrapper footer { padding: var(--space-3xl) 0 var(--space-2xl); border-top: 1px solid var(--tp-border); background: var(--tp-bg-footer); text-align: center; font-size: var(--text-sm); }
  .footer-legal { margin-top: var(--space-xl); padding-top: var(--space-md); border-top: 1px solid var(--tp-border); font-size: 0.8125rem; opacity: 0.85; }
  .page-wrapper .sns-links a { margin-right: var(--space-xs); }
  .page-wrapper .presented-by { font-size: 0.75rem; opacity: 0.7; margin-top: var(--space-xs); }
  .page-wrapper .presented-by a { color: inherit; text-decoration: none; }
  .page-wrapper .presented-by a:hover { text-decoration: underline; }
  .page-wrapper .qr-block { margin-top: var(--space-md); text-align: center; }
  .page-wrapper .qr-block .qr-block-mobile-note { font-size: 0.875rem; color: var(--tp-text); margin: 0 0 0.75rem; line-height: 1.5; }
  .page-wrapper .qr-block img.qr-block-img { max-width: 120px; }
  .page-wrapper .qr-block img { max-width: 120px; }
  @media (max-width: 768px) { .page-wrapper .qr-block .qr-block-img { display: none; } }
  .page-wrapper .section-payment .section-payment-note { font-size: 0.9375rem; color: var(--tp-text); margin: 0 0 1rem; }
  .page-wrapper .payment-iframe-wrap { width: 100%; min-height: 420px; border: 1px solid var(--tp-border); border-radius: 8px; overflow: hidden; background: #f8f8f8; }
  .page-wrapper .payment-iframe { width: 100%; height: 520px; border: 0; display: block; }
  .page-wrapper .payment-fallback-hint { font-size: 0.875rem; margin: 0 0 0.75rem; }
  .page-wrapper .payment-fallback-hint a { color: var(--tp-accent, #2563eb); text-decoration: underline; }
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
  .section-rhythm-after-hero { padding-top: var(--space-3xl); padding-bottom: var(--space-2xl); }
  .section-rhythm-default { padding-top: var(--space-2xl); padding-bottom: var(--space-2xl); }
  .section-rhythm-breath { padding-top: var(--space-3xl); padding-bottom: var(--space-3xl); }
  .section-rhythm-before-footer { padding-top: var(--space-2xl); padding-bottom: var(--space-3xl); }
  .page-wrapper .section { display: flex; flex-direction: column; gap: var(--space-lg); }
  .page-wrapper .section.section-alt { flex-direction: row; align-items: center; }
  .page-wrapper .section.section-alt.section-alt-reverse { flex-direction: row-reverse; }
  .page-wrapper .section.section-alt .section-img-wrap { flex: 0 0 42%; max-width: 420px; margin-bottom: 0; }
  .page-wrapper .section.section-alt .section-body { flex: 1; min-width: 0; }
  @media (max-width: 768px) { .page-wrapper .section.section-alt { flex-direction: column; } .page-wrapper .section.section-alt.section-alt-reverse { flex-direction: column; } .page-wrapper .section.section-alt .section-img-wrap { max-width: none; } }
  @keyframes hell-page-in { from { opacity: 0; } to { opacity: 1; } }
  @media (prefers-reduced-motion: no-preference) { body.page-wrapper { animation: hell-page-in 1.1s ${HELL_EASE} forwards; opacity: 0; } }
  @media (prefers-reduced-motion: reduce) { body.page-wrapper { opacity: 1 !important; animation: none !important; } }
  body.page-wrapper::after { content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 10000; opacity: 0.028; mix-blend-mode: multiply; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
  .page-wrapper { --hell-ease: ${HELL_EASE}; --shadow-lift: 0 1px 1px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.05), 0 20px 40px rgba(0,0,0,0.06); --shadow-press: 0 1px 2px rgba(0,0,0,0.06); --type-display: clamp(2.25rem, 6vw + 1rem, 4.25rem); --type-h2: clamp(1.5rem, 2.8vw + 0.75rem, 2.35rem); --type-lead: clamp(1.0625rem, 1.2vw + 0.9rem, 1.3125rem); --type-body: clamp(0.9375rem, 0.4vw + 0.875rem, 1.0625rem); }
  .page-wrapper .hero h1, .wo-hero-inner h1 {
    font-size: var(--type-display); line-height: 1.08; letter-spacing: -0.02em;
    word-break: keep-all; line-break: strict; text-wrap: balance;
  }
  .page-wrapper .section h2 { font-size: var(--type-h2); font-weight: 700; line-height: 1.15; letter-spacing: 0.04em; margin: 0 0 var(--space-lg); }
  .page-wrapper .section p { font-size: var(--type-body); line-height: 1.72; letter-spacing: 0.01em; }
  .page-wrapper .section-body > p:first-of-type { font-size: var(--type-lead); line-height: 1.75; letter-spacing: 0.02em; }
  .page-wrapper .cta-btn { box-shadow: var(--shadow-lift); letter-spacing: 0.08em; transition: transform 0.35s var(--hell-ease), box-shadow 0.35s var(--hell-ease), letter-spacing 0.45s var(--hell-ease), opacity 0.35s var(--hell-ease), background-color 0.35s var(--hell-ease); }
  .page-wrapper .cta-btn:hover { letter-spacing: 0.14em; transform: translateY(-2px); box-shadow: 0 2px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.08), 0 28px 56px rgba(0,0,0,0.08); }
  .page-wrapper .cta-btn:active { transform: translateY(1px); box-shadow: var(--shadow-press); }
  .section-rhythm-after-hero { padding-top: var(--space-4xl); padding-bottom: var(--space-3xl); }
  .section-rhythm-default { padding-top: var(--space-3xl); padding-bottom: var(--space-3xl); }
  .section-rhythm-breath { padding-top: var(--space-4xl); padding-bottom: var(--space-4xl); }
  .section-rhythm-before-footer { padding-top: var(--space-3xl); padding-bottom: var(--space-4xl); }
  .page-wrapper .section { gap: var(--space-xl); }
  .page-wrapper [data-scroll-in] { opacity: 0; transform: translateY(36px); transition: opacity 1.05s var(--hell-ease), transform 1.05s var(--hell-ease); }
  .page-wrapper [data-scroll-in].in-view { opacity: 1; transform: translateY(0); }
  @media (prefers-reduced-motion: reduce) { .page-wrapper [data-scroll-in] { opacity: 1; transform: none; transition: none; } }
`;

const A1_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const TEMPLATE_CSS_RAW = {
  minimal_luxury: `
  .page-wrapper.template-minimal_luxury { --tp-bg: #F9F9F7; --tp-heading: #1A1A1A; --tp-text: #1A1A1A; --tp-accent: #666666; --tp-border: rgba(26,26,26,0.08); --tp-bg-footer: #F5F5F2; --hero-min-h: 75vh; background: var(--tp-bg); color: var(--tp-heading); }
  .page-wrapper.template-minimal_luxury .container { max-width: 1280px; margin: 0 auto; padding: 0 32px; }
  @media (min-width: 1024px) { .page-wrapper.template-minimal_luxury .container { padding: 0 96px; } }
  .page-wrapper.template-minimal_luxury .section-rhythm-after-hero { padding-top: 128px; padding-bottom: 128px; }
  .page-wrapper.template-minimal_luxury .section-rhythm-default { padding-top: 128px; padding-bottom: 128px; }
  .page-wrapper.template-minimal_luxury .section-rhythm-breath { padding-top: 128px; padding-bottom: 128px; }
  .page-wrapper.template-minimal_luxury .section-rhythm-before-footer { padding-top: 128px; padding-bottom: 128px; }
  .page-wrapper.template-minimal_luxury header { padding: 32px 0; border-bottom: 1px solid var(--tp-border); background: transparent; }
  .page-wrapper.template-minimal_luxury header.scrolled { background: rgba(249,249,247,0.96); backdrop-filter: saturate(180%) blur(8px); }
  .page-wrapper.template-minimal_luxury footer { padding: 128px 0 96px; border-top: 1px solid var(--tp-border); background: var(--tp-bg-footer); color: var(--tp-heading); }
  .page-wrapper.template-minimal_luxury .section h2 { margin-bottom: 32px; }
  .page-wrapper.template-minimal_luxury .section p { margin-bottom: 16px; }
  .page-wrapper.template-minimal_luxury .header-a1-inner { display: flex; flex-direction: column; align-items: center; gap: 32px; }
  .page-wrapper.template-minimal_luxury .logo-a1 { font-family: "Playfair Display", "Yu Mincho", Georgia, serif; font-size: 3.75rem; font-weight: 400; letter-spacing: 0.3em; text-transform: uppercase; color: #1A1A1A; word-break: keep-all; line-break: strict; max-width: 100%; text-wrap: balance; }
  .page-wrapper.template-minimal_luxury .nav-a1 { display: flex; flex-wrap: wrap; justify-content: center; gap: 32px; }
  .page-wrapper.template-minimal_luxury .nav-a1 .nav-link { font-size: 10px; letter-spacing: 0.2em; opacity: 1; transition: opacity 0.3s ${A1_EASE}; }
  .page-wrapper.template-minimal_luxury .nav-a1 .nav-link::after { display: none; }
  .page-wrapper.template-minimal_luxury .nav-a1 .nav-link:hover { opacity: 0.5; }
  .page-wrapper.template-minimal_luxury .hero h1 { font-family: "Playfair Display", "Yu Mincho", serif; font-size: clamp(1.75rem, 5.5vw, 3.75rem); font-weight: 400; letter-spacing: 0.12em; color: #1A1A1A; margin: 0 0 16px; line-height: 1.2; word-break: keep-all; line-break: strict; text-wrap: balance; }
  .page-wrapper.template-minimal_luxury .hero .subheadline { font-family: system-ui, -apple-system, sans-serif; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.3em; color: #1A1A1A; opacity: 0.85; }
  .page-wrapper.template-minimal_luxury .section h2 { font-family: "Playfair Display", serif; color: #1A1A1A; font-size: 1.5rem; letter-spacing: 0.08em; }
  .page-wrapper.template-minimal_luxury .section p { color: #1A1A1A; line-height: 1.75; }
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
    .page-wrapper.template-minimal_luxury .hero h1 { font-size: clamp(1.5rem, 6vw, 2.25rem); letter-spacing: 0.08em; }
  }
  .page-wrapper.template-minimal_luxury * { border-radius: 0; }
  .page-wrapper.template-minimal_luxury [data-a1-animate] { opacity: 0; transform: translateY(40px); transition: opacity 1.2s ${A1_EASE}, transform 1.2s ${A1_EASE}; }
  .page-wrapper.template-minimal_luxury [data-a1-animate].a1-visible { opacity: 1; transform: translateY(0); }
  .page-wrapper.template-minimal_luxury .cta-btn, .page-wrapper.template-minimal_luxury .cta-btn-a1, .page-wrapper.template-minimal_luxury .cta-btn-primary { border: 0.5px solid #1A1A1A; color: #1A1A1A; background: transparent; padding: 16px 48px; border-radius: 0; box-shadow: none; }
  .page-wrapper.template-minimal_luxury .cta-btn:hover, .page-wrapper.template-minimal_luxury .cta-btn-a1:hover, .page-wrapper.template-minimal_luxury .cta-btn-primary:hover { background: transparent; opacity: 0.65; transform: none; box-shadow: none; letter-spacing: 0.2em; }
  .page-wrapper.template-minimal_luxury .cta-btn:active { transform: translateY(1px); opacity: 0.5; }
  body.template-minimal_luxury::after { opacity: 0.022; }
  .page-wrapper.template-minimal_luxury .cta-block { padding: 96px 0 64px; }
  .page-wrapper.template-minimal_luxury .quote-block { font-family: "Playfair Display", serif; letter-spacing: 0.05em; color: #1A1A1A; margin: 96px 0; padding: 48px; }
  .page-wrapper.template-minimal_luxury input, .page-wrapper.template-minimal_luxury textarea { border: none; border-bottom: 1px solid #1A1A1A; border-radius: 0; background: transparent; padding: 8px 0; }
  .page-wrapper.template-minimal_luxury input:focus, .page-wrapper.template-minimal_luxury textarea:focus { outline: none; border-bottom-color: #666666; }
  .page-wrapper.template-minimal_luxury .section-img-wrap { aspect-ratio: 3/4; overflow: hidden; }
  .page-wrapper.template-minimal_luxury .section-img { max-height: none; height: 100%; }
  .page-wrapper.template-minimal_luxury .footer-cols { grid-template-columns: 1fr 1fr; }
  .page-wrapper.template-minimal_luxury .footer-brand { font-family: "Playfair Display", serif; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.1em; }
  `,
  dark_edge: `
  .page-wrapper.template-dark_edge { --tp-bg: #080808; --tp-heading: #fff; --tp-text: #e5e5e5; --tp-accent: #c9a227; --tp-border: #222; --tp-bg-footer: #0a0a0a; --hero-min-h: 100vh; font-family: "Helvetica Neue", Arial, sans-serif; color: #fff; background: var(--tp-bg); }
  .page-wrapper.template-dark_edge header { background: transparent; }
  .page-wrapper.template-dark_edge header.scrolled { background: rgba(8,8,8,0.95); }
  .page-wrapper.template-dark_edge .hero { min-height: var(--hero-min-h); position: relative; display: flex; align-items: center; justify-content: center; }
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
  .page-wrapper.template-dark_edge .quote-block { color: #e5e5e5; border-left: 3px solid #c9a227; text-align: left; padding-left: var(--space-lg); background: rgba(255,255,255,0.03); }
  `,
  corporate_trust: `
  @keyframes ken-burns { 0% { transform: scale(1.1); } 100% { transform: scale(1); } }
  .page-wrapper.template-corporate_trust { --tp-bg: #f8fafc; --tp-heading: #0f172a; --tp-text: #1e293b; --tp-accent: #2563eb; --tp-border: #e2e8f0; --tp-bg-footer: #f1f5f9; --hero-min-h: 60vh; font-family: "Noto Sans JP", "Hiragino Kaku Gothic ProN", sans-serif; font-weight: 700; color: #1e293b; background: var(--tp-bg); }
  .page-wrapper.template-corporate_trust header { background: transparent; }
  .page-wrapper.template-corporate_trust header.scrolled { background: rgba(255,255,255,0.95); backdrop-filter: saturate(180%) blur(8px); border-color: var(--tp-border); }
  .page-wrapper.template-corporate_trust .container { padding: 0 var(--space-lg); }
  @media (min-width: 1024px) { .page-wrapper.template-corporate_trust .container { padding: 0 var(--space-2xl); } }
  .page-wrapper.template-corporate_trust .hero { position: relative; min-height: 50vh; padding: var(--space-3xl) var(--space-lg); text-align: center; display: flex; align-items: center; justify-content: center; }
  .page-wrapper.template-corporate_trust .hero h1 { font-size: 2.25rem; font-weight: 700; color: #0f172a; margin: 0 0 var(--space-sm); }
  .page-wrapper.template-corporate_trust .section-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-lg); margin-top: var(--space-2xl); }
  .page-wrapper.template-corporate_trust .section-card { padding: var(--space-md); background: #fff; border-left: 4px solid #1e3a8a; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
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
  .page-wrapper.template-corporate_trust .section-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.1); border-left-color: #2563eb; }
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
  .page-wrapper.template-corporate_trust .hero-with-bg { min-height: var(--hero-min-h); }
  .page-wrapper.template-corporate_trust .quote-block { color: #0f172a; border-left: 4px solid #1e3a8a; text-align: left; padding: var(--space-lg); background: #fff; }
  .page-wrapper.template-corporate_trust .stats-block .stat-value { font-size: 2.5rem; }
  `,
  warm_organic: `
  .page-wrapper.template-warm_organic {
    --tp-bg: #f2efe8; --tp-heading: #2c2418; --tp-text: #5c5348; --tp-accent: #b45309; --tp-accent-warm: #c47c2a;
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
  .wo-nav-fab span { display: block; width: 1.15rem; height: 2px; background: #fff; border-radius: 1px; transition: transform 0.25s ease, opacity 0.2s; }
  .wo-nav-cb:checked ~ .wo-nav-fab span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .wo-nav-cb:checked ~ .wo-nav-fab span:nth-child(2) { opacity: 0; }
  .wo-nav-cb:checked ~ .wo-nav-fab span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
  .wo-nav-drawer {
    position: fixed; inset: 0; z-index: 250; background: rgba(45,55,48,0.4);
    display: flex; align-items: center; justify-content: center; padding: 2rem;
    opacity: 0; visibility: hidden; transition: opacity 0.35s ease, visibility 0.35s;
  }
  .wo-nav-cb:checked ~ .wo-nav-drawer { opacity: 1; visibility: visible; }
  .wo-nav-backdrop { position: absolute; inset: 0; z-index: 0; cursor: pointer; }
  .wo-nav-drawer-inner { position: relative; z-index: 1; text-align: center; max-width: 22rem; width: 100%; background: rgba(35,45,38,0.97); padding: 2rem 1.5rem; border-radius: 0.5rem; box-shadow: 0 24px 64px rgba(0,0,0,0.35); }
  .wo-nav-drawer .wo-nav-brand { color: rgba(255,255,255,0.5); font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 1.5rem; }
  .wo-nav-drawer a { display: flex; align-items: center; min-height: 48px; padding: 0.75rem 1rem; color: #fff; text-decoration: none; font-size: 1.05rem; font-weight: 500; border-bottom: 1px solid rgba(255,255,255,0.08); box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  .wo-nav-drawer a:hover { color: #c9d4c9; }
  .wo-nav-drawer .cta-btn { margin-top: 1.5rem; min-height: 48px; padding: 0.875rem 1.5rem; border: none; }
  .wo-hero { position: relative; min-height: var(--hero-min-h); overflow: hidden; background: var(--tp-brand); }
  .wo-hero-viewport { position: absolute; inset: 0; overflow: hidden; }
  .wo-hero-track { display: flex; height: 100%; width: 100%; transition: transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94); will-change: transform; }
  .wo-hero-slide { flex: 0 0 100%; width: 100%; height: 100%; background-size: cover; background-position: center; }
  .wo-hero-strip { position: absolute; left: 0; top: 0; bottom: 0; width: min(22%, 6rem); background: linear-gradient(90deg, rgba(30,40,32,0.88) 0%, transparent 100%); z-index: 2; pointer-events: none; }
  .wo-hero::after { content: ""; position: absolute; inset: 0; background: linear-gradient(to top, rgba(15,18,14,0.75) 0%, rgba(30,35,30,0.35) 35%, transparent 60%); z-index: 3; pointer-events: none; }
  .wo-hero-inner { position: absolute; left: 0; right: 0; bottom: 0; z-index: 10; text-align: left; padding: 2rem 1.5rem 4rem max(1.5rem, env(safe-area-inset-left)); color: #fff; text-shadow: 0 2px 20px rgba(0,0,0,0.5), 0 0 40px rgba(0,0,0,0.25); }
  .wo-hero-eyebrow { font-size: 0.7rem; letter-spacing: 0.28em; text-transform: uppercase; opacity: 0.95; margin: 0 0 0.5rem; }
  .wo-hero-inner h1 { font-size: clamp(1.75rem, 5.5vw, 2.5rem); font-weight: 700; margin: 0 0 0.5rem; line-height: 1.2; word-break: keep-all; }
  .wo-hero-inner .subheadline { font-size: 0.95rem; font-weight: 400; opacity: 0.98; margin: 0 0 1.25rem; line-height: 1.6; }
  .wo-hero-inner .cta-btn { background: #fff; color: var(--tp-brand); font-weight: 600; border: none; box-shadow: 0 4px 20px rgba(0,0,0,0.25); min-height: 48px; padding: 0.75rem 1.5rem; }
  .wo-hero-inner .cta-btn:hover { background: #f5f5f0; letter-spacing: 0.06em; }
  .wo-hero-dots { position: absolute; bottom: 1.25rem; left: 50%; transform: translateX(-50%); z-index: 12; display: flex; gap: 0.5rem; align-items: center; }
  .wo-hero-dot { width: 8px; height: 8px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.85); background: transparent; padding: 0; cursor: pointer; transition: background 0.2s, transform 0.2s; }
  .wo-hero-dot.active { background: #fff; box-shadow: 0 0 0 2px var(--tp-brand); transform: scale(1.15); }
  .wo-hero-dot:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
  .page-wrapper.template-warm_organic .section.wo-sec { border: none; border-radius: 0; margin-bottom: 0; background: var(--tp-bg); border-bottom: 1px solid rgba(44,36,24,0.06); }
  .page-wrapper.template-warm_organic .section.wo-sec:last-of-type { border-bottom: none; }
  .page-wrapper.template-warm_organic .section-rhythm-after-hero { padding: var(--space-2xl) var(--space-lg); }
  .page-wrapper.template-warm_organic .section-rhythm-default { padding: var(--space-xl) var(--space-lg); }
  .page-wrapper.template-warm_organic .section-rhythm-breath { padding: var(--space-2xl) var(--space-lg); }
  .page-wrapper.template-warm_organic .section-rhythm-before-footer { padding: var(--space-xl) var(--space-lg) var(--space-2xl); }
  .page-wrapper.template-warm_organic .wo-sec-heading { font-size: 0.875rem; font-weight: 700; letter-spacing: 0.1em; color: #6e665c; margin: 0 0 1rem; }
  .page-wrapper.template-warm_organic .wo-lede-heading { font-size: 1.5rem; font-weight: 700; letter-spacing: -0.02em; color: var(--tp-heading); margin: 0 0 1rem; line-height: 1.4; }
  .page-wrapper.template-warm_organic .wo-lede-prose p, .page-wrapper.template-warm_organic .wo-sec-prose p { font-size: 1.0625rem; line-height: 1.9; color: var(--tp-text); margin: 0 0 0.85rem; }
  .page-wrapper.template-warm_organic .wo-lede-prose p:last-child, .page-wrapper.template-warm_organic .wo-sec-prose p:last-child { margin-bottom: 0; }
  @media (max-width: 768px) { .page-wrapper.template-warm_organic .wo-lede-prose p, .page-wrapper.template-warm_organic .wo-sec-prose p { line-height: 2; } }
  .page-wrapper.template-warm_organic .wo-text-mark { background: linear-gradient(transparent 62%, rgba(235,218,168,0.72) 62%); padding: 0.06em 0.15em; box-decoration-break: clone; -webkit-box-decoration-break: clone; }
  .page-wrapper.template-warm_organic .wo-hours-emphasis { font-size: 1.0625rem; font-weight: 500; line-height: 1.65; margin: 0 0 0.65rem; color: var(--tp-heading); }
  .page-wrapper.template-warm_organic .wo-hours-detail { font-size: 0.9375rem; line-height: 1.75; color: var(--tp-text); margin: 0 0 0.4rem; opacity: 0.92; }
  .page-wrapper.template-warm_organic .wo-faq-list { margin-top: 0.5rem; }
  .page-wrapper.template-warm_organic .wo-faq-item { border-bottom: 1px solid rgba(44,36,24,0.1); }
  .page-wrapper.template-warm_organic .wo-faq-q { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 1rem 0; text-align: left; background: none; border: none; font-size: 1rem; font-weight: 500; color: var(--tp-heading); cursor: pointer; font-family: inherit; }
  .page-wrapper.template-warm_organic .wo-faq-q::after { content: ''; width: 0.5rem; height: 0.5rem; border-right: 2px solid currentColor; border-bottom: 2px solid currentColor; transform: rotate(45deg); margin-left: 0.5rem; transition: transform 0.25s ease; }
  .page-wrapper.template-warm_organic .wo-faq-item.is-open .wo-faq-q::after { transform: rotate(-135deg); }
  .page-wrapper.template-warm_organic .wo-faq-a { max-height: 0; overflow: hidden; transition: max-height 0.35s ease; }
  .page-wrapper.template-warm_organic .wo-faq-item.is-open .wo-faq-a { max-height: 30em; }
  .page-wrapper.template-warm_organic .wo-faq-a p { margin: 0; padding: 0 0 1rem; font-size: 0.9375rem; line-height: 1.8; color: var(--tp-text); }
  .page-wrapper.template-warm_organic .wo-price-table-wrap { margin-top: 0.75rem; overflow-x: auto; }
  .page-wrapper.template-warm_organic .wo-price-table { width: 100%; border-collapse: collapse; font-size: 1rem; }
  .page-wrapper.template-warm_organic .wo-price-table td { padding: 0.65rem 0.75rem; border-bottom: 1px solid rgba(44,36,24,0.12); }
  .page-wrapper.template-warm_organic .wo-price-name { color: var(--tp-heading); }
  .page-wrapper.template-warm_organic .wo-price-value { text-align: right; font-weight: 600; color: var(--tp-accent); white-space: nowrap; }
  .page-wrapper.template-warm_organic .wo-sns-caption { font-size: 0.8125rem; color: #8a8278; margin: -0.35rem 0 0.85rem; }
  .page-wrapper.template-warm_organic .wo-sns-row { display: flex; flex-direction: row; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
  .page-wrapper.template-warm_organic .wo-sns-emoji { font-size: 2.5rem; line-height: 1; text-decoration: none; transition: transform 0.2s ease, opacity 0.2s ease; filter: drop-shadow(0 2px 6px rgba(44,36,24,0.08)); }
  .page-wrapper.template-warm_organic .wo-sns-emoji:hover { transform: scale(1.08); opacity: 0.88; }
  .page-wrapper.template-warm_organic .wo-form-block .wo-form { max-width: 36rem; margin-top: 0.25rem; }
  .page-wrapper.template-warm_organic .wo-form-field { margin-bottom: 1.35rem; }
  .page-wrapper.template-warm_organic .wo-form-label { display: block; font-size: 0.8125rem; font-weight: 600; letter-spacing: 0.06em; color: var(--tp-heading); margin-bottom: 0.45rem; }
  .page-wrapper.template-warm_organic .wo-form-control { width: 100%; box-sizing: border-box; padding: 0.9rem 1.05rem; font-size: 1.0625rem; line-height: 1.5; border: 1px solid rgba(44,36,24,0.14); border-radius: 8px; background: #fff; color: var(--tp-heading); transition: border-color 0.2s ease, box-shadow 0.2s ease; -webkit-appearance: none; appearance: none; }
  .page-wrapper.template-warm_organic .wo-form-control:focus { outline: none; border-color: rgba(180,83,9,0.45); box-shadow: 0 0 0 3px rgba(180,83,9,0.12); }
  .page-wrapper.template-warm_organic .wo-form-textarea { min-height: 11rem; resize: vertical; font-family: inherit; }
  .page-wrapper.template-warm_organic .wo-form-submit { margin-top: 0.25rem; cursor: pointer; border: none; min-height: 48px; padding: 0.875rem 2rem; min-width: 12rem; font-size: 1rem; font-weight: 600; background: var(--tp-accent); color: #fff; border-radius: 2rem; -webkit-tap-highlight-color: transparent; }
  .page-wrapper.template-warm_organic .section.wo-alt { display: grid; gap: var(--space-lg); }
  @media (min-width: 768px) {
    .page-wrapper.template-warm_organic .section.wo-alt { grid-template-columns: 1fr 1fr; align-items: center; }
    .page-wrapper.template-warm_organic .section.wo-alt-rev .section-img-wrap { order: 2; }
  }
  .page-wrapper.template-warm_organic .section-img-wrap { border-radius: 12px; overflow: hidden; border: none; padding: 0; box-shadow: 0 8px 32px rgba(45,55,48,0.12); }
  .page-wrapper.template-warm_organic .section-img-wrap.wo-img-wide .section-img { aspect-ratio: 16/10; object-fit: cover; }
  .page-wrapper.template-warm_organic .section-img-wrap.wo-img-tall .section-img { aspect-ratio: 3/4; object-fit: cover; }
  .page-wrapper.template-warm_organic .section-img-wrap.wo-img-square .section-img { aspect-ratio: 1; object-fit: cover; }
  .page-wrapper.template-warm_organic .section-img { transition: transform 0.5s ease; width: 100%; height: auto; display: block; max-height: 420px; object-fit: cover; }
  .page-wrapper.template-warm_organic .section-img-wrap:hover .section-img { transform: scale(1.02); }
  .page-wrapper.template-warm_organic .cta-btn { background: var(--tp-accent); color: #fff; border: none; border-radius: 2rem; padding: var(--space-md) var(--space-lg); box-shadow: 0 4px 14px rgba(180,83,9,0.22); display: inline-block; text-decoration: none; font-weight: 600; }
  .page-wrapper.template-warm_organic .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(180,83,9,0.28); }
  body.template-warm_organic::after { opacity: 0.028; mix-blend-mode: multiply; }
  .page-wrapper.template-warm_organic .quote-block { color: var(--tp-heading); border: none; border-left: 4px solid var(--tp-accent-warm); padding: 1rem 0 1rem 1.25rem; margin: var(--space-xl) 0; font-style: italic; font-size: 1.05rem; line-height: 1.8; text-align: left; background: rgba(180,83,9,0.06); border-radius: 0 8px 8px 0; }
  .page-wrapper.template-warm_organic footer.footer-wo { background: var(--tp-brand); color: rgba(255,255,255,0.92); padding: var(--space-2xl) 0 var(--space-xl); margin-top: var(--space-xl); }
  .page-wrapper.template-warm_organic footer.footer-wo .footer-cols { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-xl); text-align: left; border-top: 1px solid rgba(255,255,255,0.12); padding-top: var(--space-lg); }
  .page-wrapper.template-warm_organic footer.footer-wo .footer-col:first-child .footer-brand { display: block; font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; color: #fff; }
  .page-wrapper.template-warm_organic footer.footer-wo .footer-address, .page-wrapper.template-warm_organic footer.footer-wo .footer-col p { color: rgba(255,255,255,0.82); font-size: 0.9rem; line-height: 1.7; margin: 0 0 0.35rem; }
  .page-wrapper.template-warm_organic footer.footer-wo a { color: #e8f0e8; }
  .page-wrapper.template-warm_organic .wo-page-top { display: block; text-align: center; color: rgba(255,255,255,0.85); text-decoration: none; font-size: 0.8rem; letter-spacing: 0.15em; padding: 1rem 0 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: var(--space-lg); }
  .page-wrapper.template-warm_organic .wo-page-top:hover { color: #fff; }
  .page-wrapper.template-warm_organic .footer-legal .presented-by { color: rgba(255,255,255,0.45); font-size: 0.75rem; }
  .page-wrapper.template-warm_organic .qr-block .qr-block-mobile-note { font-size: 0.875rem; color: var(--tp-text); margin: 0 0 0.75rem; line-height: 1.6; }
  .page-wrapper.template-warm_organic .qr-block-img-wrap { margin-top: 0.5rem; }
  @media (max-width: 768px) { .page-wrapper.template-warm_organic .qr-block .qr-block-img { display: none; } .page-wrapper.template-warm_organic .qr-block .qr-block-mobile-note { margin-bottom: 0; } }
  `,
  pop_friendly: `
  .page-wrapper.template-pop_friendly { --tp-bg: #fef08a; --tp-heading: #1a1a1a; --tp-accent: #dc2626; --tp-border: #000; --tp-bg-footer: #fef9c3; --hero-min-h: 60vh; font-family: "Noto Sans JP", sans-serif; background: var(--tp-bg); color: #1a1a1a; }
  .page-wrapper.template-pop_friendly header { background: #fef08a; }
  .page-wrapper.template-pop_friendly header.scrolled { box-shadow: 0 4px 0 0 #000; }
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
  .page-wrapper.template-pop_friendly .badge { display: inline-block; padding: 0.25rem 0.5rem; font-size: 0.75rem; font-weight: 800; background: #f472b6; border: 2px solid #000; margin-left: var(--space-xs); }
  .page-wrapper.template-pop_friendly .hero-full-img .hero-bg-overlay { background: rgba(0,0,0,0.35); }
  .page-wrapper.template-pop_friendly .hero-full-img .hero-inner { color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.4); }
  .page-wrapper.template-pop_friendly .quote-block { background: #fff; border: 4px solid #000; box-shadow: 6px 6px 0 0 #000; padding: var(--space-lg); font-weight: 700; }
  `,
  high_energy: `
  @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  .page-wrapper.template-high_energy { --tp-bg: #fff; --tp-heading: #0f0f0f; --tp-text: #334155; --tp-accent: #eab308; --tp-border: #e2e8f0; --tp-bg-footer: #f1f5f9; --hero-min-h: 65vh; font-family: "Noto Sans JP", sans-serif; font-weight: 900; color: #0f0f0f; background: #fff; }
  .page-wrapper.template-high_energy header { background: transparent; }
  .page-wrapper.template-high_energy header.scrolled { background: rgba(15,15,15,0.98); }
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
  .page-wrapper.template-high_energy .section-img-wrap { margin-bottom: var(--space-sm); }
  .page-wrapper.template-high_energy .footer-cols { background: #f1f5f9; padding: var(--space-lg); margin: 0 calc(-1 * var(--space-lg)); }
  .page-wrapper.template-high_energy .hero-full-img { min-height: var(--hero-min-h); }
  .page-wrapper.template-high_energy .quote-block { color: #0f0f0f; font-weight: 800; background: #f1f5f9; padding: var(--space-xl); border-radius: 0.5rem; }
  .page-wrapper.template-high_energy .stats-block .stat-value { font-size: 2.75rem; }
  @media (max-width: 768px) {
    .page-wrapper.template-high_energy .stats-block { margin-left: 0; margin-right: 0; padding-left: var(--space-sm); padding-right: var(--space-sm); }
    .page-wrapper.template-high_energy .footer-cols { margin-left: 0; margin-right: 0; padding-left: var(--space-sm); padding-right: var(--space-sm); }
  }
  `,
};

export const TEMPLATE_IDS = [
  'salon_barber',       // 1. 個人美容室・理容室
  'cafe_tea',           // 2. カフェ・喫茶・パン・スイーツ
  'clinic_chiropractic', // 3. 整骨院・整体・鍼灸
  'gym_yoga',           // 4. パーソナルジム・ヨガ
  'builder',            // 5. 工務店・リノベ
  'professional',       // 6. 士業
  'cram_school',        // 7. 塾・習い事教室
  'izakaya',            // 8. こだわり居酒屋・バー
  'pet_salon',          // 9. ペットサロン・ドッグ
  'apparel',            // 10. アパレル
  'event',              // 11. イベント
];

/** 業種別のテンプレート候補（表示順は inferTemplatePriority を使用） */
export const CONCEPT_TEMPLATES = {
  general: TEMPLATE_IDS,
  cafe: TEMPLATE_IDS,
  restaurant: TEMPLATE_IDS,
  salon: TEMPLATE_IDS,
  retail: TEMPLATE_IDS,
  apparel: TEMPLATE_IDS,
  service: TEMPLATE_IDS,
  clinic: TEMPLATE_IDS,
};

const GENERIC_SELECTOR = '.page-wrapper.template-professional, .page-wrapper.template-izakaya, .page-wrapper.template-apparel, .page-wrapper.template-event';

/** 9. ペットサロン（ミント×白×ベージュ・手描き風アイコン・余白・アコーディオン規約・ヒーロー暗幕） */
const PET_SALON_CSS = `
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

/** テンプレ3〜10用の共通CSS（minimal_luxury ベース） */
const GENERIC_CSS = `
  ${GENERIC_SELECTOR} { --tp-bg: #F9F9F7; --tp-heading: #1A1A1A; --tp-text: #1A1A1A; --tp-accent: #666666; --tp-border: rgba(26,26,26,0.08); --tp-bg-footer: #F5F5F2; --hero-min-h: 75vh; background: var(--tp-bg); color: var(--tp-heading); }
  ${GENERIC_SELECTOR} .container { max-width: 1280px; margin: 0 auto; padding: 0 32px; }
  ${GENERIC_SELECTOR} header { padding: 32px 0; border-bottom: 1px solid var(--tp-border); background: transparent; }
  ${GENERIC_SELECTOR} footer { padding: 64px 0 48px; border-top: 1px solid var(--tp-border); background: var(--tp-bg-footer); }
  ${GENERIC_SELECTOR} .section h2 { margin-bottom: 24px; font-size: 1.35rem; }
  ${GENERIC_SELECTOR} .section p { margin-bottom: 16px; line-height: 1.75; }
  ${GENERIC_SELECTOR} .section-rhythm-after-hero { padding-top: 64px; padding-bottom: 64px; }
  ${GENERIC_SELECTOR} .section-rhythm-default { padding-top: 48px; padding-bottom: 48px; }
  ${GENERIC_SELECTOR} .section-rhythm-before-footer { padding-top: 48px; padding-bottom: 64px; }
  ${GENERIC_SELECTOR} .cta-btn { border: 1px solid #1A1A1A; color: #1A1A1A; background: transparent; padding: 14px 40px; border-radius: 0; }
  ${GENERIC_SELECTOR} .hero-full-img { min-height: var(--hero-min-h); }
`;

/** 1. 美容室・理容室用（GOALD/LECO/ALBUM 参照・白黒ベージュ・雑誌風） */
const SALON_BARBER_CSS = `
  .page-wrapper.template-salon_barber { --tp-bg: #fff; --tp-heading: #1a1a1a; --tp-text: #333; --tp-text-muted: #666; --tp-accent: #000; --tp-border: #e8e8e8; --tp-bg-footer: #f5f5f5; --hero-min-h: 75vh; background: var(--tp-bg); color: var(--tp-heading); font-family: "Hiragino Sans", "Noto Sans JP", sans-serif; }
  .page-wrapper.template-salon_barber .container { max-width: 960px; margin: 0 auto; padding: 0 24px; }
  .page-wrapper.template-salon_barber header { position: sticky; top: 0; z-index: 100; padding: 16px 0; border-bottom: 1px solid var(--tp-border); background: #fff; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
  .page-wrapper.template-salon_barber .header-inner { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; width: 100%; }
  .page-wrapper.template-salon_barber .logo { font-size: 1.25rem; font-weight: 700; letter-spacing: 0.12em; text-decoration: none; color: var(--tp-heading); }
  .page-wrapper.template-salon_barber .nav { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 20px; }
  .page-wrapper.template-salon_barber .nav-link { font-size: 0.8125rem; letter-spacing: 0.06em; color: var(--tp-text); text-decoration: none; padding: 6px 0; }
  .page-wrapper.template-salon_barber .cta-btn { background: #000; color: #fff; border: none; padding: 12px 24px; min-height: 44px; font-size: 0.8125rem; letter-spacing: 0.1em; border-radius: 0; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; font-family: inherit; }
  .page-wrapper.template-salon_barber .cta-btn:hover { background: #333; color: #fff; }
  .page-wrapper.template-salon_barber .hero-full-img { min-height: var(--hero-min-h); }
  .page-wrapper.template-salon_barber .hero-bg-overlay { background: rgba(0,0,0,0.5); }
  .page-wrapper.template-salon_barber .hero-inner { padding: 2rem 1.5rem 3rem; }
  .page-wrapper.template-salon_barber .hero-inner h1 { font-size: clamp(1.75rem, 5vw, 2.5rem); font-weight: 700; letter-spacing: 0.05em; color: #fff; text-shadow: 0 2px 24px rgba(0,0,0,0.6), 0 0 48px rgba(0,0,0,0.25); }
  .page-wrapper.template-salon_barber .hero-inner .subheadline { color: rgba(255,255,255,0.95); text-shadow: 0 1px 12px rgba(0,0,0,0.5); }
  .page-wrapper.template-salon_barber .section-rhythm-after-hero { padding-top: 48px; padding-bottom: 48px; }
  .page-wrapper.template-salon_barber .section-rhythm-default { padding-top: 40px; padding-bottom: 40px; }
  .page-wrapper.template-salon_barber .salon-sec-title { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--tp-text-muted); margin: 0 0 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--tp-border); }
  .page-wrapper.template-salon_barber .section-concept-lede .section-concept-prose { text-align: left; }
  .page-wrapper.template-salon_barber .section-concept-lede .section-concept-prose p { font-size: 1rem; line-height: 1.9; color: var(--tp-text); margin: 0 0 1rem; }
  .page-wrapper.template-salon_barber .salon-hours-dl { margin: 0; display: grid; gap: 0.5rem 1.5rem; }
  .page-wrapper.template-salon_barber .salon-hours-dl dt { font-weight: 600; color: var(--tp-heading); font-size: 0.9375rem; }
  .page-wrapper.template-salon_barber .salon-hours-dl dd { margin: 0; font-size: 0.9375rem; color: var(--tp-text); }
  .page-wrapper.template-salon_barber .salon-access-text { margin: 0 0 1rem; line-height: 1.8; color: var(--tp-text); white-space: pre-line; }
  .page-wrapper.template-salon_barber .salon-map-wrap { margin-top: 1rem; border-radius: 8px; overflow: hidden; border: 1px solid var(--tp-border); }
  .page-wrapper.template-salon_barber .salon-catalog-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 1rem; }
  @media (min-width: 600px) { .page-wrapper.template-salon_barber .salon-catalog-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; } }
  @media (min-width: 900px) { .page-wrapper.template-salon_barber .salon-catalog-grid { grid-template-columns: repeat(4, 1fr); } }
  .page-wrapper.template-salon_barber .salon-catalog-img { width: 100%; height: auto; aspect-ratio: 1; object-fit: cover; display: block; border-radius: 6px; }
  .page-wrapper.template-salon_barber .salon-form-field { margin-bottom: 1.25rem; }
  .page-wrapper.template-salon_barber .salon-form-label { display: block; font-size: 0.8125rem; font-weight: 600; letter-spacing: 0.05em; color: var(--tp-heading); margin-bottom: 0.4rem; }
  .page-wrapper.template-salon_barber .salon-form-control { width: 100%; box-sizing: border-box; padding: 0.75rem 1rem; font-size: 1rem; line-height: 1.5; border: 1px solid var(--tp-border); border-radius: 6px; background: #fff; color: var(--tp-heading); font-family: inherit; -webkit-appearance: none; appearance: none; }
  .page-wrapper.template-salon_barber .salon-form-control:focus { outline: none; border-color: #000; box-shadow: 0 0 0 2px rgba(0,0,0,0.1); }
  .page-wrapper.template-salon_barber .salon-form-textarea { min-height: 120px; resize: vertical; }
  .page-wrapper.template-salon_barber .salon-form-submit { margin-top: 0.5rem; min-height: 48px; padding: 0.875rem 2rem; font-size: 0.9375rem; }
  .page-wrapper.template-salon_barber .section-view-all { display: inline-block; margin-top: 1rem; padding: 10px 20px; background: #000; color: #fff; font-size: 0.75rem; letter-spacing: 0.15em; text-decoration: none; transition: background 0.25s ease; }
  .page-wrapper.template-salon_barber .section-view-all:hover { background: #333; color: #fff; }
  .page-wrapper.template-salon_barber footer { padding: 48px 0 32px; border-top: 1px solid var(--tp-border); }
  .page-wrapper.template-salon_barber .section-img-wrap { margin-bottom: 1rem; border-radius: 8px; overflow: hidden; }
  .page-wrapper.template-salon_barber .qr-block .qr-block-mobile-note { font-size: 0.875rem; color: var(--tp-text-muted); margin: 0 0 0.75rem; }
  @media (max-width: 768px) { .page-wrapper.template-salon_barber .qr-block .qr-block-img { display: none; } }
`;

/** 6. 工務店・リノベ用（SUPPOSE 参照・ビュー切り替え・写真のみ→MENUでメニュー頁・WORKS等は別頁） */
const BUILDER_CSS = `
  .page-wrapper.template-builder { --tp-bg: #fff; --tp-heading: #0a0a0a; --tp-text: #1a1a1a; --tp-border: #e5e5e5; font-family: "Hiragino Sans", "Noto Sans JP", "Helvetica Neue", sans-serif; }
  .page-wrapper.template-builder .container { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
  @media (min-width: 1024px) { .page-wrapper.template-builder .container { padding: 0 48px; } }
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
  .builder-view-hero .builder-hero-copy { flex: 1; display: flex; flex-direction: column; justify-content: center; padding-left: 0; }
  .builder-view-hero .builder-hero-catchphrase { font-size: 0.875rem; letter-spacing: 0.06em; margin: 0 0 0.25rem; opacity: 0.95; }
  .builder-view-hero .builder-hero-title { font-size: clamp(1.35rem, 4vw, 2rem); font-weight: 600; letter-spacing: 0.08em; margin: 0; text-shadow: 0 2px 20px rgba(0,0,0,0.4); }
  .builder-view-hero .builder-hero-menu-btn { position: absolute; bottom: 24px; right: 24px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #fff; text-decoration: none; }
  .builder-view-hero .builder-hero-menu-btn:hover { opacity: 0.9; }
  .builder-view-hero .builder-hero-dots { position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px; }
  .builder-view-hero .builder-hero-dots span { width: 6px; height: 6px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.8); background: transparent; }
  .builder-view-menu { background: #0a0a0a; color: #fff; padding: 32px 24px 48px; }
  .builder-view-menu .builder-menu-inner { max-width: 320px; }
  .builder-view-menu .builder-nav-close { display: inline-block; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #fff; text-decoration: none; margin-bottom: 2rem; }
  .builder-view-menu .builder-nav-close:hover { opacity: 0.9; }
  .builder-view-menu .builder-menu-search { font-size: 0.75rem; letter-spacing: 0.1em; margin-bottom: 0.5rem; opacity: 0.8; }
  .builder-view-menu .builder-nav-primary { display: flex; flex-direction: column; gap: 1.25rem; margin-top: 2rem; }
  .builder-view-menu .builder-nav-primary a { font-size: 1.5rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #fff; text-decoration: none; }
  .builder-view-menu .builder-nav-primary a:hover { opacity: 0.85; }
  .builder-view-menu .builder-nav-secondary { margin-top: 2.5rem; display: flex; flex-direction: column; gap: 0.6rem; }
  .builder-view-menu .builder-nav-secondary a { font-size: 0.8125rem; color: rgba(255,255,255,0.8); text-decoration: none; text-transform: lowercase; }
  .builder-view-menu .builder-nav-secondary a:hover { color: #fff; }
  .builder-view-menu .builder-menu-ja-en { font-size: 0.8125rem; color: rgba(255,255,255,0.6); }
  .builder-content-bar { padding: 20px 24px; border-bottom: 1px solid var(--tp-border); background: #fff; }
  .builder-content-bar a { font-size: 0.8125rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--tp-heading); text-decoration: none; }
  .builder-content-bar a:hover { opacity: 0.8; }
  .builder-content-inner { padding: 48px 0 80px; }
  .page-wrapper.template-builder .section h2 { font-size: 0.8125rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #888; margin-bottom: 1rem; }
  .page-wrapper.template-builder .section p { font-size: 0.9375rem; line-height: 1.85; letter-spacing: 0.02em; color: var(--tp-text); }
  .page-wrapper.template-builder .section-img-wrap { margin-bottom: 1.25rem; overflow: hidden; }
  .page-wrapper.template-builder .section-img { width: 100%; height: auto; max-height: 420px; object-fit: cover; display: block; }
`;

/** 4. 整骨院・整体・鍼灸用（悩み→選ばれる理由→実績→図解→プログラム・院内・アクセス） */
const CLINIC_CHIROPRACTIC_CSS = `
  .page-wrapper.template-clinic_chiropractic {
    --tp-bg: #F8FAFB; --tp-heading: #1a2b34; --tp-text: #333; --tp-accent: #5eb5c0; --tp-border: #e2e8ec;
    --tp-bg-footer: #eef2f4; --hero-min-h: 58vh; font-family: "Hiragino Sans", "Noto Sans JP", sans-serif;
    background: var(--tp-bg); color: var(--tp-heading); font-weight: 500;
  }
  .page-wrapper.template-clinic_chiropractic .container { max-width: 960px; margin: 0 auto; padding: 0 24px; }
  .page-wrapper.template-clinic_chiropractic header { position: sticky; top: 0; z-index: 100; padding: 14px 0; border-bottom: 1px solid var(--tp-border); background: #fff; }
  .page-wrapper.template-clinic_chiropractic .logo { font-size: 1.125rem; font-weight: 700; color: var(--tp-heading); text-decoration: none; }
  .page-wrapper.template-clinic_chiropractic .cta-btn { background: var(--tp-accent); color: #fff; border: none; padding: 14px 28px; min-height: 48px; font-weight: 600; border-radius: 999px; }
  .page-wrapper.template-clinic_chiropractic .cta-btn:hover { background: #4a9fa8; color: #fff; }
  .page-wrapper.template-clinic_chiropractic .hero-full-img { min-height: var(--hero-min-h); }
  .page-wrapper.template-clinic_chiropractic .hero-bg-overlay { background: rgba(0,0,0,0.35); }
  .page-wrapper.template-clinic_chiropractic .hero-inner h1 { font-size: clamp(1.5rem, 4.5vw, 2.25rem); font-weight: 700; color: #fff; text-shadow: 0 2px 16px rgba(0,0,0,0.5); }
  .page-wrapper.template-clinic_chiropractic .hero-inner .subheadline { color: rgba(255,255,255,0.95); font-weight: 500; text-shadow: 0 1px 8px rgba(0,0,0,0.4); }
  .clinic-symptoms { padding: var(--space-2xl) var(--space-lg); background: var(--tp-bg); }
  .clinic-symptoms h2 { font-size: 1.125rem; font-weight: 700; color: var(--tp-heading); margin: 0 0 1.25rem; text-align: center; }
  .clinic-symptoms-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.75rem; max-width: 28rem; margin-left: auto; margin-right: auto; }
  .clinic-symptoms-list li { font-size: 1rem; font-weight: 500; color: var(--tp-text); padding: 0.6rem 1rem; background: #fff; border-radius: 8px; border: 1px solid var(--tp-border); box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
  .clinic-symptoms-list li::before { content: ''; display: inline-block; width: 6px; height: 6px; background: var(--tp-accent); border-radius: 50%; margin-right: 0.6rem; vertical-align: 0.2em; }
  .clinic-cta-banner { display: block; text-align: center; padding: 1rem 1.5rem; margin-top: 1.5rem; background: var(--tp-accent); color: #fff; font-weight: 700; font-size: 1rem; text-decoration: none; border-radius: 8px; }
  .clinic-cta-banner:hover { background: #4a9fa8; color: #fff; }
  .clinic-reasons { padding: var(--space-2xl) var(--space-lg); background: #fff; border-top: 1px solid var(--tp-border); }
  .clinic-reasons h2 { font-size: 1rem; font-weight: 700; letter-spacing: 0.08em; color: var(--tp-heading); margin: 0 0 1.5rem; text-align: center; }
  .clinic-reason-list { display: flex; flex-direction: column; gap: 1.5rem; max-width: 32rem; margin: 0 auto; }
  .clinic-reason-item { display: flex; gap: 1rem; align-items: flex-start; text-align: left; }
  .clinic-reason-num { flex-shrink: 0; width: 2.5rem; height: 2.5rem; display: flex; align-items: center; justify-content: center; background: var(--tp-accent); color: #fff; font-size: 0.8125rem; font-weight: 700; border-radius: 50%; }
  .clinic-reason-body h3 { font-size: 1.0625rem; font-weight: 700; color: var(--tp-heading); margin: 0 0 0.35rem; }
  .clinic-reason-body p { font-size: 0.9375rem; line-height: 1.8; color: var(--tp-text); margin: 0; }
  .clinic-stats-wrap { padding: var(--space-xl) var(--space-lg); background: linear-gradient(180deg, rgba(94,181,192,0.12) 0%, transparent 100%); }
  .clinic-stats-wrap .stats-block { display: flex; flex-wrap: wrap; justify-content: center; gap: 2rem; margin: 0; }
  .clinic-stats-wrap .stat-item { text-align: center; }
  .clinic-stats-wrap .stat-value { font-size: 2rem; font-weight: 800; color: var(--tp-accent); display: block; }
  .clinic-stats-wrap .stat-label { font-size: 0.875rem; font-weight: 500; color: var(--tp-text); margin-top: 0.25rem; }
  .clinic-diagram { padding: var(--space-2xl) var(--space-lg); background: var(--tp-bg); }
  .clinic-diagram h2 { font-size: 0.9375rem; font-weight: 700; letter-spacing: 0.06em; color: var(--tp-heading); margin: 0 0 1.25rem; text-align: center; }
  .clinic-diagram-circles { display: flex; align-items: center; justify-content: center; gap: 0.5rem; flex-wrap: wrap; margin: 0 auto; max-width: 20rem; }
  .clinic-diagram-circles span { width: 4.5rem; height: 4.5rem; display: flex; align-items: center; justify-content: center; background: rgba(94,181,192,0.2); color: var(--tp-heading); font-size: 0.75rem; font-weight: 700; border: 2px solid var(--tp-accent); border-radius: 50%; }
  .clinic-diagram-circles span:nth-child(1) { transform: translate(0.6rem, 0); }
  .clinic-diagram-circles span:nth-child(2) { transform: translate(-0.3rem, 0); z-index: 1; }
  .clinic-diagram-circles span:nth-child(3) { transform: translate(-0.6rem, 0); }
  .page-wrapper.template-clinic_chiropractic .section h2 { font-size: 1rem; font-weight: 700; letter-spacing: 0.05em; color: var(--tp-heading); margin: 0 0 0.75rem; }
  .page-wrapper.template-clinic_chiropractic .section p { font-size: 1rem; line-height: 1.85; color: var(--tp-text); font-weight: 500; margin: 0 0 0.5rem; }
  .page-wrapper.template-clinic_chiropractic .section-rhythm-after-hero { padding-top: var(--space-2xl); padding-bottom: var(--space-2xl); }
  .page-wrapper.template-clinic_chiropractic .section-rhythm-default { padding-top: var(--space-xl); padding-bottom: var(--space-xl); }
  .page-wrapper.template-clinic_chiropractic .section-img-wrap { border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
  .page-wrapper.template-clinic_chiropractic footer { padding: var(--space-2xl) 0; border-top: 1px solid var(--tp-border); background: var(--tp-bg-footer); }
  .page-wrapper.template-clinic_chiropractic .clinic-map-wrap { margin-top: 1rem; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
  .page-wrapper.template-clinic_chiropractic .clinic-map-wrap iframe { display: block; }
  .page-wrapper.template-clinic_chiropractic .qr-block .qr-block-mobile-note { font-size: 0.875rem; margin-bottom: 0.75rem; }
  @media (max-width: 768px) { .page-wrapper.template-clinic_chiropractic .qr-block .qr-block-img { display: none; } }
`;

/** 5. パーソナルジム・ヨガ用（黒×ゴールド・結果の可視化・固定CTA・シャープ） */
const GYM_YOGA_CSS = `
  .page-wrapper.template-gym_yoga {
    --tp-bg: #fff; --tp-heading: #0a0a0a; --tp-text: #1a1a1a; --tp-accent: #c9a227; --tp-gold: #c9a227; --tp-border: #e5e5e5;
    --tp-bg-footer: #0a0a0a; --hero-min-h: 70vh; font-family: "Hiragino Sans", "Noto Sans JP", sans-serif; font-weight: 600; background: var(--tp-bg);
  }
  .page-wrapper.template-gym_yoga .container { max-width: 960px; margin: 0 auto; padding: 0 24px; }
  .page-wrapper.template-gym_yoga header { position: sticky; top: 0; z-index: 100; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.15); background: #0a0a0a; }
  .page-wrapper.template-gym_yoga .logo { font-size: 1.125rem; font-weight: 800; color: #fff; text-decoration: none; letter-spacing: 0.08em; }
  .page-wrapper.template-gym_yoga .nav-link { color: rgba(255,255,255,0.9); }
  .page-wrapper.template-gym_yoga .cta-btn { background: var(--tp-accent); color: #0a0a0a; border: none; padding: 12px 24px; min-height: 44px; font-weight: 700; letter-spacing: 0.08em; border-radius: 0; }
  .page-wrapper.template-gym_yoga .cta-btn:hover { background: #d4af37; color: #0a0a0a; }
  .page-wrapper.template-gym_yoga .hero-full-img { min-height: var(--hero-min-h); }
  .page-wrapper.template-gym_yoga .hero-bg-overlay { background: rgba(0,0,0,0.55); }
  .page-wrapper.template-gym_yoga .hero-inner h1 { font-size: clamp(1.5rem, 4.5vw, 2.5rem); font-weight: 800; color: #fff; letter-spacing: 0.04em; text-shadow: 0 2px 20px rgba(0,0,0,0.5); }
  .page-wrapper.template-gym_yoga .hero-inner .subheadline { color: rgba(255,255,255,0.95); font-weight: 600; text-shadow: 0 1px 12px rgba(0,0,0,0.4); }
  .gym-results-block { padding: var(--space-2xl) var(--space-lg); background: #0a0a0a; color: #fff; }
  .gym-results-block h2 { font-size: 0.875rem; font-weight: 700; letter-spacing: 0.15em; color: var(--tp-accent); margin: 0 0 1.5rem; text-align: center; }
  .gym-results-stats { display: flex; flex-wrap: wrap; justify-content: center; gap: 2rem 3rem; margin: 0; }
  .gym-results-stats .gym-stat-item { text-align: center; }
  .gym-results-stats .gym-stat-value { font-size: clamp(2rem, 6vw, 3.5rem); font-weight: 800; color: var(--tp-accent); display: block; letter-spacing: 0.02em; line-height: 1.1; }
  .gym-results-stats .gym-stat-label { font-size: 0.875rem; font-weight: 600; color: rgba(255,255,255,0.85); margin-top: 0.35rem; letter-spacing: 0.06em; }
  .gym-reasons-block { padding: var(--space-2xl) var(--space-lg); background: #fff; border-top: 3px solid var(--tp-accent); }
  .gym-reasons-block h2 { font-size: 0.9375rem; font-weight: 800; letter-spacing: 0.1em; color: var(--tp-heading); margin: 0 0 1.5rem; text-align: center; }
  .gym-reason-list { display: flex; flex-direction: column; gap: 1.5rem; max-width: 36rem; margin: 0 auto; }
  .gym-reason-item { display: flex; gap: 1rem; align-items: flex-start; text-align: left; padding: 1rem 0; border-bottom: 1px solid var(--tp-border); border-radius: 0; }
  .gym-reason-item:last-child { border-bottom: none; }
  .gym-reason-num { flex-shrink: 0; width: 2.75rem; height: 2.75rem; display: flex; align-items: center; justify-content: center; background: #0a0a0a; color: var(--tp-accent); font-size: 0.8125rem; font-weight: 800; border-radius: 0; }
  .gym-reason-body h3 { font-size: 1.0625rem; font-weight: 800; color: var(--tp-heading); margin: 0 0 0.35rem; }
  .gym-reason-body p { font-size: 0.9375rem; line-height: 1.8; color: var(--tp-text); margin: 0; font-weight: 500; }
  .page-wrapper.template-gym_yoga .section h2 { font-size: 1rem; font-weight: 800; letter-spacing: 0.05em; color: var(--tp-heading); margin: 0 0 0.75rem; }
  .page-wrapper.template-gym_yoga .section p { font-size: 1rem; line-height: 1.85; color: var(--tp-text); font-weight: 500; }
  .page-wrapper.template-gym_yoga .section-rhythm-after-hero { padding-top: var(--space-2xl); padding-bottom: var(--space-2xl); }
  .page-wrapper.template-gym_yoga .section-rhythm-default { padding-top: var(--space-xl); padding-bottom: var(--space-xl); }
  .page-wrapper.template-gym_yoga .section-img-wrap { border-radius: 0; overflow: hidden; border: 1px solid var(--tp-border); }
  .page-wrapper.template-gym_yoga footer { padding: var(--space-2xl) 0; border-top: 3px solid var(--tp-accent); background: var(--tp-bg-footer); color: #fff; }
  .page-wrapper.template-gym_yoga footer .footer-brand { color: var(--tp-accent); }
  .page-wrapper.template-gym_yoga footer p, .page-wrapper.template-gym_yoga footer a { color: rgba(255,255,255,0.85); }
  .gym-sticky-cta { position: fixed; bottom: 0; left: 0; right: 0; z-index: 90; display: flex; align-items: center; justify-content: center; gap: 1rem; padding: 12px 16px; background: #0a0a0a; border-top: 2px solid var(--tp-accent); }
  .gym-sticky-cta .cta-btn { flex: 1; max-width: 320px; }
  .page-wrapper.template-gym_yoga main { padding-bottom: 80px; }
  .page-wrapper.template-gym_yoga .gym-map-wrap { margin-top: 1rem; border-radius: 0; overflow: hidden; border: 1px solid var(--tp-border); }
  @media (max-width: 768px) { .page-wrapper.template-gym_yoga .qr-block .qr-block-img { display: none; } }
`;

/** 2. カフェ・喫茶用（旧 warm_organic と同一） */
const CAFE_TEA_CSS = TEMPLATE_CSS_RAW.warm_organic.replace(/template-warm_organic/g, 'template-cafe_tea');

/** 7. 塾・習い事教室用（信頼ブロック直下・曲線区切り・円形バッジ・固定フッター2CTA・親しみやすさ） */
const CRAM_SCHOOL_CSS = `
  .page-wrapper.template-cram_school {
    --cram-bg: #FDFBF7; --cram-heading: #2c2418; --cram-text: #4a4238; --cram-accent: #c73e3a; --cram-accent-soft: #e8a5a2;
    --tp-bg: var(--cram-bg); --tp-heading: var(--cram-heading); --tp-text: var(--cram-text); --tp-accent: var(--cram-accent);
    --tp-border: rgba(44,36,24,0.1); --tp-bg-footer: #f5f2ed; --hero-min-h: 58vh;
    font-family: "Hiragino Sans", "Noto Sans JP", sans-serif; background: var(--tp-bg); color: var(--tp-heading); font-weight: 500;
  }
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
  .cram-sticky-cta .cta-btn-secondary:hover { background: rgba(199,62,58,0.06); }
  .page-wrapper.template-cram_school main { padding-bottom: 88px; }
  .page-wrapper.template-cram_school .cram-map-wrap { margin-top: 1rem; border-radius: 16px; overflow: hidden; border: 1px solid var(--tp-border); }
  @media (max-width: 768px) { .page-wrapper.template-cram_school .qr-block .qr-block-img { display: none; } }
`;

export function getTemplateFullCss(templateId) {
  const key = TEMPLATE_IDS.includes(templateId) ? templateId : TEMPLATE_IDS[0];
  const css = key === 'salon_barber' ? SALON_BARBER_CSS
    : key === 'cafe_tea' ? CAFE_TEA_CSS
    : key === 'builder' ? BUILDER_CSS
    : key === 'clinic_chiropractic' ? CLINIC_CHIROPRACTIC_CSS
    : key === 'gym_yoga' ? GYM_YOGA_CSS
    : key === 'cram_school' ? CRAM_SCHOOL_CSS
    : key === 'pet_salon' ? PET_SALON_CSS
    : GENERIC_CSS;
  return COMMON_BASE + css;
}
