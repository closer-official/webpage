import type { PageContent, PageSection, SEOData, ResearchedShop } from '../types';
import { generateMetaDescription, generateMetaTitle, generateKeywords } from './seo';

/**
 * 調査済み店舗データからLP用のページコンテンツを生成する（AIは使わない）
 */
export function researchToPageContent(shop: ResearchedShop): PageContent {
  const sections: PageSection[] = [];
  if (shop.concept?.trim()) {
    sections.push({ id: 'section-1', title: 'コンセプト', content: shop.concept.trim() });
  }
  if (shop.strengths?.trim()) {
    sections.push({ id: `section-${sections.length + 2}`, title: '私たちの強み', content: shop.strengths.trim() });
  }
  if (shop.address?.trim()) {
    sections.push({ id: `section-${sections.length + 3}`, title: 'アクセス', content: shop.address.trim() });
  }
  if (sections.length === 0) {
    sections.push({ id: 'section-1', title: 'ごあいさつ', content: shop.concept || shop.strengths || '内容を追加してください。' });
  }

  return {
    siteName: shop.name,
    title: shop.name,
    headline: shop.name,
    subheadline: shop.concept || '',
    sections,
    footerText: `© ${new Date().getFullYear()} ${shop.name}. All rights reserved.`,
  };
}

export function researchToSeo(shop: ResearchedShop, content: PageContent): SEOData {
  return {
    metaTitle: generateMetaTitle(content, shop.name),
    metaDescription: generateMetaDescription(content),
    keywords: generateKeywords(content).join(', '),
    ogImageUrl: '',
    canonicalUrl: '',
  };
}
