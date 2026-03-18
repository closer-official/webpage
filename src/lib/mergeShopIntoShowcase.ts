import type { PageContent, ResearchedShop } from '../types';

/** 入力した項目だけ差し替え。未入力は完成例の文言のまま。 */
export function mergeShopIntoShowcaseContent(base: PageContent, shop: ResearchedShop): PageContent {
  const out = structuredClone(base) as PageContent;
  const y = new Date().getFullYear();
  const name = shop.name?.trim() || out.siteName;
  const concept = shop.concept?.trim();
  const strengths = shop.strengths?.trim();
  const addr = shop.address?.trim();

  out.siteName = name;
  out.title = name;
  out.headline = name;
  out.footerText = `© ${y} ${name}. All rights reserved.`;

  if (concept) {
    const first = concept.split(/\n/)[0]?.trim() || concept;
    out.subheadline = first;
    if (out.quote != null && out.quote !== '') {
      out.quote = first.length <= 120 ? first : `${first.slice(0, 117)}…`;
    }
  }

  if (addr) {
    out.footerAddress = addr;
  }

  for (const s of out.sections || []) {
    if (s.id === 'concept' && concept) s.content = concept;
    if (s.id === 'menu' && strengths) s.content = strengths;
    if (s.id === 'access' && addr) s.content = addr;
  }

  return out;
}
