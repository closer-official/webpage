/**
 * 本文に記載のある決済ブランド（Visa / Mastercard / JCB / Amex / Diners / PayPay）に応じて
 * ロゴ行の HTML を差し込む。画像は /payment-logos/*.png（public 配下）。
 */

const BRAND_ORDER = ['visa', 'mastercard', 'jcb', 'amex', 'diners', 'paypay'];

const BRAND_META = {
  visa: { file: 'visa.png', alt: 'Visa' },
  mastercard: { file: 'mastercard.png', alt: 'Mastercard' },
  jcb: { file: 'jcb.png', alt: 'JCB' },
  amex: { file: 'amex.png', alt: 'American Express' },
  diners: { file: 'diners.png', alt: 'Diners Club' },
  paypay: { file: 'paypay.png', alt: 'PayPay' },
};

function escapeAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

/** @param {string} text */
function detectBrandsInLine(text) {
  const t = String(text || '');
  const found = new Set();
  if (/\bvisa\b/i.test(t)) found.add('visa');
  if (/\bmaster(?:card)?\b|マスタ[ーｰ]?カード?/i.test(t)) found.add('mastercard');
  if (/\bjcb\b/i.test(t)) found.add('jcb');
  if (/\bamex\b|\bamerican\s*express\b/i.test(t)) found.add('amex');
  if (/\bdiners(?:\s+club)?\b|ダイナーズ/i.test(t)) found.add('diners');
  if (/\bpaypay\b|ペイペイ/i.test(t)) found.add('paypay');
  return found;
}

/** @param {Set<string>} brandIds */
function renderLogoRow(brandIds) {
  const ordered = BRAND_ORDER.filter((id) => brandIds.has(id));
  if (!ordered.length) return '';
  const imgs = ordered
    .map((id) => {
      const m = BRAND_META[id];
      return `<span class="closer-payment-logos__item"><img src="/payment-logos/${m.file}" alt="${escapeAttr(m.alt)}" width="44" height="28" loading="lazy" decoding="async"></span>`;
    })
    .join('');
  return `<div class="closer-payment-logos" role="group" aria-label="お支払いブランド">${imgs}</div>`;
}

/**
 * 改行ごとに <p> を分け、行内にブランド名があればその直後にロゴ行を付与。
 * @param {string | null | undefined} rawContent
 * @param {(s: string) => string} escapeHtml
 */
export function renderProseParagraphsWithPaymentLogos(rawContent, escapeHtml) {
  const lines = String(rawContent ?? '').split('\n');
  return lines
    .map((line) => {
      const p = `<p>${escapeHtml(line)}</p>`;
      const brands = detectBrandsInLine(line);
      return brands.size ? p + renderLogoRow(brands) : p;
    })
    .join('');
}

/**
 * 単一 <p> 内を <br> 連結。全文から検出したブランドをまとめて末尾にロゴ行。
 * @param {string | null | undefined} rawContent
 * @param {(s: string) => string} escapeHtml
 * @param {{ className?: string }} [opts]
 */
export function wrapBrParagraphWithPaymentLogos(rawContent, escapeHtml, opts = {}) {
  const inner = escapeHtml(String(rawContent ?? '')).replace(/\n/g, '<br>');
  const allBrands = new Set();
  String(rawContent ?? '')
    .split('\n')
    .forEach((line) => {
      detectBrandsInLine(line).forEach((b) => allBrands.add(b));
    });
  const row = allBrands.size ? renderLogoRow(allBrands) : '';
  const cls = opts.className ? ` class="${opts.className}"` : '';
  return `<p${cls}>${inner}</p>${row}`;
}

/**
 * <div> 等にそのまま入れる用（<br> 連結 + 末尾ロゴ）
 * @param {string | null | undefined} rawContent
 * @param {(s: string) => string} escapeHtml
 */
export function appendPaymentLogosAfterBrContent(rawContent, escapeHtml) {
  const inner = escapeHtml(String(rawContent ?? '')).replace(/\n/g, '<br>');
  const allBrands = new Set();
  String(rawContent ?? '')
    .split('\n')
    .forEach((line) => {
      detectBrandsInLine(line).forEach((b) => allBrands.add(b));
    });
  return allBrands.size ? inner + renderLogoRow(allBrands) : inner;
}

/**
 * 1行を <p> で包み、ブランドがあればロゴ行を続ける
 * @param {string} line
 * @param {(s: string) => string} escapeHtml
 */
export function plainLineAsParagraphWithPaymentLogos(line, escapeHtml) {
  const p = `<p>${escapeHtml(line)}</p>`;
  const brands = detectBrandsInLine(line);
  return brands.size ? p + renderLogoRow(brands) : p;
}
