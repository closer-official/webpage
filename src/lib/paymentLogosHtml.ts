/**
 * 本文に記載のある決済ブランドに応じてロゴ行 HTML を差し込む（/public/payment-logos/*.png）。
 */

const BRAND_ORDER = ['visa', 'mastercard', 'jcb', 'amex', 'diners', 'paypay'] as const;
type BrandId = (typeof BRAND_ORDER)[number];

const BRAND_META: Record<BrandId, { file: string; alt: string }> = {
  visa: { file: 'visa.png', alt: 'Visa' },
  mastercard: { file: 'mastercard.png', alt: 'Mastercard' },
  jcb: { file: 'jcb.png', alt: 'JCB' },
  amex: { file: 'amex.png', alt: 'American Express' },
  diners: { file: 'diners.png', alt: 'Diners Club' },
  paypay: { file: 'paypay.png', alt: 'PayPay' },
};

function escapeAttr(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function detectBrandsInLine(text: string): Set<BrandId> {
  const t = String(text || '');
  const found = new Set<BrandId>();
  if (/\bvisa\b/i.test(t)) found.add('visa');
  if (/\bmaster(?:card)?\b|マスタ[ーｰ]?カード?/i.test(t)) found.add('mastercard');
  if (/\bjcb\b/i.test(t)) found.add('jcb');
  if (/\bamex\b|\bamerican\s*express\b/i.test(t)) found.add('amex');
  if (/\bdiners(?:\s+club)?\b|ダイナーズ/i.test(t)) found.add('diners');
  if (/\bpaypay\b|ペイペイ/i.test(t)) found.add('paypay');
  return found;
}

function renderLogoRow(brandIds: Set<BrandId>): string {
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

export function renderProseParagraphsWithPaymentLogos(rawContent: string | null | undefined, escapeHtml: (s: string) => string): string {
  const lines = String(rawContent ?? '').split('\n');
  return lines
    .map((line) => {
      const p = `<p>${escapeHtml(line)}</p>`;
      const brands = detectBrandsInLine(line);
      return brands.size ? p + renderLogoRow(brands) : p;
    })
    .join('');
}

export function wrapBrParagraphWithPaymentLogos(
  rawContent: string | null | undefined,
  escapeHtml: (s: string) => string,
  opts: { className?: string } = {}
): string {
  const inner = escapeHtml(String(rawContent ?? '')).replace(/\n/g, '<br>');
  const allBrands = new Set<BrandId>();
  String(rawContent ?? '')
    .split('\n')
    .forEach((line) => {
      detectBrandsInLine(line).forEach((b) => allBrands.add(b));
    });
  const row = allBrands.size ? renderLogoRow(allBrands) : '';
  const cls = opts.className ? ` class="${escapeAttr(opts.className)}"` : '';
  return `<p${cls}>${inner}</p>${row}`;
}

export function appendPaymentLogosAfterBrContent(rawContent: string | null | undefined, escapeHtml: (s: string) => string): string {
  const inner = escapeHtml(String(rawContent ?? '')).replace(/\n/g, '<br>');
  const allBrands = new Set<BrandId>();
  String(rawContent ?? '')
    .split('\n')
    .forEach((line) => {
      detectBrandsInLine(line).forEach((b) => allBrands.add(b));
    });
  return allBrands.size ? inner + renderLogoRow(allBrands) : inner;
}

export function plainLineAsParagraphWithPaymentLogos(line: string, escapeHtml: (s: string) => string): string {
  const p = `<p>${escapeHtml(line)}</p>`;
  const brands = detectBrandsInLine(line);
  return brands.size ? p + renderLogoRow(brands) : p;
}
