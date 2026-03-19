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

function readViteAutoCanonicalHost(): string {
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

  return JSON.stringify(graphs);
}
