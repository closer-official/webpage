/** 内容は src/lib/responsiveBaseCss.ts と同期してください */
export const RESPONSIVE_BASE_CSS = `
/* ===== Closer: global responsive (mobile / tablet / notch) ===== */
html {
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}
body.page-wrapper,
body.bp,
body.bp-dark {
  overflow-x: clip;
  max-width: 100%;
  margin: 0;
}
*, *::before, *::after { box-sizing: border-box; }
img, video, iframe, svg, canvas {
  max-width: 100%;
  height: auto;
}
picture { display: block; max-width: 100%; }
p, h1, h2, h3, h4, h5, h6, li, td, th, dt, dd, a, span, label, button, input, textarea, select {
  overflow-wrap: anywhere;
  word-break: break-word;
}
main, header, footer, section, article, .container, .header-inner, .hero-inner, .wo-hero-inner, .gym-hero-inner {
  max-width: 100%;
}

/* 横スクロールしやすいブロック */
.wo-price-table-wrap,
[class*="table-wrap"],
[class*="-table-wrap"] {
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 1024px) {
  .container,
  .header-inner,
  .hero-inner,
  .wo-hero-inner,
  .gym-hero-inner,
  .footer-cols,
  .footer-wo .container,
  .builder-content-inner {
    padding-left: max(14px, env(safe-area-inset-left, 0px));
    padding-right: max(14px, env(safe-area-inset-right, 0px));
  }
}

@media (max-width: 900px) {
  .header-inner {
    flex-wrap: wrap;
    row-gap: 0.5rem;
    justify-content: center;
  }
  .nav {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.35rem 0.75rem;
    max-width: 100%;
  }
  .nav-link {
    font-size: clamp(0.72rem, 2.8vw, 0.95rem);
  }
}

@media (max-width: 768px) {
  .hero,
  .hero-full-img,
  .wo-hero,
  .gym-hero-section,
  .pro-hero,
  .pet-hero,
  .ramen-hero {
    min-height: min(88vh, 720px);
    min-height: min(88dvh, 720px);
  }
  .hell-hero-parallax {
    background-size: cover;
    background-position: center center;
  }
  .pro-svc-grid,
  .pet-service-list,
  .gym-reason-grid,
  .gym-menu-cards,
  .gym-audience-hooks,
  .footer-cols {
    grid-template-columns: 1fr !important;
  }
}

@media (max-width: 640px) {
  .logo {
    max-width: min(100%, 52vw);
    font-size: clamp(0.82rem, 3.6vw, 1rem);
  }
  .hero h1,
  .hero-inner h1,
  .wo-hero-inner h1,
  .gym-hero-inner h1,
  .pro-hero .hero-inner h1,
  h1.builder-hero-title {
    font-size: clamp(1.25rem, 5.2vw, 2.25rem);
    line-height: 1.18;
  }
  h2.wo-sec-heading,
  h2.salon-sec-title,
  .wo-lede-heading,
  .pet-sec-title {
    font-size: clamp(1.05rem, 4vw, 1.75rem);
  }
  .subheadline,
  .builder-hero-catchphrase {
    font-size: clamp(0.85rem, 3.2vw, 1.05rem);
  }
  table { font-size: 0.88rem; }
  .cta-btn,
  .cta-btn-primary,
  .cta-block .cta-btn {
    padding: 0.65em 1em;
    font-size: clamp(0.75rem, 3.2vw, 0.95rem);
  }
  .pro-sticky-cta,
  .gym-sticky-cta,
  .cram-sticky-cta {
    left: 0 !important;
    right: 0 !important;
    max-width: 100%;
    padding-left: max(8px, env(safe-area-inset-left, 0px)) !important;
    padding-right: max(8px, env(safe-area-inset-right, 0px)) !important;
    box-sizing: border-box;
  }
}

@media (max-width: 480px) {
  .page-wrapper {
    font-size: clamp(14px, 3.5vw, 16px);
  }
  .builder-view-hero,
  .builder-view {
    overflow-x: hidden;
  }
}

/* ブループリント用 body クラス */
body.bp .bp-hero-grid,
body.bp-dark .bp-hero-grid-dark {
  max-width: 100%;
}
@media (max-width: 899px) {
  body.bp .bp-hero-grid,
  body.bp-dark .bp-hero-grid-dark {
    grid-template-columns: 1fr;
  }
}

/* 決済ブランドロゴ（本文に Visa / PayPay 等の記載がある場合のみ出力） */
.closer-payment-logos {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 0.75rem;
  margin: 0.65rem 0 0.35rem;
}
.closer-payment-logos__item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 1.65rem;
  min-width: 2.25rem;
  padding: 0.15rem 0.4rem;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  box-sizing: border-box;
}
.closer-payment-logos__item img {
  display: block;
  max-height: 1.35rem;
  width: auto;
  max-width: 3.25rem;
  object-fit: contain;
}

/* LINE / Instagram 公式アイコン（/social-icons/*.png） */
.closer-social-icon-img {
  display: block;
  max-width: 100%;
  height: auto;
}
.wo-sns-row .wo-sns-emoji {
  display: inline-flex;
  width: 2.75rem;
  height: 2.75rem;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  line-height: 0;
}
.wo-sns-row .wo-sns-emoji .closer-social-icon-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.section.sns-links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1rem;
}
.section.sns-links h2 {
  width: 100%;
  margin: 0 0 0.5rem;
}
.sns-links-icon-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  line-height: 0;
}
`;
