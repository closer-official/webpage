/**
 * embed/index.html を style.css / script.js とマークアップから生成（プレビューは body を埋め込むためインライン必須）
 * 実行: node build-inline.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const css = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8');
const js = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');

const MARKUP = String.raw`
<div class="pi-flow-bg" aria-hidden="true"><span id="pi-flow-text"></span></div>
<canvas id="pi-cursor-canvas" width="400" height="300" aria-hidden="true"></canvas>

<div id="pi-loader" role="alert" aria-live="polite" aria-busy="true">
  <div id="pi-loader__ring-wrap">
    <div id="pi-loader__glow" aria-hidden="true"></div>
    <svg id="pi-svg-ring" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="piDigitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#a3e635;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#38bdf8;stop-opacity:0.75" />
          <stop offset="100%" style="stop-color:#38bdf8;stop-opacity:0.04" />
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
      <a href="#section-definition">定義</a>
      <a href="#section-formulas">公式</a>
      <a href="#section-history">歴史</a>
      <a href="#section-digits">桁</a>
    </nav>
  </header>

  <section id="hero" class="pi-skip-target" aria-labelledby="hero-title">
    <p class="pi-hero__pi" aria-hidden="true">π</p>
    <h1 id="hero-title" class="pi-hero__title">円周率（えんしゅうりつ）</h1>
    <p class="pi-hero__lead">
      円の周長とその直径との比として定まる正の実数。円の大きさに依らない不変量であり、記号はギリシャ文字の <strong>π</strong>（パイ）で表す。
    </p>
    <div class="pi-hero__meta" aria-hidden="true">
      <span>C = πd = 2πr</span>
      <span>超越数 · 無理数</span>
    </div>
  </section>

  <section id="section-definition" class="pi-section pi-reveal" style="--reveal-delay:0.05s">
    <header class="pi-section__head">
      <span class="pi-section__label">DEFINITION</span>
      <h2 class="pi-section__title">定義と性質</h2>
    </header>
    <div class="pi-grid pi-grid--2">
      <article class="pi-card">
        <h3>π とは</h3>
        <p>平面上の任意の円について、周長 <em>C</em> と直径 <em>d</em> の比 <em>C/d</em> は常に同じ値に等しい。その値を円周率といい、π で表す。</p>
        <button type="button" class="pi-art" data-art="diameter" aria-label="直径と円周の関係を拡大表示">
          <svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.9"/>
                <stop offset="100%" stop-color="#a3e635" stop-opacity="0.7"/>
              </linearGradient>
            </defs>
            <circle cx="200" cy="120" r="88" fill="none" stroke="url(#g1)" stroke-width="2.5"/>
            <line x1="112" y1="120" x2="288" y2="120" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 6"/>
            <text x="200" y="108" text-anchor="middle" fill="#a3e635" font-size="14" font-family="Source Code Pro, monospace">d</text>
            <path d="M 200 32 A 88 88 0 0 1 288 120" fill="none" stroke="#38bdf8" stroke-width="2"/>
            <text x="252" y="58" fill="#e8edf5" font-size="12" font-family="Source Code Pro, monospace">C = πd</text>
          </svg>
          <p class="pi-art__cap">直径 <em>d</em> と円周 <em>C</em> — 比が π</p>
        </button>
      </article>
      <article class="pi-card">
        <h3>特性</h3>
        <p>π は無理数であり、また超越数である。十進展開は非循環で続き、計算機科学や暗号の擬似乱数源の話題とも結びつく。</p>
        <button type="button" class="pi-art" data-art="polygon" aria-label="正多角形による近似を拡大表示">
          <svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="200" cy="120" r="90" fill="none" stroke="#38bdf8" stroke-opacity="0.35" stroke-width="1"/>
            <polygon points="200,40 278,75 278,165 200,200 122,165 122,75" fill="none" stroke="#a3e635" stroke-width="2.5" stroke-linejoin="round"/>
            <circle cx="200" cy="120" r="3" fill="#a3e635"/>
          </svg>
          <p class="pi-art__cap">内接正多角形 — アルキメデス的近似のイメージ</p>
        </button>
      </article>
    </div>
  </section>

  <section id="section-formulas" class="pi-section pi-reveal" style="--reveal-delay:0.1s">
    <header class="pi-section__head">
      <span class="pi-section__label">FORMULAS</span>
      <h2 class="pi-section__title">代表的な公式</h2>
    </header>
    <div class="pi-grid pi-grid--2">
      <article class="pi-card">
        <h3>ライプニッツ級数</h3>
        <p>交互級数として π を与える古典的な表現。項が増えるほど、部分和は π/4 に近づく。</p>
        <div class="pi-formula-block">
          <div class="pi-formula" tabindex="0">
            π/4 = 1 − 1/3 + 1/5 − 1/7 + …
            <div class="pi-formula__viz" aria-hidden="true">
              <svg viewBox="0 0 400 120" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
                <polyline points="20,100 80,35 140,95 200,25 260,88 320,18 380,80" fill="none" stroke="#a3e635" stroke-width="2"/>
                <line x1="20" y1="60" x2="380" y2="60" stroke="#38bdf8" stroke-opacity="0.35" stroke-dasharray="6 8"/>
                <text x="200" y="112" text-anchor="middle" fill="#8b96a8" font-size="11">項数を増やすほど π/4 に収束（模式図）</text>
              </svg>
            </div>
          </div>
        </div>
      </article>
      <article class="pi-card">
        <h3>オイラーの等式</h3>
        <p>複素指数と三角関数を結び、五つの基本定数を一つの等式にまとめる。</p>
        <div class="pi-formula-block">
          <div class="pi-formula" tabindex="0">
            e<sup>iπ</sup> + 1 = 0
            <div class="pi-formula__viz" aria-hidden="true">
              <svg viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg">
                <circle cx="200" cy="60" r="48" fill="none" stroke="#38bdf8" stroke-opacity="0.6"/>
                <line x1="200" y1="60" x2="248" y2="60" stroke="#a3e635" stroke-width="2"/>
                <circle cx="248" cy="60" r="4" fill="#a3e635"/>
                <text x="200" y="105" text-anchor="middle" fill="#8b96a8" font-size="11">単位円上の角度 π（模式図）</text>
              </svg>
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>

  <section id="section-history" class="pi-section pi-reveal" style="--reveal-delay:0.12s">
    <header class="pi-section__head">
      <span class="pi-section__label">HISTORY</span>
      <h2 class="pi-section__title">計算の歴史（概略）</h2>
    </header>
    <div class="pi-prose">
      <p>古代メソポタミアやエジプトでは円周率の近似値が文書に見られる。ギリシャのアルキメデスは内接・外接の正多角形から π を評価し、幾何と数の橋をかけた。</p>
      <p>近代以降は無限級数・無限積・モンテカルロ法など多様なアルゴリズムで桁が伸び、スーパーコンピュータを用いた記録競争は計算数学の象徴的存在となった。</p>
    </div>
    <button type="button" class="pi-art pi-reveal" style="--reveal-delay:0.15s;margin-top:1.25rem" data-art="digits" aria-label="桁の分布イメージを拡大表示">
      <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <g transform="translate(40,20)">
          <rect x="0" y="120" width="24" height="40" fill="#38bdf8" opacity="0.5"/>
          <rect x="32" y="100" width="24" height="60" fill="#a3e635" opacity="0.55"/>
          <rect x="64" y="110" width="24" height="50" fill="#38bdf8" opacity="0.45"/>
          <rect x="96" y="90" width="24" height="70" fill="#a3e635" opacity="0.6"/>
          <rect x="128" y="105" width="24" height="55" fill="#38bdf8" opacity="0.5"/>
          <rect x="160" y="95" width="24" height="65" fill="#a3e635" opacity="0.55"/>
          <rect x="192" y="115" width="24" height="45" fill="#38bdf8" opacity="0.48"/>
          <rect x="224" y="85" width="24" height="75" fill="#a3e635" opacity="0.62"/>
          <rect x="256" y="108" width="24" height="52" fill="#38bdf8" opacity="0.5"/>
          <rect x="288" y="98" width="24" height="62" fill="#a3e635" opacity="0.58"/>
        </g>
        <text x="200" y="190" text-anchor="middle" fill="#8b96a8" font-size="11">0–9 の出現（概念的な棒グラフ）</text>
      </svg>
      <p class="pi-art__cap">クリックで拡大 — 一様な出現のイメージ</p>
    </button>
  </section>

  <section id="section-digits" class="pi-section pi-reveal" style="--reveal-delay:0.08s">
    <header class="pi-section__head">
      <span class="pi-section__label">VALUE</span>
      <h2 class="pi-section__title">桁と無限</h2>
    </header>
    <p class="pi-prose">画面奥に流れる数字は π の十進桁をテクスチャとして用いたものです。可視化は装飾であり、検算や公式の定義には代わりません。</p>
  </section>

  <footer class="pi-footer" id="contact">
    <p><strong>円室律 ENSYRITSU</strong> — 静的デモ（円周率をテーマにしたオリジナル構成）</p>
    <p>数値・図は説明用の模式表現です。</p>
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
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Lato:wght@400;700&family=Source+Code+Pro:wght@400;600&family=Noto+Sans+JP:wght@400;700&display=swap" rel="stylesheet" />
</head>
<body>
<style>
${css}
</style>
<div class="wes-deliverable pi-page">
${MARKUP}
</div>
<script>
${js}
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'index.html'), out, 'utf8');
console.log('Wrote embed/index.html');
