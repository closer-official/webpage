import type { PageContent, PageSection, SEOData, ResearchedShop } from '../types';
import { generateMetaDescription, generateMetaTitle, generateKeywords } from './seo';
import { getShowcasePreset } from '../data/showcasePresets';
import { mergeShopIntoShowcaseContent } from './mergeShopIntoShowcase';

/**
 * テンプレひな形へ店舗情報を差し込んだ LP コンテンツ（メイン経路）
 */
export function researchToShowcasePageContent(shop: ResearchedShop): PageContent {
  const { content } = getShowcasePreset(shop.imageColorStyleId);
  return mergeShopIntoShowcaseContent(content, shop);
}

export function researchToShowcaseSeo(shop: ResearchedShop, content: PageContent): SEOData {
  const { seo: baseSeo } = getShowcasePreset(shop.imageColorStyleId);
  return {
    ...baseSeo,
    metaTitle: generateMetaTitle(content, shop.name),
    metaDescription: generateMetaDescription(content),
    keywords: generateKeywords(content).join(', '),
  };
}

/**
 * 調査済み店舗データからLP用のページコンテンツを生成する（AIは使わない）
 * @deprecated シンプル3セクション用。通常は researchToShowcasePageContent を使用
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
