/**
 * 6パターンテンプレート（絶対ルール準拠）
 * A-1 Minimal Luxury, A-2 Dark Edge, A-3 Corporate Trust
 * B-1 Warm Organic, B-2 Pop & Friendly, B-3 High Energy
 */
const EASE_PRO = 'cubic-bezier(0.16, 1, 0.3, 1)';
const TRANSITION_PRO = `0.8s ${EASE_PRO}`;

const SPACE = { xs: '8px', sm: '16px', md: '24px', lg: '32px', xl: '48px', '2xl': '64px', '3xl': '96px', '4xl': '128px', '5xl': '160px' };
const EASE = { outExpo: 'cubic-bezier(0.16, 1, 0.3, 1)', inOutSmooth: 'cubic-bezier(0.65, 0, 0.35, 1)' };

const COMMON_BASE = `
  .page-wrapper {
    box-sizing: border-box; margin: 0; padding: 0;
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
  .page-wrapper .container { max-width: 960px; margin: 0 auto; }
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
  .page-wrapper.template-minimal_luxury .logo-a1 { font-family: "Playfair Display", "Yu Mincho", Georgia, serif; font-size: 3.75rem; font-weight: 400; letter-spacing: 0.3em; text-transform: uppercase; color: #1A1A1A; }
  .page-wrapper.template-minimal_luxury .nav-a1 { display: flex; flex-wrap: wrap; justify-content: center; gap: 32px; }
  .page-wrapper.template-minimal_luxury .nav-a1 .nav-link { font-size: 10px; letter-spacing: 0.2em; opacity: 1; transition: opacity 0.3s ${A1_EASE}; }
  .page-wrapper.template-minimal_luxury .nav-a1 .nav-link::after { display: none; }
  .page-wrapper.template-minimal_luxury .nav-a1 .nav-link:hover { opacity: 0.5; }
  .page-wrapper.template-minimal_luxury .hero h1 { font-family: "Playfair Display", "Yu Mincho", serif; font-size: 3.75rem; font-weight: 400; letter-spacing: 0.15em; color: #1A1A1A; margin: 0 0 16px; line-height: 1.15; }
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
    .page-wrapper.template-minimal_luxury .hero h1 { font-size: 2.25rem; letter-spacing: 0.1em; }
  }
  .page-wrapper.template-minimal_luxury * { border-radius: 0; }
  .page-wrapper.template-minimal_luxury [data-a1-animate] { opacity: 0; transform: translateY(40px); transition: opacity 1.2s ${A1_EASE}, transform 1.2s ${A1_EASE}; }
  .page-wrapper.template-minimal_luxury [data-a1-animate].a1-visible { opacity: 1; transform: translateY(0); }
  .page-wrapper.template-minimal_luxury .cta-btn, .page-wrapper.template-minimal_luxury .cta-btn-a1, .page-wrapper.template-minimal_luxury .cta-btn-primary { border: 1px solid #1A1A1A; color: #1A1A1A; background: transparent; padding: 16px 48px; border-radius: 0; }
  .page-wrapper.template-minimal_luxury .cta-btn:hover, .page-wrapper.template-minimal_luxury .cta-btn-a1:hover, .page-wrapper.template-minimal_luxury .cta-btn-primary:hover { background: transparent; opacity: 0.7; }
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
  .page-wrapper.template-warm_organic { --tp-bg: #FDFBF7; --tp-heading: #3d2914; --tp-text: #5c4033; --tp-accent: #b45309; --tp-border: #c4a77d; --tp-bg-footer: #FAF7F2; --hero-min-h: 60vh; font-family: "Hiragino Sans", "Noto Sans JP", sans-serif; color: #5c4033; background: var(--tp-bg); }
  .page-wrapper.template-warm_organic header { background: transparent; }
  .page-wrapper.template-warm_organic header.scrolled { background: rgba(253,251,247,0.96); backdrop-filter: saturate(180%) blur(8px); }
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
  `,
};

export const TEMPLATE_IDS = [
  'minimal_luxury',
  'dark_edge',
  'corporate_trust',
  'warm_organic',
  'pop_friendly',
  'high_energy',
];

/** 業種は廃止し、全員が同じ6テンプレートを使用 */
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

export function getTemplateFullCss(templateId) {
  const css = TEMPLATE_CSS_RAW[templateId] || TEMPLATE_CSS_RAW.minimal_luxury;
  return COMMON_BASE + css;
}
