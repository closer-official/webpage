import type { PageContent, SEOData } from '../types';

/** サブドメイン用に店名などをスラッグ化（先頭63文字・DNSラベル向け） */
export function slugifyForSubdomain(name: string): string {
  const n = name.normalize('NFKC').trim().toLowerCase();
  let s = n.replace(/\s+/g, '-').replace(/[^\p{L}\p{N}\-]/gu, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (!s) {
    let h = 2166136261;
    for (let i = 0; i < n.length; i++) h = Math.imul(h ^ n.charCodeAt(i), 16777619);
    s = 'site-' + (h >>> 0).toString(36).slice(0, 10);
  }
  return s.slice(0, 63);
}

/**
 * 手入力 canonical が空のとき、`https://{slug}.{host}/` を返す。
 * @param envDefaultHost 例: Vercel の `VITE_AUTO_CANONICAL_HOST`（closer-official.com）
 */
export function resolveEffectiveCanonicalUrl(
  seo: SEOData,
  siteName: string,
  templateId: string,
  envDefaultHost = ''
): string {
  const manual = (seo.canonicalUrl || '').trim();
  if (manual) return manual;
  let host = (seo.autoCanonicalHost || '').trim();
  if (!host && templateId === 'event') host = 'event-view.net';
  if (!host && envDefaultHost) host = envDefaultHost.trim();
  if (!host) return '';
  host = host.replace(/^https?:\/\//i, '').split('/')[0]?.trim() ?? '';
  if (!host) return '';
  const slug = slugifyForSubdomain(siteName || 'site');
  if (!slug) return '';
  return `https://${slug}.${host}/`;
}

export function readViteAutoCanonicalHost(): string {
  try {
    const v = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_AUTO_CANONICAL_HOST;
    return v ? String(v).trim() : '';
  } catch {
    return '';
  }
}

/** buildHtml 用: 解決済み canonical（メタ・JSON-LD 共通） */
export function getEffectiveCanonicalForBuild(
  seo: SEOData,
  siteName: string,
  templateId: string
): string {
  return resolveEffectiveCanonicalUrl(seo, siteName, templateId, readViteAutoCanonicalHost());
}

/** タイトルと本文からメタ説明を自動生成（160字前後） */
export function generateMetaDescription(content: PageContent, maxLen = 160): string {
  const parts: string[] = [];
  if (content.subheadline) parts.push(content.subheadline);
  if (content.sections.length > 0 && content.sections[0].content) {
    parts.push(content.sections[0].content);
  }
  const joined = parts.join(' ').replace(/\s+/g, ' ').trim();
  if (joined.length <= maxLen) return joined;
  return joined.slice(0, maxLen - 3) + '...';
}

/** メタタイトルを生成（60字前後） */
export function generateMetaTitle(content: PageContent, siteName: string, maxLen = 60): string {
  const base = content.title || content.headline || siteName;
  const withSite = siteName ? `${base} | ${siteName}` : base;
  if (withSite.length <= maxLen) return withSite;
  return base.slice(0, maxLen - 3) + '...';
}

/** キーワードをセクションタイトルなどから簡易抽出 */
export function generateKeywords(content: PageContent, count = 8): string[] {
  const words = new Map<string, number>();
  const add = (text: string) => {
    text.split(/\s+/).forEach((w) => {
      const k = w.replace(/[^\p{L}\p{N}]/gu, '');
      if (k.length >= 2) words.set(k, (words.get(k) || 0) + 1);
    });
  };
  add(content.siteName);
  add(content.title);
  add(content.headline);
  content.sections.forEach((s) => {
    add(s.title);
    add(s.content.slice(0, 200));
  });
  return Array.from(words.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([k]) => k);
}

/** 「¥1,100」等から JSON-LD Offer 用の価格文字列（数字のみ）を抽出 */
function parsePriceYenForJsonLd(price?: string): string | undefined {
  if (!price) return undefined;
  const digits = price.replace(/[,¥￥\s]/g, '').replace(/[^\d]/g, '');
  return digits || undefined;
}

/** cafe_1 テキストメニュー行から schema.org Menu を組み立てる */
function buildCafeMenuJsonLd(
  rows: NonNullable<PageContent['cafeMenuTextRows']>
): Record<string, unknown> | undefined {
  if (!rows.length) return undefined;
  type MenuItemJson = Record<string, unknown>;
  const sections: { name: string; items: MenuItemJson[] }[] = [];
  let cur: { name: string; items: MenuItemJson[] } | null = null;

  for (const row of rows) {
    const g = (row.groupLabel ?? '').trim() || 'メニュー';
    if (!cur || cur.name !== g) {
      if (cur) sections.push(cur);
      cur = { name: g, items: [] };
    }
    const displayName = [row.name, row.badge].filter(Boolean).join(' ');
    const item: MenuItemJson = {
      '@type': 'MenuItem',
      name: displayName || 'メニュー',
    };
    if (row.description?.trim()) item.description = row.description.trim();
    const p = parsePriceYenForJsonLd(row.price);
    if (p) {
      item.offers = { '@type': 'Offer', price: p, priceCurrency: 'JPY' };
    }
    cur.items.push(item);
  }
  if (cur) sections.push(cur);

  const hasMenuSection = sections.map((sec) => ({
    '@type': 'MenuSection',
    name: sec.name,
    hasMenuItem: sec.items,
  }));

  return {
    '@type': 'Menu',
    name: 'お品書き',
    hasMenuSection,
  };
}

/** JSON-LD Organization / WebPage 用の構造化データを生成 */
export function buildJsonLd(
  content: PageContent,
  seo: SEOData,
  canonicalUrl: string,
  templateId?: string
): string {
  const url = (canonicalUrl || '').trim() || (seo.canonicalUrl || '').trim();
  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: content.siteName,
    url: url || undefined,
  };
  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: seo.metaTitle,
    description: seo.metaDescription,
    url: url || undefined,
    inLanguage: 'ja-JP',
  };
  const graphs: object[] = [org, webPage];

  if (templateId === 'gym_yoga') {
    const localBusiness: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'ExerciseGym',
      name: content.siteName,
      description: seo.metaDescription,
      url: url || undefined,
    };
    if (content.footerPhone) localBusiness.telephone = content.footerPhone;
    if (content.footerAddress) {
      localBusiness.address = {
        '@type': 'PostalAddress',
        streetAddress: content.footerAddress,
        addressCountry: 'JP',
      };
    }
    if (seo.ogImageUrl) localBusiness.image = seo.ogImageUrl;
    graphs.push(localBusiness);
  }

  if (templateId === 'cafe_1') {
    const meo = content.cafeMeo;
    const restaurant: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      name: content.siteName,
      description: seo.metaDescription,
      url: url || undefined,
    };
    if (content.footerPhone) restaurant.telephone = content.footerPhone;
    const street =
      (meo?.streetAddress || '').trim() || (content.footerAddress || '').trim() || undefined;
    if (street || meo?.addressLocality || meo?.addressRegion || meo?.postalCode) {
      restaurant.address = {
        '@type': 'PostalAddress',
        streetAddress: street,
        addressLocality: meo?.addressLocality || undefined,
        addressRegion: meo?.addressRegion || undefined,
        postalCode: meo?.postalCode || undefined,
        addressCountry: 'JP',
      };
    }
    if (meo?.servesCuisine) restaurant.servesCuisine = meo.servesCuisine;
    if (meo?.priceRange) restaurant.priceRange = meo.priceRange;
    if (meo?.openingHours?.length) restaurant.openingHours = meo.openingHours;
    const imgs = [seo.ogImageUrl, ...(content.heroSlides ?? []).map((u) => (u || '').trim()).filter(Boolean)].filter(
      Boolean
    ) as string[];
    if (imgs.length) restaurant.image = imgs.length === 1 ? imgs[0] : imgs;
    const menuLd = buildCafeMenuJsonLd(content.cafeMenuTextRows ?? []);
    if (menuLd) restaurant.hasMenu = menuLd;
    graphs.push(restaurant);
  }

  const faq = content.faqItems ?? [];
  if (faq.length > 0) {
    graphs.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      ...(url ? { url } : {}),
      mainEntity: faq.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a,
        },
      })),
    });
  }

  return JSON.stringify(graphs);
}
