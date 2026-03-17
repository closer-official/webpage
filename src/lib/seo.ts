import type { PageContent, SEOData } from '../types';

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
export function buildJsonLd(content: PageContent, seo: SEOData, canonicalUrl: string): string {
  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: content.siteName,
    url: canonicalUrl || seo.canonicalUrl,
  };
  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: seo.metaTitle,
    description: seo.metaDescription,
    url: canonicalUrl || seo.canonicalUrl,
  };
  return JSON.stringify([org, webPage]);
}
