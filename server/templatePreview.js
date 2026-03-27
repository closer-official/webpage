import { buildHtml } from './buildHtml.js';
import { renderBlueprintHtml } from './renderBlueprintHtml.js';
import { BUILTIN_BUILD_HTML_TEMPLATES } from './templateRegistry.js';

/** 運営「⓪ デザイン」等。ビルトイン定義の正は templateRegistry.js（旧IDの描画は server/buildHtml.js に残る） */
export const TEMPLATE_CANDIDATES = [...BUILTIN_BUILD_HTML_TEMPLATES];

const TEMPLATE_IDS = new Set(TEMPLATE_CANDIDATES.map((t) => t.id));

/** 旧ビルトイン。一覧には出さないが buildHtml・過去データの検証用 */
const LEGACY_TEMPLATE_IDS = new Set(['academy_lp', 'gym_yoga', 'studio_blush_editorial']);

/**
 * ギャラリー・ヒアリング・運営カタログの一覧から除外する ID。
 * baseTemplateId がここに含まれるカスタムも除外（プレビュー直 URL は findTemplateCandidate で可）。
 */
export const EXCLUDED_FROM_TEMPLATE_CATALOG_IDS = new Set(['studio_blush_editorial']);

/**
 * @param {unknown[]} customizations
 * @param {{ forPublicSelection?: boolean, galleryDraftBuiltinIds?: Set<string>, includeCatalogExcluded?: boolean }} [options]
 *   forPublicSelection=true … カスタムの draft 非表示 + galleryDraftBuiltinIds に含まれるビルトインを非表示（公開ギャラリー・ヒアリング）
 *   includeCatalogExcluded=true … EXCLUDED_FROM_TEMPLATE_CATALOG_IDS を一覧に含める（findTemplateCandidate・プレビュー解決用）
 */
export function getTemplateCandidates(customizations = [], options = {}) {
  const forPublic = options.forPublicSelection !== false;
  const includeCatalogExcluded = options.includeCatalogExcluded === true;
  const galleryDraftSet =
    options.galleryDraftBuiltinIds instanceof Set ? options.galleryDraftBuiltinIds : null;
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
  let builtin = TEMPLATE_CANDIDATES.map((t) => ({ ...t, baseTemplateId: t.id, isCustom: false }));
  if (forPublic && galleryDraftSet && galleryDraftSet.size > 0) {
    builtin = builtin.filter((t) => !galleryDraftSet.has(t.id));
  }
  const merged = [...builtin, ...custom];
  if (includeCatalogExcluded) return merged;
  return merged.filter((c) => {
    if (EXCLUDED_FROM_TEMPLATE_CATALOG_IDS.has(c.id)) return false;
    const base = c.baseTemplateId || '';
    if (base && EXCLUDED_FROM_TEMPLATE_CATALOG_IDS.has(base)) return false;
    return true;
  });
}

export function findTemplateCandidate(id, customizations = []) {
  const tid = String(id || '');
  return (
    getTemplateCandidates(customizations, { forPublicSelection: false, includeCatalogExcluded: true }).find(
      (t) => t.id === tid,
    ) || null
  );
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
  if (id === 'gym_yoga') return 'ジム・フィットネスLP（レガシー・gym_yoga）';
  if (id === 'studio_blush_editorial') return 'ブラッシュ・創作スタジオ（レガシー・ギャラリー非掲載）';
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
  let content;
  if (id === 'wiki_ensyuritsu') {
    content = {
      siteName: '円室律 ENSYRITSU',
      title: '円室律 ENSYRITSU | オリジナル・ナレッジ',
      headline: '私人のための、静かなクローズドWiki。',
      subheadline:
        '見た目の本体は templates/workspaces/wiki-ensyuritsu/embed/index.html です（wiki-ensyuritsu・完全オリジナルブランドのデモ）。',
      sections: [
        {
          id: 'concept',
          title: 'このテンプレについて',
          content: 'buildHtml はワークスペースの固定 HTML を埋め込みます。文言・配色は embed を編集してください。',
        },
        { id: 'menu', title: 'トピック', content: 'カードと帯のリズムで、長文サイトの下準備に使えます。' },
        { id: 'hours', title: 'メタ情報', content: 'このブロックは API メタ用です。プレビュー画面は embed が優先されます。' },
        { id: 'access', title: '置き場', content: 'templates/workspaces/wiki-ensyuritsu/' },
        { id: 'contact', title: 'お問い合わせ', content: 'フォーム連携は本番実装時に接続してください。' },
      ],
      ctaLabel: '設計を見る',
      ctaHref: '#top',
      footerText: `© ${now} 円室律 ENSYRITSU（サンプル）`,
      heroSlides: [
        'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1400',
      ],
    };
  } else if (id === 'wiki_sauna') {
    content = {
      siteName: '湯環 TOWAN',
      title: '湯環 TOWAN | wiki-sauna',
      headline: 'サウナの知識を、ひとつの輪に。',
      subheadline:
        '本体は templates/workspaces/wiki-sauna/embed/index.html（wiki-sauna・湯環デモ）。施設運用向け Wiki レイアウトです。',
      sections: [
        {
          id: 'concept',
          title: 'このテンプレについて',
          content: '固定 HTML 埋め込み。ロウリュ手順・点検ログなどをカードで並べる想定です。',
        },
        { id: 'menu', title: 'トピック', content: 'GUIDE / OPS / WIKI の3カード構成（embed 内）。' },
        { id: 'hours', title: 'メタ', content: 'API メタ用。表示は embed が優先されます。' },
        { id: 'access', title: '置き場', content: 'templates/workspaces/wiki-sauna/' },
        { id: 'contact', title: 'お問い合わせ', content: '本番ではフォーム・予約を接続してください。' },
      ],
      ctaLabel: '記事一覧へ',
      ctaHref: '#topics',
      footerText: `© ${now} 湯環 TOWAN（サンプル）`,
      heroSlides: [
        'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1400',
      ],
    };
  } else {
    content = {
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
  }
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
