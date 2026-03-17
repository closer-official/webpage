import { analyzePlace, generateDmBody } from './gemini.js';
import { CONCEPT_TEMPLATES } from './conceptTemplates.js';
import { buildHtml } from './buildHtml.js';
import { getPlacePhotoUrls } from './placePhotos.js';
import QRCode from 'qrcode';

function makeId() {
  return `d-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** 標準9セクションの枠（順序固定・実際に作るときに埋める） */
const STANDARD_SECTIONS = [
  { id: 'concept', title: 'コンセプト' },
  { id: 'menu', title: 'メニュー・サービス' },
  { id: 'hours', title: '営業時間' },
  { id: 'access', title: 'アクセス' },
  { id: 'price', title: '料金・プラン' },
  { id: 'staff', title: 'スタッフ・私たち' },
  { id: 'faq', title: 'よくある質問' },
  { id: 'gallery', title: 'ギャラリー' },
  { id: 'contact', title: 'お問い合わせ' },
];

function analysisToContent(name, address, analysis) {
  const getContent = (id) => {
    if (id === 'concept' && analysis.concept) return analysis.concept;
    if (id === 'menu' && analysis.strengths) return analysis.strengths;
    if (id === 'hours') return '営業時間はお問い合わせください。';
    if (id === 'access' && address) return address;
    if (id === 'price') return '料金の詳細はお問い合わせください。';
    if (id === 'staff') return 'スタッフ紹介は準備中です。';
    if (id === 'faq') return 'よくある質問は準備中です。';
    if (id === 'gallery' && analysis.atmosphere) return analysis.atmosphere;
    if (id === 'contact') return analysis.targetAudience ? `お客様：${analysis.targetAudience}\n\nお気軽にお問い合わせください。` : 'お気軽にお問い合わせください。';
    return '（記載予定）';
  };

  const sections = STANDARD_SECTIONS.map((s) => ({
    id: s.id,
    title: s.title,
    content: getContent(s.id) || '（記載予定）',
  }));
  if (sections.every((s) => !s.content || s.content === '（記載予定）')) sections[0].content = analysis.concept || name;

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
  let seo = contentToSeo(content);

  // placeId がある場合は Google Maps の写真を自動取得して hero・OG・セクションに割り当て
  if (queueItem.placeId) {
    const photoUrls = await getPlacePhotoUrls(queueItem.placeId, 6);
    if (photoUrls.length > 0) {
      seo = { ...seo, ogImageUrl: photoUrls[0] };
      content.heroSlides = photoUrls;
      for (let i = 0; i < content.sections.length && i + 1 < photoUrls.length; i++) {
        content.sections[i].imageUrl = photoUrls[i + 1];
      }
    }
  }

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
