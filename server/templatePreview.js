import { buildHtml } from './buildHtml.js';
import { renderBlueprintHtml } from './renderBlueprintHtml.js';
import { BUILTIN_BUILD_HTML_TEMPLATES } from './templateRegistry.js';

/** 運営「⓪ デザイン」等。ビルトイン定義の正は templateRegistry.js（旧IDの描画は server/buildHtml.js に残る） */
export const TEMPLATE_CANDIDATES = [...BUILTIN_BUILD_HTML_TEMPLATES];

const TEMPLATE_IDS = new Set(TEMPLATE_CANDIDATES.map((t) => t.id));

/** 旧ビルトイン。一覧には出さないが buildHtml・過去データの検証用 */
const LEGACY_TEMPLATE_IDS = new Set(['academy_lp']);

/**
 * @param {unknown[]} customizations
 * @param {{ forPublicSelection?: boolean }} [options] forPublicSelection=true のとき下書き（draft）は一覧に含めない（ヒアリング・一般向け）
 */
export function getTemplateCandidates(customizations = [], options = {}) {
  const forPublic = options.forPublicSelection !== false;
  const custom = (Array.isArray(customizations) ? customizations : [])
    .filter((c) => {
      if (!forPublic) return true;
      if (c && c.status === 'draft') return false;
      return true;
    })
    .map((c) => ({
      id: c.id,
      name: c.blueprint
        ? c.name || `参考設計テンプレ (${c.id})`
        : c.name || `カスタムテンプレ (${c.id})`,
      baseTemplateId: c.baseTemplateId,
      customization: c,
      isCustom: true,
      status: c.status || 'published',
      kind: c.blueprint ? 'blueprint' : 'skin',
    }));
  const builtin = TEMPLATE_CANDIDATES.map((t) => ({ ...t, baseTemplateId: t.id, isCustom: false }));
  return [...builtin, ...custom];
}

export function findTemplateCandidate(id, customizations = []) {
  const tid = String(id || '');
  return getTemplateCandidates(customizations).find((t) => t.id === tid) || null;
}

/** ヒアリング「テンプレに当てはまらない・1から製作」（叩き台は buildHtml で navy にマップ） */
export const INTAKE_BESPOKE_TEMPLATE_ID = 'intake_bespoke';

export function isValidTemplateId(id, customizations = []) {
  const tid = String(id || '');
  if (tid === INTAKE_BESPOKE_TEMPLATE_ID) return true;
  if (TEMPLATE_IDS.has(tid)) return true;
  return !!findTemplateCandidate(tid, customizations);
}

function makeNavItems(csv) {
  const labels = String(csv || '')
    .split(/[,，\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);
  if (!labels.length) return undefined;
  return labels.map((label, i) => {
    const href = i === 0 ? '#concept' : i === 1 ? '#menu' : i === 2 ? '#access' : '#contact';
    return { label, href };
  });
}

export function applyTemplateCustomization(content, customization = {}) {
  const out = { ...content };
  if (customization.headline) out.headline = String(customization.headline).slice(0, 200);
  if (customization.subheadline) out.subheadline = String(customization.subheadline).slice(0, 400);
  const navItems = makeNavItems(customization.navLabels);
  if (navItems) out.navItems = navItems;
  return out;
}

function buildThemeCss(baseTemplateId, theme = {}) {
  const bg = String(theme.bg || '').trim();
  const text = String(theme.text || '').trim();
  const accent = String(theme.accent || '').trim();
  if (!bg && !text && !accent) return '';
  return `.page-wrapper.template-${baseTemplateId}{${bg ? `--tp-bg:${bg};` : ''}${text ? `--tp-text:${text};--tp-heading:${text};` : ''}${accent ? `--tp-accent:${accent};` : ''}}`;
}

function injectThemeCss(html, css) {
  if (!css) return html;
  return String(html).replace('</head>', `<style id="custom-template-theme">${css}</style></head>`);
}

function labelOf(id) {
  if (id === 'academy_lp') return '高CVセールスLP（レガシー）';
  return TEMPLATE_CANDIDATES.find((t) => t.id === id)?.name || id;
}

/** カスタム保存オブジェクト { override: {...} } とフラットな上書きの両方に対応 */
function resolveTemplateOverride(customization) {
  if (!customization || typeof customization !== 'object') return {};
  if (customization.override && typeof customization.override === 'object') {
    return customization.override;
  }
  return customization;
}

export function renderTemplatePreview(templateId, customization = null) {
  const cust = customization && typeof customization === 'object' ? customization : null;
  if (cust?.blueprint && typeof cust.blueprint === 'object' && cust.blueprint.version === 1) {
    const ov = resolveTemplateOverride(cust);
    return renderBlueprintHtml(cust.blueprint, { override: ov });
  }

  let id = String(templateId || '');
  if (id === INTAKE_BESPOKE_TEMPLATE_ID) id = 'navy_cyan_consult';
  if (!TEMPLATE_IDS.has(id) && !LEGACY_TEMPLATE_IDS.has(id)) return null;

  const ov = resolveTemplateOverride(customization);

  const now = new Date().getFullYear();
  const name = labelOf(id);
  let content = {
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

  content = applyTemplateCustomization(content, ov);
  let html = buildHtml(content, seo, id, {
    contactForm: true,
    formActionUrl: '#',
    instagramLine: true,
    instagramUrl: 'https://instagram.com/',
    lineUrl: 'https://line.me/',
    qrCode: true,
    qrCodeTargetUrl: 'https://example.com',
  });
  html = injectThemeCss(html, buildThemeCss(id, ov.theme));
  return html;
}
