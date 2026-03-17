import { analyzePlace, generateDmBody } from './gemini.js';
import { CONCEPT_TEMPLATES } from './conceptTemplates.js';
import { buildHtml } from './buildHtml.js';
import QRCode from 'qrcode';

function makeId() {
  return `d-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function analysisToContent(name, address, analysis) {
  const sections = [
    analysis.concept && { id: 'concept', title: 'コンセプト', content: analysis.concept },
    analysis.strengths && { id: 'strengths', title: '私たちの強み', content: analysis.strengths },
    analysis.atmosphere && { id: 'atmosphere', title: '雰囲気', content: analysis.atmosphere },
    analysis.targetAudience && { id: 'target', title: 'お客様', content: analysis.targetAudience },
    address && { id: 'access', title: 'アクセス', content: address },
  ].filter(Boolean);
  if (sections.length === 0) sections.push({ id: 'about', title: 'ごあいさつ', content: analysis.concept || name });
  return {
    siteName: name,
    title: name,
    headline: name,
    subheadline: analysis.concept || '',
    sections,
    footerText: `© ${new Date().getFullYear()} ${name}. All rights reserved.`,
  };
}

function contentToSeo(content) {
  const desc = (content.subheadline + ' ' + (content.sections[0]?.content || '')).slice(0, 160);
  return {
    metaTitle: `${content.title} | ${content.siteName}`.slice(0, 60),
    metaDescription: desc,
    keywords: content.siteName + ', ' + content.headline,
    ogImageUrl: '',
    canonicalUrl: '',
  };
}

/**
 * キュー1件を処理: 分析 → 上位3テンプレでLP生成 → DM生成 → ダッシュボードに保存
 */
export async function processOne(queueItem, genOptions) {
  const reviewsText = (queueItem.reviews || []).join('\n');
  const analysis = await analyzePlace(
    queueItem.name,
    queueItem.address || '',
    queueItem.category || 'general',
    reviewsText
  );
  const content = analysisToContent(queueItem.name, queueItem.address, analysis);
  const seo = contentToSeo(content);
  const conceptId = analysis.conceptId || 'general';
  const templateIds = CONCEPT_TEMPLATES[conceptId] || CONCEPT_TEMPLATES.general;
  const top3 = templateIds.slice(0, 3);

  let qrCodeDataUrl = '';
  if (genOptions.qrCode) {
    const urlToEncode = seo.canonicalUrl || genOptions.qrCodeTargetUrl || '';
    if (urlToEncode) {
      try {
        qrCodeDataUrl = await QRCode.toDataURL(urlToEncode, { width: 120, margin: 1 });
      } catch (_) {
        qrCodeDataUrl = '';
      }
    }
  }

  const contentVariants = top3.map((templateId) => ({
    templateId,
    html: buildHtml(content, seo, templateId, {
      ...genOptions,
      instagramUrl: queueItem.instagramUrl || '',
      lineUrl: queueItem.lineUrl || '',
      qrCodeDataUrl,
    }),
  }));

  const dmBody = await generateDmBody(content.headline, analysis.concept, analysis.strengths);

  const signals = {
    placeId: queueItem.placeId || null,
    mapsUrl: queueItem.placeId ? `https://www.google.com/maps/place/?q=place_id:${queueItem.placeId}` : null,
    rating: queueItem.rating ?? null,
    userRatingsTotal: queueItem.userRatingsTotal ?? null,
    hasOpeningHours: queueItem.hasOpeningHours ?? false,
    hasPhoto: queueItem.hasPhoto ?? false,
    needsVerification: (queueItem.userRatingsTotal ?? 0) < 3,
  };

  const dashboardItem = {
    id: makeId(),
    researched: {
      queueId: queueItem.id,
      name: queueItem.name,
      address: queueItem.address || '',
      concept: analysis.concept,
      strengths: analysis.strengths,
      imageColorStyleId: top3[0],
      category: queueItem.category || 'general',
      notes: queueItem.notes || '',
      signals,
    },
    content,
    seo,
    templateId: top3[0],
    contentVariants,
    dmBody,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  return dashboardItem;
}
