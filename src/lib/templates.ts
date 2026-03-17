import type { TemplateOption } from '../types';

const EASE_PRO = 'cubic-bezier(0.16, 1, 0.3, 1)';
const TRANSITION_PRO = `0.8s ${EASE_PRO}`;

/** 共通: スキップリンク・見出し字間・本文行間・余白4,8,16,32,64 */
const commonBase = `
  .page-wrapper { box-sizing: border-box; margin: 0; padding: 0; }
  .page-wrapper * { box-sizing: border-box; }
  .skip-link { position: absolute; top: -4rem; left: 1rem; z-index: 100; padding: 0.5rem 1rem; background: #1a1a1a; color: #fff; text-decoration: none; border-radius: 0.25rem; font-size: 0.875rem; transition: top 0.2s; }
  .skip-link:focus { top: 1rem; outline: 2px solid #1d4ed8; outline-offset: 2px; }
  .page-wrapper h1, .page-wrapper h2 { letter-spacing: -0.025em; }
  .page-wrapper p, .page-wrapper .subheadline { line-height: 1.625; }
  .page-wrapper .container { max-width: 960px; margin: 0 auto; }
  .page-wrapper header { padding: 1rem 0; border-bottom: 1px solid var(--tp-border, #e5e7eb); }
  .header-inner { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; }
  .page-wrapper .logo { font-size: 1.25rem; font-weight: 700; color: var(--tp-heading); text-decoration: none; }
  .nav { display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: center; }
  .nav-link { color: inherit; text-decoration: none; font-size: 0.9375rem; opacity: 0.9; }
  .nav-link:hover, .nav-link:focus-visible { opacity: 1; text-decoration: underline; outline: none; }
  .cta-btn { display: inline-block; padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 600; text-decoration: none; border-radius: 0.25rem; transition: opacity 0.2s, transform 0.2s; }
  .cta-block { text-align: center; padding: 2rem 0; }
  .section-img-wrap { margin-bottom: 1rem; }
  .section-img { width: 100%; height: auto; max-height: 320px; object-fit: cover; display: block; }
  .section-body { }
  .page-wrapper main { padding: 2rem 0 4rem; }
  .page-wrapper .section { margin-bottom: 2rem; }
  .page-wrapper .section h2 { font-size: 1.5rem; font-weight: 600; margin: 0 0 1rem; letter-spacing: -0.025em; }
  .page-wrapper .section p { margin: 0 0 0.5rem; line-height: 1.625; }
  .footer-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; text-align: left; }
  .footer-col p { margin: 0 0 0.5rem; font-size: 0.875rem; }
  .footer-brand { font-weight: 700; }
  .footer-link { color: inherit; }
  .page-wrapper footer { padding: 2rem 0; border-top: 1px solid var(--tp-border, #e5e7eb); text-align: center; font-size: 0.875rem; }
  .page-wrapper .sns-links a { margin-right: 0.5rem; }
  .page-wrapper .presented-by { font-size: 0.75rem; opacity: 0.7; margin-top: 0.5rem; }
  .page-wrapper .qr-block { margin-top: 1.5rem; text-align: center; }
  .page-wrapper .qr-block img { max-width: 120px; }
  .page-wrapper .qr-placeholder { font-size: 0.875rem; color: var(--tp-text, #666); margin: 0.5rem 0; }
  .quote-block { margin: 2rem 0; padding: 1.5rem; font-size: 1.125rem; font-style: italic; text-align: center; }
  .stats-block { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; text-align: center; }
  .stat-value { display: block; font-size: 2rem; font-weight: 800; }
  .stat-label { font-size: 0.875rem; opacity: 0.9; }
  .hero-with-bg, .hero-full-img { position: relative; background-size: cover; background-position: center; background-image: var(--hero-bg-img); min-height: 50vh; display: flex; align-items: center; justify-content: center; }
  .hero-bg-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); }
  .hero-with-bg .hero-inner, .hero-full-img .hero-inner { position: relative; z-index: 1; padding: 4rem 2rem; text-align: center; color: #fff; }
  .hero-with-bg .hero-inner .cta-btn, .hero-full-img .hero-inner .cta-btn { background: #fff; color: #111; }
  .hero-sample-img { width: 100%; max-height: 280px; object-fit: cover; border-radius: 0.5rem; margin-bottom: 1rem; }
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
  /* A-1: 一字一句遵守 — Skeleton */
  .page-wrapper.template-minimal_luxury { background: #F9F9F7; color: #1A1A1A; }
  .page-wrapper.template-minimal_luxury .container { max-width: 1280px; margin: 0 auto; padding: 0 2rem; }
  @media (min-width: 1024px) {
    .page-wrapper.template-minimal_luxury .container { padding: 0 6rem; }
  }
  .page-wrapper.template-minimal_luxury main .section { padding: 8rem 0; }
  .page-wrapper.template-minimal_luxury header { padding: 2rem 0; border-bottom: 1px solid rgba(26,26,26,0.08); }
  .page-wrapper.template-minimal_luxury footer { padding: 8rem 0 4rem; border-top: 1px solid rgba(26,26,26,0.08); color: #1A1A1A; }
  .page-wrapper.template-minimal_luxury .logo { color: #1A1A1A; font-family: "Playfair Display", "Yu Mincho", serif; }
  /* Typography */
  .page-wrapper.template-minimal_luxury .hero h1 { font-family: "Playfair Display", "Yu Mincho", serif; font-size: 3.75rem; font-weight: 400; letter-spacing: 0.15em; color: #1A1A1A; margin: 0 0 1rem; line-height: 1.15; }
  .page-wrapper.template-minimal_luxury .hero .subheadline { font-family: system-ui, -apple-system, sans-serif; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.3em; color: #1A1A1A; opacity: 0.85; }
  .page-wrapper.template-minimal_luxury .section h2 { font-family: "Playfair Display", serif; color: #1A1A1A; font-size: 1.5rem; letter-spacing: 0.08em; }
  .page-wrapper.template-minimal_luxury .section p { color: #1A1A1A; line-height: 1.75; }
  /* Hero: 画像は右に w-2/3、タイトルを半分被せる z-10、角丸禁止 */
  .page-wrapper.template-minimal_luxury .hero { display: grid; grid-template-columns: 1fr 2fr; gap: 0; min-height: 70vh; align-items: center; padding: 0; }
  .page-wrapper.template-minimal_luxury .hero .hero-a1-text { position: relative; z-index: 10; padding: 2rem 2rem 2rem 0; }
  @media (min-width: 1024px) { .page-wrapper.template-minimal_luxury .hero .hero-a1-text { padding: 2rem 6rem 2rem 0; } }
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
    .page-wrapper.template-minimal_luxury .hero .hero-a1-text { order: 1; padding: 2rem 0; }
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
  .page-wrapper.template-minimal_luxury .cta-block { padding: 4rem 0; }
  .page-wrapper.template-minimal_luxury .quote-block { font-family: "Playfair Display", serif; letter-spacing: 0.05em; color: #1A1A1A; }
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
  .page-wrapper.template-dark_edge .hero h1 { font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; margin: 0 0 1rem; mix-blend-mode: difference; color: #fff; }
  .page-wrapper.template-dark_edge .hero .subheadline { text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.9; }
  .page-wrapper.template-dark_edge .container { padding: 0 2rem; }
  .page-wrapper.template-dark_edge .section h2 { color: #fff; text-transform: uppercase; letter-spacing: 0.05em; }
  .page-wrapper.template-dark_edge .section p { color: #e5e5e5; }
  .page-wrapper.template-dark_edge header { border-color: #222; }
  .page-wrapper.template-dark_edge footer { border-color: #222; color: #999; }
  .page-wrapper.template-dark_edge .nav-toggle { display: none; }
  .page-wrapper.template-dark_edge .nav-toggle-label { display: flex; flex-direction: column; gap: 6px; cursor: pointer; }
  .page-wrapper.template-dark_edge .nav-toggle-label span { display: block; width: 24px; height: 2px; background: #fff; }
  .page-wrapper.template-dark_edge .nav-overlay { position: fixed; inset: 0; z-index: 50; background: #080808; display: flex; align-items: center; justify-content: center; opacity: 0; visibility: hidden; transition: opacity 0.3s, visibility 0.3s; }
  .page-wrapper.template-dark_edge .nav-toggle:checked ~ .nav-overlay { opacity: 1; visibility: visible; }
  .page-wrapper.template-dark_edge .nav-overlay-inner { display: flex; flex-direction: column; gap: 2rem; text-align: center; }
  .page-wrapper.template-dark_edge .nav-overlay-link { color: #fff; font-size: 1.5rem; text-transform: uppercase; letter-spacing: 0.2em; text-decoration: none; }
  .page-wrapper.template-dark_edge .nav-overlay-link:hover { color: #c9a227; }
  .page-wrapper.template-dark_edge .cta-btn-hero { border: 2px solid #fff; color: #fff; background: transparent; margin: 0 0.5rem; }
  .page-wrapper.template-dark_edge .cta-btn-hero:hover { background: #fff; color: #080808; }
  .page-wrapper.template-dark_edge .cta-btn-hero-outline { border: 2px solid #c9a227; color: #c9a227; background: transparent; }
  .page-wrapper.template-dark_edge .cta-btn-hero-outline:hover { background: #c9a227; color: #080808; }
  .page-wrapper.template-dark_edge .hero-cta-wrap { margin-top: 2rem; display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; }
  .page-wrapper.template-dark_edge .section-img-wrap { margin: 0 -2rem 1rem; }
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
  .page-wrapper.template-corporate_trust .cta-btn { background: #1e3a8a; color: #fff; border: none; }
  .page-wrapper.template-corporate_trust .cta-btn:hover { background: #1e40af; }
  .page-wrapper.template-corporate_trust .nav-link { color: #1e293b; }
  .page-wrapper.template-corporate_trust .stats-block { padding: 2rem 0; }
  .page-wrapper.template-corporate_trust .stat-value { color: #1e3a8a; }
  .page-wrapper.template-corporate_trust .section-card { transition: box-shadow 0.2s, border-color 0.2s; }
  .page-wrapper.template-corporate_trust .section-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-left-color: #2563eb; }
  .page-wrapper.template-corporate_trust .section-card-img { aspect-ratio: 16/10; overflow: hidden; margin: -1rem -1rem 1rem -1rem; border-radius: 0.5rem 0.5rem 0 0; }
  .page-wrapper.template-corporate_trust .section-card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
  .page-wrapper.template-corporate_trust .footer-cols { border-top: 1px solid #e2e8f0; padding-top: 2rem; }
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
  .page-wrapper.template-warm_organic .container { padding: 0 2rem; }
  .page-wrapper.template-warm_organic .hero { padding: 4rem 2rem; text-align: center; }
  .page-wrapper.template-warm_organic .hero h1 { font-size: 2rem; font-weight: 600; color: #3d2914; margin: 0 0 1rem; }
  .page-wrapper.template-warm_organic .section { border: 2px dashed #c4a77d; border-radius: 40px; padding: 2rem; margin-bottom: 2rem; transition: transform ${TRANSITION_PRO}; }
  .page-wrapper.template-warm_organic .section:hover { transform: scale(1.01); }
  .page-wrapper.template-warm_organic .section h2 { color: #3d2914; }
  .page-wrapper.template-warm_organic .img-wrap-rotate { transform: rotate(3deg); display: inline-block; }
  .page-wrapper.template-warm_organic .img-wrap-rotate:nth-child(even) { transform: rotate(-2deg); }
  .page-wrapper.template-warm_organic footer { color: #5c4033; }
  .page-wrapper.template-warm_organic .cta-btn { background: #b45309; color: #fff; border: none; border-radius: 2rem; padding: 0.75rem 1.5rem; }
  .page-wrapper.template-warm_organic .cta-btn:hover { transform: scale(1.02); }
  .page-wrapper.template-warm_organic .nav-link { color: #5c4033; }
  .page-wrapper.template-warm_organic .section-img-wrap { border-radius: 40px; overflow: hidden; border: 2px dashed #c4a77d; padding: 4px; }
  .page-wrapper.template-warm_organic .quote-block { color: #3d2914; border-left: 4px solid #c4a77d; text-align: left; padding-left: 1rem; margin-left: 0; }
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
  .page-wrapper.template-pop_friendly .container { padding: 0 2rem; }
  .page-wrapper.template-pop_friendly .hero { padding: 4rem 2rem; text-align: center; background: #fef08a; border: 4px solid #000; border-radius: 0; box-shadow: 8px 8px 0 0 #000; margin: 0 2rem; }
  .page-wrapper.template-pop_friendly .hero h1 { font-size: 2rem; font-weight: 800; color: #1a1a1a; margin: 0 0 1rem; }
  .page-wrapper.template-pop_friendly .section { background: #fff; border: 4px solid #000; box-shadow: 8px 8px 0 0 #000; padding: 1.5rem; margin-bottom: 2rem; }
  .page-wrapper.template-pop_friendly .hero h1, .page-wrapper.template-pop_friendly .section h2 { font-family: "M PLUS Rounded 1c", "Hiragino Sans", sans-serif; color: #1a1a1a; }
  .page-wrapper.template-pop_friendly button, .page-wrapper.template-pop_friendly .btn { border: 4px solid #000; background: #f472b6; font-weight: 700; padding: 0.5rem 1rem; cursor: pointer; transition: transform 0.1s; }
  .page-wrapper.template-pop_friendly button:active, .page-wrapper.template-pop_friendly .btn:active { transform: scale(0.95); }
  .page-wrapper.template-pop_friendly header { border: 4px solid #000; }
  .page-wrapper.template-pop_friendly footer { border-top: 4px solid #000; color: #1a1a1a; }
  .page-wrapper.template-pop_friendly .cta-btn { background: #f472b6; color: #1a1a1a; border: 4px solid #000; box-shadow: 8px 8px 0 0 #000; }
  .page-wrapper.template-pop_friendly .cta-btn:hover { transform: translateY(-2px); box-shadow: 12px 12px 0 0 #000; }
  .page-wrapper.template-pop_friendly .cta-btn.cta-btn-secondary { background: #fef08a; }
  .page-wrapper.template-pop_friendly .nav-link { color: #1a1a1a; font-weight: 600; }
  .page-wrapper.template-pop_friendly .footer-cols { border: 4px solid #000; box-shadow: 8px 8px 0 0 #000; padding: 2rem; margin: 0 2rem; background: #fff; }
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
  .page-wrapper.template-high_energy .marquee-bar { position: fixed; top: 0; left: 0; right: 0; z-index: 50; background: #0f0f0f; color: #fff; padding: 0.5rem 0; overflow: hidden; white-space: nowrap; font-size: 1rem; letter-spacing: 0.1em; }
  .page-wrapper.template-high_energy .marquee-inner { display: inline-block; animation: marquee 25s linear infinite; padding-right: 2em; }
  .page-wrapper.template-high_energy .container { padding: 0 2rem; }
  .page-wrapper.template-high_energy .hero { padding: 4rem 2rem 2rem; text-align: center; }
  .page-wrapper.template-high_energy .hero h1 { font-size: 2.5rem; font-weight: 900; color: #0f0f0f; margin: 0 0 1rem; }
  .page-wrapper.template-high_energy .section { transform: skewY(-3deg); padding: 2rem; margin-bottom: 2rem; background: #f1f5f9; }
  .page-wrapper.template-high_energy .section-inner { transform: skewY(3deg); }
  .page-wrapper.template-high_energy .section h2 { font-weight: 900; color: #0f0f0f; }
  .page-wrapper.template-high_energy footer { font-weight: 700; color: #334155; }
  .page-wrapper.template-high_energy .cta-btn { background: #eab308; color: #0f0f0f; border: none; font-weight: 900; padding: 0.75rem 1.5rem; }
  .page-wrapper.template-high_energy .cta-btn:hover { background: #ca8a04; transform: scale(1.02); }
  .page-wrapper.template-high_energy .marquee-bar + header { position: sticky; top: 0; z-index: 40; background: #0f0f0f; }
  .page-wrapper.template-high_energy .nav-link { color: #fff; font-weight: 700; }
  .page-wrapper.template-high_energy .stats-block { background: #0f0f0f; color: #fff; padding: 2rem; margin: 0 -2rem 2rem; }
  .page-wrapper.template-high_energy .stat-value { color: #eab308; }
  .page-wrapper.template-high_energy .section-img-wrap { margin-bottom: 1rem; overflow: hidden; }
  .page-wrapper.template-high_energy .section-img { transition: transform 0.4s ease; }
  .page-wrapper.template-high_energy .section-img-wrap:hover .section-img { transform: scale(1.03); }
  .page-wrapper.template-high_energy .footer-cols { background: #f1f5f9; padding: 2rem; margin: 0 -2rem; }
  `
  ),
];
