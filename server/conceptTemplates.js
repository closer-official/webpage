/**
 * 6パターンテンプレート（絶対ルール準拠）
 * A-1 Minimal Luxury, A-2 Dark Edge, A-3 Corporate Trust
 * B-1 Warm Organic, B-2 Pop & Friendly, B-3 High Energy
 */
const EASE_PRO = 'cubic-bezier(0.16, 1, 0.3, 1)';
const TRANSITION_PRO = `0.8s ${EASE_PRO}`;

const COMMON_BASE = `
  .page-wrapper { box-sizing: border-box; margin: 0; padding: 0; }
  .page-wrapper * { box-sizing: border-box; }
  .page-wrapper h1, .page-wrapper h2 { letter-spacing: -0.025em; }
  .page-wrapper p, .page-wrapper .subheadline { line-height: 1.625; }
  .page-wrapper .container { max-width: 960px; margin: 0 auto; }
  .page-wrapper header { padding: 1rem 0; border-bottom: 1px solid var(--tp-border, #e5e7eb); }
  .page-wrapper .logo { font-size: 1.25rem; font-weight: 700; color: var(--tp-heading); text-decoration: none; }
  .page-wrapper main { padding: 2rem 0 4rem; }
  .page-wrapper .section { margin-bottom: 2rem; }
  .page-wrapper .section h2 { font-size: 1.5rem; font-weight: 600; margin: 0 0 1rem; letter-spacing: -0.025em; }
  .page-wrapper .section p { margin: 0 0 0.5rem; line-height: 1.625; }
  .page-wrapper footer { padding: 2rem 0; border-top: 1px solid var(--tp-border, #e5e7eb); text-align: center; font-size: 0.875rem; }
  .page-wrapper .sns-links a { margin-right: 0.5rem; }
  .page-wrapper .presented-by { font-size: 0.75rem; opacity: 0.7; margin-top: 0.5rem; }
  .page-wrapper .qr-block { margin-top: 1.5rem; text-align: center; }
  .page-wrapper .qr-block img { max-width: 120px; }
`;

const A1_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const TEMPLATE_CSS_RAW = {
  minimal_luxury: `
  .page-wrapper.template-minimal_luxury { background: #F9F9F7; color: #1A1A1A; }
  .page-wrapper.template-minimal_luxury .container { max-width: 1280px; margin: 0 auto; padding: 0 2rem; }
  @media (min-width: 1024px) {
    .page-wrapper.template-minimal_luxury .container { padding: 0 6rem; }
  }
  .page-wrapper.template-minimal_luxury main .section { padding: 8rem 0; }
  .page-wrapper.template-minimal_luxury header { padding: 2rem 0; border-bottom: 1px solid rgba(26,26,26,0.08); }
  .page-wrapper.template-minimal_luxury footer { padding: 8rem 0 4rem; border-top: 1px solid rgba(26,26,26,0.08); color: #1A1A1A; }
  .page-wrapper.template-minimal_luxury .logo { color: #1A1A1A; font-family: "Playfair Display", "Yu Mincho", serif; }
  .page-wrapper.template-minimal_luxury .hero h1 { font-family: "Playfair Display", "Yu Mincho", serif; font-size: 3.75rem; font-weight: 400; letter-spacing: 0.15em; color: #1A1A1A; margin: 0 0 1rem; line-height: 1.15; }
  .page-wrapper.template-minimal_luxury .hero .subheadline { font-family: system-ui, -apple-system, sans-serif; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.3em; color: #1A1A1A; opacity: 0.85; }
  .page-wrapper.template-minimal_luxury .section h2 { font-family: "Playfair Display", serif; color: #1A1A1A; font-size: 1.5rem; letter-spacing: 0.08em; }
  .page-wrapper.template-minimal_luxury .section p { color: #1A1A1A; line-height: 1.75; }
  .page-wrapper.template-minimal_luxury .hero { display: grid; grid-template-columns: 1fr 2fr; gap: 0; min-height: 70vh; align-items: center; padding: 0; }
  .page-wrapper.template-minimal_luxury .hero .hero-a1-text { position: relative; z-index: 10; padding: 2rem 2rem 2rem 0; }
  @media (min-width: 1024px) { .page-wrapper.template-minimal_luxury .hero .hero-a1-text { padding: 2rem 6rem 2rem 0; } }
  .page-wrapper.template-minimal_luxury .hero .hero-a1-img { width: 100%; height: 100%; min-height: 400px; object-fit: cover; border-radius: 0; }
  @media (max-width: 768px) {
    .page-wrapper.template-minimal_luxury .hero { grid-template-columns: 1fr; grid-template-rows: auto 1fr; }
    .page-wrapper.template-minimal_luxury .hero .hero-a1-text { order: 1; padding: 2rem 0; }
    .page-wrapper.template-minimal_luxury .hero h1 { font-size: 2.25rem; letter-spacing: 0.1em; }
  }
  .page-wrapper.template-minimal_luxury * { border-radius: 0; }
  .page-wrapper.template-minimal_luxury [data-a1-animate] { opacity: 0; transform: translateY(40px); transition: opacity 1.2s ${A1_EASE}, transform 1.2s ${A1_EASE}; }
  .page-wrapper.template-minimal_luxury [data-a1-animate].a1-visible { opacity: 1; transform: translateY(0); }
  `,
  dark_edge: `
  .page-wrapper.template-dark_edge { font-family: "Helvetica Neue", Arial, sans-serif; color: #fff; background: #080808; }
  .page-wrapper.template-dark_edge .hero { min-height: 100vh; position: relative; display: flex; align-items: center; justify-content: center; }
  .page-wrapper.template-dark_edge .hero-bg { position: absolute; inset: 0; background-size: cover; background-position: center; background-attachment: fixed; z-index: 0; }
  .page-wrapper.template-dark_edge .hero-text { position: relative; z-index: 1; text-align: center; }
  .page-wrapper.template-dark_edge .hero h1 { font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; margin: 0 0 1rem; mix-blend-mode: difference; color: #fff; }
  .page-wrapper.template-dark_edge .hero .subheadline { text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.9; }
  .page-wrapper.template-dark_edge .container { padding: 0 2rem; }
  .page-wrapper.template-dark_edge .section h2 { color: #fff; text-transform: uppercase; letter-spacing: 0.05em; }
  .page-wrapper.template-dark_edge .section p { color: #e5e5e5; }
  .page-wrapper.template-dark_edge header { border-color: #222; }
  .page-wrapper.template-dark_edge footer { border-color: #222; color: #999; }
  `,
  corporate_trust: `
  @keyframes ken-burns { 0% { transform: scale(1.1); } 100% { transform: scale(1); } }
  .page-wrapper.template-corporate_trust { font-family: "Noto Sans JP", "Hiragino Kaku Gothic ProN", sans-serif; font-weight: 700; color: #1e293b; background: #f8fafc; }
  .page-wrapper.template-corporate_trust .container { padding: 0 2rem; }
  .page-wrapper.template-corporate_trust .hero { padding: 4rem 2rem; text-align: center; }
  .page-wrapper.template-corporate_trust .hero h1 { font-size: 2.25rem; font-weight: 700; color: #0f172a; margin: 0 0 1rem; }
  .page-wrapper.template-corporate_trust .section-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-top: 2rem; }
  .page-wrapper.template-corporate_trust .section-card { padding: 1rem; background: #fff; border-left: 4px solid #1e3a8a; border-radius: 0.5rem; }
  .page-wrapper.template-corporate_trust .section-card h2 { font-size: 1rem; margin: 0 0 0.5rem; }
  .page-wrapper.template-corporate_trust .section-card p { font-size: 0.875rem; font-weight: 500; margin: 0; }
  .page-wrapper.template-corporate_trust .hero-bg-img { animation: ken-burns 20s ease-out infinite alternate; }
  .page-wrapper.template-corporate_trust .section h2 { color: #0f172a; }
  .page-wrapper.template-corporate_trust footer { color: #475569; }
  `,
  warm_organic: `
  .page-wrapper.template-warm_organic { font-family: "Hiragino Sans", "Noto Sans JP", sans-serif; color: #5c4033; background: #FDFBF7; }
  .page-wrapper.template-warm_organic .container { padding: 0 2rem; }
  .page-wrapper.template-warm_organic .hero { padding: 4rem 2rem; text-align: center; }
  .page-wrapper.template-warm_organic .hero h1 { font-size: 2rem; font-weight: 600; color: #3d2914; margin: 0 0 1rem; }
  .page-wrapper.template-warm_organic .section { border: 2px dashed #c4a77d; border-radius: 40px; padding: 2rem; margin-bottom: 2rem; transition: transform ${TRANSITION_PRO}; }
  .page-wrapper.template-warm_organic .section:hover { transform: scale(1.01); }
  .page-wrapper.template-warm_organic .section h2 { color: #3d2914; }
  .page-wrapper.template-warm_organic .img-wrap-rotate { transform: rotate(3deg); display: inline-block; }
  .page-wrapper.template-warm_organic .img-wrap-rotate:nth-child(even) { transform: rotate(-2deg); }
  .page-wrapper.template-warm_organic footer { color: #5c4033; }
  `,
  pop_friendly: `
  .page-wrapper.template-pop_friendly { font-family: "Noto Sans JP", sans-serif; background: #fef08a; color: #1a1a1a; }
  .page-wrapper.template-pop_friendly .container { padding: 0 2rem; }
  .page-wrapper.template-pop_friendly .hero { padding: 4rem 2rem; text-align: center; background: #fef08a; border: 4px solid #000; border-radius: 0; box-shadow: 8px 8px 0 0 #000; margin: 0 2rem; }
  .page-wrapper.template-pop_friendly .hero h1 { font-size: 2rem; font-weight: 800; color: #1a1a1a; margin: 0 0 1rem; }
  .page-wrapper.template-pop_friendly .section { background: #fff; border: 4px solid #000; box-shadow: 8px 8px 0 0 #000; padding: 1.5rem; margin-bottom: 2rem; }
  .page-wrapper.template-pop_friendly .section h2 { color: #1a1a1a; }
  .page-wrapper.template-pop_friendly button, .page-wrapper.template-pop_friendly .btn { border: 4px solid #000; background: #f472b6; font-weight: 700; padding: 0.5rem 1rem; cursor: pointer; transition: transform 0.1s; }
  .page-wrapper.template-pop_friendly button:active, .page-wrapper.template-pop_friendly .btn:active { transform: scale(0.95); }
  .page-wrapper.template-pop_friendly header { border: 4px solid #000; }
  .page-wrapper.template-pop_friendly footer { border-top: 4px solid #000; color: #1a1a1a; }
  `,
  high_energy: `
  @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  .page-wrapper.template-high_energy { font-family: "Noto Sans JP", sans-serif; font-weight: 900; color: #0f0f0f; background: #fff; }
  .page-wrapper.template-high_energy .marquee-bar { position: fixed; top: 0; left: 0; right: 0; z-index: 50; background: #0f0f0f; color: #fff; padding: 0.5rem 0; overflow: hidden; white-space: nowrap; font-size: 1rem; letter-spacing: 0.1em; }
  .page-wrapper.template-high_energy .marquee-inner { display: inline-block; animation: marquee 25s linear infinite; padding-right: 2em; }
  .page-wrapper.template-high_energy .container { padding: 0 2rem; }
  .page-wrapper.template-high_energy .hero { padding: 4rem 2rem 2rem; text-align: center; }
  .page-wrapper.template-high_energy .hero h1 { font-size: 2.5rem; font-weight: 900; color: #0f0f0f; margin: 0 0 1rem; }
  .page-wrapper.template-high_energy .section { transform: skewY(-3deg); padding: 2rem; margin-bottom: 2rem; background: #f1f5f9; }
  .page-wrapper.template-high_energy .section-inner { transform: skewY(3deg); }
  .page-wrapper.template-high_energy .section h2 { font-weight: 900; color: #0f0f0f; }
  .page-wrapper.template-high_energy footer { font-weight: 700; color: #334155; }
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
