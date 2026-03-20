import type { PageContent } from '../types';

function deepClone<T>(o: T): T {
  return JSON.parse(JSON.stringify(o));
}

export function getTextFromPe(content: PageContent, pe: string): string {
  if (pe === 'headline') return content.headline || '';
  if (pe === 'subheadline') return content.subheadline || '';
  if (pe === 'siteName') return content.siteName || '';
  if (pe === 'footerText') return content.footerText || '';
  const mt = /^section-([^-]+)-title$/.exec(pe);
  if (mt) return content.sections.find((s) => s.id === mt[1])?.title || '';
  const mb = /^section-([^-]+)-body$/.exec(pe);
  if (mb) return content.sections.find((s) => s.id === mb[1])?.content || '';
  return '';
}

export function getImageUrlFromPe(content: PageContent, pe: string): string {
  const mi = /^section-([^-]+)-image$/.exec(pe);
  if (mi) return content.sections.find((s) => s.id === mi[1])?.imageUrl || '';
  return '';
}

export function getHeroBgUrl(content: PageContent): string {
  const h = (content.heroSlides || []).filter((u) => (u || '').trim());
  if (h[0]) return h[0];
  return '';
}

export function applyTextPe(content: PageContent, pe: string, text: string): PageContent {
  const next = deepClone(content);
  if (pe === 'headline') {
    next.headline = text;
    return next;
  }
  if (pe === 'subheadline') {
    next.subheadline = text;
    return next;
  }
  if (pe === 'siteName') {
    next.siteName = text;
    if (next.title === content.siteName) next.title = text;
    return next;
  }
  if (pe === 'footerText') {
    next.footerText = text;
    return next;
  }
  const mt = /^section-([^-]+)-title$/.exec(pe);
  if (mt) {
    const i = next.sections.findIndex((s) => s.id === mt[1]);
    if (i >= 0) next.sections[i] = { ...next.sections[i], title: text };
    return next;
  }
  const mb = /^section-([^-]+)-body$/.exec(pe);
  if (mb) {
    const i = next.sections.findIndex((s) => s.id === mb[1]);
    if (i >= 0) next.sections[i] = { ...next.sections[i], content: text };
    return next;
  }
  return next;
}

export function applyImagePe(content: PageContent, pe: string, url: string): PageContent {
  const next = deepClone(content);
  const mi = /^section-([^-]+)-image$/.exec(pe);
  if (mi) {
    const i = next.sections.findIndex((s) => s.id === mi[1]);
    if (i >= 0) next.sections[i] = { ...next.sections[i], imageUrl: url };
    return next;
  }
  return next;
}

export function applyHeroBgUrl(content: PageContent, url: string): PageContent {
  const next = deepClone(content);
  const slides = [...(next.heroSlides || [])];
  if (slides.length === 0) slides.push(url);
  else slides[0] = url;
  next.heroSlides = slides;
  return next;
}

export function isTextPe(pe: string): boolean {
  return ['headline', 'subheadline', 'siteName', 'footerText'].includes(pe) || /^section-[^-]+-(title|body)$/.test(pe);
}

export function isImagePe(pe: string): boolean {
  return /^section-[^-]+-image$/.test(pe);
}

export function isHeroPe(pe: string): boolean {
  return pe === 'hero';
}
