import type { PageContent, SEOData } from '../types';
import showcase from './warm-organic-showcase.json';

/** テンプレ4（Warm Organic）カフェ用ショーケース。編集後は JSON を上書き。 */
export const WARM_ORGANIC_CAFE_PRESET = showcase as { content: PageContent; seo: SEOData };
