import { buildHtml } from './buildHtml.js';

export const TEMPLATE_CANDIDATES = [
  { id: 'salon_barber', name: 'テンプレ1（ミニマル）' },
  { id: 'cafe_tea', name: 'テンプレ2（ナチュラル）' },
  { id: 'clinic_chiropractic', name: 'テンプレ3（信頼感）' },
  { id: 'gym_yoga', name: 'テンプレ4（力強い）' },
  { id: 'builder', name: 'テンプレ5（直線的）' },
  { id: 'professional', name: 'テンプレ6（上品）' },
  { id: 'cram_school', name: 'テンプレ7（親しみ）' },
  { id: 'izakaya', name: 'テンプレ8（ダーク）' },
  { id: 'pet_salon', name: 'テンプレ9（やわらかい）' },
  { id: 'apparel', name: 'テンプレ10（洗練）' },
  { id: 'event', name: 'テンプレ11（躍動感）' },
  { id: 'ramen', name: 'テンプレ12（和モダン）' },
];

const TEMPLATE_IDS = new Set(TEMPLATE_CANDIDATES.map((t) => t.id));

export function isValidTemplateId(id) {
  return TEMPLATE_IDS.has(String(id || ''));
}

function labelOf(id) {
  return TEMPLATE_CANDIDATES.find((t) => t.id === id)?.name || id;
}

export function renderTemplatePreview(templateId) {
  const id = String(templateId || '');
  if (!isValidTemplateId(id)) return null;

  const now = new Date().getFullYear();
  const name = labelOf(id);
  const content = {
    siteName: `${name} サンプル`,
    title: `${name} サンプル`,
    headline: `${name} サンプル`,
    subheadline: 'デザイン確認用のサンプルです。実際の制作時には内容を差し替えます。',
    sections: [
      { id: 'concept', title: 'コンセプト', content: 'このテンプレートの見え方を確認するためのサンプル文です。' },
      { id: 'menu', title: 'サービス', content: '提供サービスの概要が入ります。' },
      { id: 'hours', title: '営業時間', content: '平日 10:00-19:00 / 土日祝 9:00-18:00' },
      { id: 'access', title: 'アクセス', content: '東京都〇〇区〇〇 1-2-3' },
      { id: 'contact', title: 'お問い合わせ', content: 'お問い合わせはフォームまたはSNSからご連絡ください。' },
    ],
    ctaLabel: 'お問い合わせ',
    ctaHref: '#contact',
    footerText: `© ${now} ${name} Sample`,
    heroSlides: ['https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400'],
  };
  const seo = {
    metaTitle: `${name} テンプレート確認`,
    metaDescription: `${name} テンプレートの確認用ページです。`,
    keywords: '',
    ogImageUrl: '',
    canonicalUrl: '',
  };

  return buildHtml(content, seo, id, {
    contactForm: true,
    formActionUrl: '#',
    instagramLine: true,
    instagramUrl: 'https://instagram.com/',
    lineUrl: 'https://line.me/',
    qrCode: true,
    qrCodeTargetUrl: 'https://example.com',
  });
}
