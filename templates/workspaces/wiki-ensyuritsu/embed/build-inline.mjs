/**
 * embed/index.html を style.css / script.js / wikipedia-article.html から生成（プレビューは body を埋め込むためインライン必須）
 * 実行: node build-inline.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const css = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8');
const js = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');
const wikiArticle = fs.readFileSync(path.join(__dirname, 'wikipedia-article.html'), 'utf8');

const MARKUP = `
<div class="pi-flow-bg" aria-hidden="true"><span id="pi-flow-text"></span></div>
<div class="pi-flow-bg pi-flow-bg--layer2" aria-hidden="true"><span id="pi-flow-text-2"></span></div>
<canvas id="pi-cursor-canvas" width="400" height="300" aria-hidden="true"></canvas>

<div id="pi-loader" role="alert" aria-live="polite" aria-busy="true">
  <div id="pi-loader__ring-wrap">
    <div id="pi-loader__glow" aria-hidden="true"></div>
    <svg id="pi-svg-ring" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="piDigitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#d8f99b;stop-opacity:1" />
          <stop offset="40%" style="stop-color:#7dd3fc;stop-opacity:1" />
          <stop offset="72%" style="stop-color:#a3e635;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f0f9ff;stop-opacity:0.95" />
        </linearGradient>
        <path id="piCirclePath" fill="none" d="M200,200 m-155,0 a155,155 0 1,1 310,0 a155,155 0 1,1 -310,0" />
      </defs>
      <text class="pi-digit-path" xml:space="preserve">
        <textPath id="pi-textpath-digits" href="#piCirclePath" startOffset="0%"></textPath>
      </text>
    </svg>
  </div>
  <p id="pi-loader__caption">LOADING · π</p>
</div>

<div id="pi-main">
  <header class="pi-header">
    <div class="pi-header__brand">
      <span class="pi-header__brand-en">ENSYRITSU</span>
      <span class="pi-header__brand-ja">円室律 · 円周率</span>
    </div>
    <nav class="pi-nav" aria-label="ページ内">
      <a href="#hero">トップ</a>
      <a href="#pi-toc-h">目次</a>
      <a href="#wiki-basic">基礎</a>
      <a href="#wiki-history">歴史</a>
      <a href="#wiki-properties">性質</a>
      <a href="#wiki-formulas">公式</a>
      <a href="#wiki-value">桁</a>
    </nav>
  </header>

  <section id="hero" class="pi-skip-target pi-hero pi-hero--cinematic" aria-labelledby="hero-title">
    <div class="pi-hero__media" aria-hidden="true">
      <video
        class="pi-hero__video"
        autoplay
        muted
        loop
        playsinline
        poster="https://images.pexels.com/photos/167684/pexels-photo-167684.jpeg?auto=compress&amp;cs=tinysrgb&amp;w=1920"
      >
        <source src="https://videos.pexels.com/video-files/3045163/3045163-hd_1920_1080_30fps.mp4" type="video/mp4" />
      </video>
      <div class="pi-hero__scrim"></div>
    </div>
    <div class="pi-hero__continuity-ring" aria-hidden="true"></div>
    <div class="pi-hero__stage">
      <h1 id="hero-title" class="pi-hero__title-sr">円周率（えんしゅうりつ）</h1>
      <div class="pi-hero__vj-wrap" aria-hidden="true">
        <p class="pi-hero__vj pi-hero__vj--1">円周率は</p>
        <p class="pi-hero__vj pi-hero__vj--2">直径に対する</p>
        <p class="pi-hero__vj pi-hero__vj--3">円周の比</p>
        <p class="pi-hero__vj pi-hero__vj--4">スケールを</p>
        <p class="pi-hero__vj pi-hero__vj--5">変えない</p>
      </div>
      <p class="pi-hero__en" lang="en">
        Pi is the ratio of a circle's circumference to its diameter — unchanged by scale.
      </p>
      <p class="pi-hero__lead">
        以下にウィキペディア日本語版「円周率」の記事本文を収録しています（サイトの枠組み・ナビは除く）。装飾・イントロはこのテンプレート側のデザインです。
      </p>
      <div class="pi-hero__meta" aria-hidden="true">
        <span>C = πd = 2πr</span>
        <span>CC BY-SA 3.0</span>
      </div>
    </div>
  </section>

${wikiArticle}

  <footer class="pi-footer" id="contact">
    <p><strong>円室律 ENSYRITSU</strong> — テンプレート・デモ（本文はウィキペディア「円周率」に基づく）</p>
    <p>図版の模式表現はデモ用です。記事本文のライセンスはページ末の帰属を参照してください。</p>
  </footer>
</div>

<div id="pi-lightbox" role="dialog" aria-modal="true" aria-hidden="true" aria-label="図の拡大表示">
  <button type="button" id="pi-lightbox__close" aria-label="閉じる">×</button>
  <div id="pi-lightbox__panel"></div>
</div>

<div hidden>
  <svg id="pi-art-store-diameter" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" aria-hidden="true">
    <circle cx="200" cy="120" r="88" fill="none" stroke="#38bdf8" stroke-width="3"/>
    <line x1="112" y1="120" x2="288" y2="120" stroke="#e8edf5" stroke-width="2"/>
    <path d="M 200 32 A 88 88 0 0 1 288 120" fill="none" stroke="#a3e635" stroke-width="3"/>
    <text x="200" y="105" text-anchor="middle" fill="#a3e635" font-size="18" font-family="Source Code Pro, monospace">C = πd</text>
  </svg>
  <svg id="pi-art-store-polygon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" aria-hidden="true">
    <circle cx="200" cy="120" r="95" fill="none" stroke="#38bdf8" stroke-opacity="0.4"/>
    <polygon points="200,30 285,70 285,170 200,210 115,170 115,70" fill="none" stroke="#a3e635" stroke-width="3" stroke-linejoin="round"/>
    <polygon points="200,45 270,78 270,162 200,195 130,162 130,78" fill="none" stroke="#38bdf8" stroke-opacity="0.6" stroke-dasharray="4 6"/>
  </svg>
  <svg id="pi-art-store-digits" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" aria-hidden="true">
    <rect x="40" y="40" width="320" height="120" fill="rgba(0,0,0,0.35)" rx="12"/>
    <g transform="translate(60,140)">
      <rect x="0" y="0" width="22" height="50" fill="#38bdf8" opacity="0.55"/><rect x="28" y="-10" width="22" height="60" fill="#a3e635" opacity="0.6"/>
      <rect x="56" y="5" width="22" height="45" fill="#38bdf8" opacity="0.45"/><rect x="84" y="-15" width="22" height="65" fill="#a3e635" opacity="0.65"/>
      <rect x="112" y="0" width="22" height="50" fill="#38bdf8" opacity="0.5"/><rect x="140" y="-8" width="22" height="58" fill="#a3e635" opacity="0.58"/>
      <rect x="168" y="8" width="22" height="42" fill="#38bdf8" opacity="0.48"/><rect x="196" y="-12" width="22" height="62" fill="#a3e635" opacity="0.62"/>
      <rect x="224" y="3" width="22" height="47" fill="#38bdf8" opacity="0.52"/><rect x="252" y="-6" width="22" height="56" fill="#a3e635" opacity="0.56"/>
    </g>
    <text x="200" y="30" text-anchor="middle" fill="#e8edf5" font-size="14">桁分布（模式図 · 拡大）</text>
  </svg>
</div>
`.trim();

const out = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>円周率 π — ENSYRITSU</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Lato:wght@400;700&family=Source+Code+Pro:wght@400;600&family=Noto+Sans+JP:wght@400;700&family=Noto+Serif+JP:wght@400;600;700&display=swap" rel="stylesheet" />
  <script>
    window.MathJax = {
      tex: {
        inlineMath: [["\\(", "\\)"]],
        displayMath: [["\\[", "\\]"]],
      },
      chtml: { scale: 0.94, matchFontHeight: false },
      options: { enableMenu: false },
    };
  </script>
  <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js" id="MathJax-script" defer></script>
</head>
<body>
<style>
${css}
</style>
<div class="wes-deliverable pi-page">
${MARKUP}
</div>
<script defer>
${js}
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'index.html'), out, 'utf8');
console.log('Wrote embed/index.html');
