import {
  CAFE_1_DEFAULT_HERO_SLIDES,
  CAFE_1_RAMEN_HERO_SLIDES,
  normalizeCafeVisualGenreId,
} from './cafe1GenrePresets.js';
import {
  buildCafe1ShopLocationDetail,
  CAFE_1_HOURS_SECTION_CONTENT,
  CAFE_1_OPENING_HOURS_JSON_LD,
} from './cafe1HoursPreset.js';
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
 *   forPublicSelection=true … カスタムの status=draft のみ非表示。ビルトインは常に一覧に含める（プレビュー直URL・ヒアリングで隠れないようにする）。
 *   galleryDraftBuiltinIds … 互換のため受け取るが、ビルトイン一覧からは除外しない（下書き表示は /api/admin/template-catalog の galleryDraft のみ）。
 *   includeCatalogExcluded=true … EXCLUDED_FROM_TEMPLATE_CATALOG_IDS を一覧に含める（findTemplateCandidate・プレビュー解決用）
 */
export function getTemplateCandidates(customizations = [], options = {}) {
  const forPublic = options.forPublicSelection !== false;
  const includeCatalogExcluded = options.includeCatalogExcluded === true;
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

function isAllowedHeroSlideUrl(u) {
  const s = String(u || '').trim();
  if (!s) return false;
  if (/^https?:\/\//i.test(s)) return true;
  if (s.startsWith('/') && !s.includes('..')) return true;
  return false;
}

/** override に footerText が無いとき、店名・住所・電話から © 行を組み立てる（Gemini 等で本文だけ取り込んだ場合の表示用） */
function syntheticFooterCopyrightFromBasics(siteName, footerAddress, footerPhone) {
  const sn = String(siteName || '').trim();
  const fa = String(footerAddress || '').trim();
  const fp = String(footerPhone || '').trim();
  if (!sn && !fa && !fp) return '';
  const y = new Date().getFullYear();
  return ['© ' + y, sn, fa, fp].filter(Boolean).join(' | ').slice(0, 5000);
}

export function applyTemplateCustomization(content, customization = {}) {
  const out = { ...content };
  const explicitFooterText = String(customization.footerText || '').trim();
  if (customization.headline) out.headline = String(customization.headline).slice(0, 200);
  if (customization.subheadline) out.subheadline = String(customization.subheadline).slice(0, 400);
  const navItems = makeNavItems(customization.navLabels);
  if (navItems) out.navItems = navItems;
  if (String(customization.siteName || '').trim()) {
    out.siteName = String(customization.siteName).trim().slice(0, 120);
  }
  if (String(customization.title || '').trim()) {
    out.title = String(customization.title).trim().slice(0, 200);
  }
  if (explicitFooterText) {
    out.footerText = explicitFooterText.slice(0, 5000);
  }
  if (String(customization.ctaLabel || '').trim()) {
    out.ctaLabel = String(customization.ctaLabel).trim().slice(0, 80);
  }
  if (String(customization.ctaHref || '').trim()) {
    out.ctaHref = String(customization.ctaHref).trim().slice(0, 500);
  }
  if (Array.isArray(customization.heroSlides)) {
    out.heroSlides = customization.heroSlides
      .map((u) => String(u || '').trim())
      .filter((u) => isAllowedHeroSlideUrl(u))
      .slice(0, 10);
  }
  if (Array.isArray(customization.heroSlideStyles)) {
    out.heroSlideStyles = customization.heroSlideStyles.slice(0, 10);
  }
  if (Array.isArray(customization.sections) && customization.sections.length > 0) {
    out.sections = customization.sections.slice(0, 15);
  }

  const ft = String(customization.footerAddress || '').trim().slice(0, 300);
  if (ft) out.footerAddress = ft;
  const fp = String(customization.footerPhone || '').trim().slice(0, 40);
  if (fp) out.footerPhone = fp;
  const fig = String(customization.footerInstagramUrl || '').trim().slice(0, 2000);
  if (fig && /^https?:\/\//i.test(fig)) out.footerInstagramUrl = fig;
  const fln = String(customization.footerLineUrl || '').trim().slice(0, 2000);
  if (fln && /^https?:\/\//i.test(fln)) out.footerLineUrl = fln;
  const ftw = String(customization.footerTwitterUrl || '').trim().slice(0, 2000);
  if (ftw && /^https?:\/\//i.test(ftw)) out.footerTwitterUrl = ftw;
  const mem = String(customization.mapEmbedUrl || '').trim().slice(0, 2000);
  if (mem && /^https?:\/\//i.test(mem)) out.mapEmbedUrl = mem;
  const cfl = String(customization.cafeFloatingMapUrl || '').trim().slice(0, 2000);
  if (cfl && /^https?:\/\//i.test(cfl)) out.cafeFloatingMapUrl = cfl;
  const cip = String(customization.cafeInstagramPermalink || '').trim().slice(0, 2000);
  if (cip && /^https?:\/\//i.test(cip)) out.cafeInstagramPermalink = cip;
  const crt = String(customization.cafeReviewCtaText || '').trim().slice(0, 200);
  if (crt) out.cafeReviewCtaText = crt;
  const cru = String(customization.cafeReviewCtaUrl || '').trim().slice(0, 2000);
  if (cru && /^https?:\/\//i.test(cru)) out.cafeReviewCtaUrl = cru;
  const cgb = String(customization.cafeGbPostsEmbedUrl || '').trim().slice(0, 2000);
  if (cgb && /^https?:\/\//i.test(cgb)) out.cafeGbPostsEmbedUrl = cgb;

  if (Array.isArray(customization.faqItems) && customization.faqItems.length > 0) {
    out.faqItems = customization.faqItems;
  }
  if (Array.isArray(customization.cafeMenuTextRows) && customization.cafeMenuTextRows.length > 0) {
    out.cafeMenuTextRows = customization.cafeMenuTextRows;
  }
  if (Array.isArray(customization.cafeShopLocations) && customization.cafeShopLocations.length > 0) {
    out.cafeShopLocations = customization.cafeShopLocations;
  }
  if (Array.isArray(customization.cafeInstagramFeedItems) && customization.cafeInstagramFeedItems.length > 0) {
    out.cafeInstagramFeedItems = customization.cafeInstagramFeedItems;
  }
  if (Array.isArray(customization.cafeBranchMenuItems) && customization.cafeBranchMenuItems.length > 0) {
    out.cafeBranchMenuItems = customization.cafeBranchMenuItems;
  }
  if (customization.cafeMeo && typeof customization.cafeMeo === 'object') {
    out.cafeMeo = { ...(out.cafeMeo || {}), ...customization.cafeMeo };
  }

  const genreId = normalizeCafeVisualGenreId(customization.cafeVisualGenre);
  if (genreId) out.cafeVisualGenre = genreId;

  if (!explicitFooterText) {
    const contributed =
      String(customization.siteName || '').trim() ||
      String(customization.footerAddress || '').trim() ||
      String(customization.footerPhone || '').trim();
    if (contributed) {
      const syn = syntheticFooterCopyrightFromBasics(out.siteName, out.footerAddress, out.footerPhone);
      if (syn) out.footerText = syn;
    }
  }

  return out;
}

/** override の SEO 系フィールドを既定 seo に上書き（空は無視） */
export function applySeoCustomization(seo, customization = {}) {
  const out = { ...seo };
  if (String(customization.metaTitle || '').trim()) {
    out.metaTitle = String(customization.metaTitle).trim().slice(0, 120);
  }
  if (String(customization.metaDescription || '').trim()) {
    out.metaDescription = String(customization.metaDescription).trim().slice(0, 320);
  }
  if (String(customization.ogImageUrl || '').trim()) {
    out.ogImageUrl = String(customization.ogImageUrl).trim().slice(0, 2000);
  }
  if (String(customization.canonicalUrl || '').trim()) {
    out.canonicalUrl = String(customization.canonicalUrl).trim().slice(0, 2000);
  }
  if (String(customization.keywords || '').trim()) {
    out.keywords = String(customization.keywords).trim().slice(0, 500);
  }
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

/**
 * カスタム適用後の content から検索用メタの下書きを作る（作業者が SEO 用語を知らなくても店名・キャッチから成立する値）。
 */
function buildDefaultSeoFromMergedContent(id, templateLabelName, content) {
  const fallback = String(templateLabelName || 'サイト').trim() || 'サイト';
  if (!content || typeof content !== 'object') {
    return {
      metaTitle: `${fallback}`.slice(0, 120),
      metaDescription: `${fallback}のご案内ページです。`.slice(0, 320),
      keywords: fallback.slice(0, 500),
      ogImageUrl: '',
      canonicalUrl: '',
    };
  }
  /** siteName / headline を title より優先（cafe_1 既定の title が道玄坂のまま残り OGP が固定化するのを防ぐ） */
  const brand =
    String(content.siteName || content.headline || content.title || fallback)
      .trim()
      .replace(/\s+/g, ' ') || fallback;
  const sub = String(content.subheadline || '')
    .trim()
    .replace(/\s+/g, ' ');
  const head = String(content.headline || '')
    .trim()
    .replace(/\s+/g, ' ');
  const addr = String(content.footerAddress || '')
    .trim()
    .replace(/\n/g, ' ');

  let locality = '';
  if (content.cafeMeo && typeof content.cafeMeo === 'object') {
    const m = content.cafeMeo;
    locality = [m.addressRegion, m.addressLocality].filter(Boolean).join('');
  }

  let metaTitle = brand;
  if (locality && id === 'cafe_1') metaTitle = `${brand}｜${locality}`;
  metaTitle = metaTitle.slice(0, 120);

  const descParts = [];
  if (sub) descParts.push(sub);
  else if (head && head !== brand) descParts.push(head);
  if (addr) descParts.push(addr.slice(0, 140));
  let metaDescription = descParts.join('。').trim();
  if (!metaDescription) metaDescription = `${brand}のご案内・お店の情報ページです。`;
  metaDescription = metaDescription.slice(0, 320);

  const kwParts = [brand];
  if (locality) kwParts.push(locality);
  if (content.cafeMeo && typeof content.cafeMeo === 'object' && content.cafeMeo.servesCuisine) {
    const parts = String(content.cafeMeo.servesCuisine)
      .split(/[;；,，、]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 8);
    kwParts.push(...parts);
  }
  if (id === 'cafe_1') kwParts.push('お店');

  let ogImageUrl = '';
  if (Array.isArray(content.heroSlides) && content.heroSlides.length) {
    const u = String(content.heroSlides[0] || '').trim();
    if (/^https?:\/\//i.test(u)) ogImageUrl = u;
  }

  return {
    metaTitle,
    metaDescription,
    keywords: kwParts.filter(Boolean).join(',').slice(0, 500),
    ogImageUrl,
    canonicalUrl: '',
  };
}

export function renderTemplatePreview(templateId, customization = null, options = {}) {
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
      subheadline: '記事とナレッジを、落ち着いたレイアウトでまとめられます。',
      sections: [
        {
          id: 'concept',
          title: 'ご利用について',
          content: '非公開のナレッジ共有に向いた構成です。トピックごとに読みやすく整理できます。',
        },
        { id: 'menu', title: 'トピック', content: 'ガイド・運用・資料など、カード形式で一覧できます。' },
        { id: 'hours', title: '更新情報', content: '最新のお知らせや改訂履歴をここに掲載できます。' },
        { id: 'access', title: 'アクセス', content: 'ご利用環境や接続方法の案内を記載できます。' },
        { id: 'contact', title: 'お問い合わせ', content: 'ご質問はお手数ですが、ご案内の連絡先までお願いいたします。' },
      ],
      ctaLabel: '設計を見る',
      ctaHref: '#top',
      footerText: `© ${now} 円室律 ENSYRITSU`,
      heroSlides: [
        'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1400',
      ],
    };
  } else if (id === 'wiki_sauna') {
    content = {
      siteName: '湯環 TOWAN',
      title: '湯環 TOWAN | wiki-sauna',
      headline: 'サウナの知識を、ひとつの輪に。',
      subheadline: '施設運用や会員向けに、ガイドと記事を整理して掲載できます。',
      sections: [
        {
          id: 'concept',
          title: 'ご利用について',
          content: 'ロウリュ手順や設備の案内、会員規約などを分かりやすくまとめられます。',
        },
        { id: 'menu', title: 'トピック', content: 'ガイド・運用・Wiki など、目的別に記事を配置できます。' },
        { id: 'hours', title: '更新情報', content: '営業案内やメンテナンス情報をここに掲載できます。' },
        { id: 'access', title: 'アクセス', content: '所在地・駐車場・最寄り駅などを記載できます。' },
        { id: 'contact', title: 'お問い合わせ', content: 'ご予約・お問い合わせは、各ページの案内に従ってください。' },
      ],
      ctaLabel: '記事一覧へ',
      ctaHref: '#topics',
      footerText: `© ${now} 湯環 TOWAN`,
      heroSlides: [
        'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1400',
      ],
    };
  } else if (id === 'cafe_1') {
    content = {
      siteName: '道玄坂食堂',
      title: '道玄坂食堂',
      headline: '熱々の定食で、今日も元気に。',
      subheadline:
        'にんにく効いたスタミナ系から、あっさり焼き魚まで。仕事帰りの一杯にぴったりの味わいです。※掲載写真の一部はイメージです。',
      footerAddress: '〒150-0043 東京都渋谷区道玄坂1-2-3',
      footerPhone: '03-0000-0000',
      cafeMeo: {
        servesCuisine: '定食;ラーメン;飲食店',
        priceRange: '¥800〜¥1,200',
        openingHours: [...CAFE_1_OPENING_HOURS_JSON_LD],
        streetAddress: '道玄坂1-2-3',
        addressLocality: '渋谷区',
        addressRegion: '東京都',
        postalCode: '150-0043',
      },
      cafeFloatingMapUrl: 'https://maps.google.com/?q=東京都渋谷区道玄坂',
      cafeReviewCtaText: 'Googleのクチコミはこちら',
      cafeReviewCtaUrl: 'https://www.google.com/maps',
      cafeGbPostsEmbedUrl:
        'https://www.google.com/maps?q=%E6%9D%B1%E4%BA%AC%E9%83%BD%E6%B8%8B%E8%B0%B7%E5%8C%BA%E9%81%93%E7%8E%84%E5%9D%82&output=embed',
      faqItems: [
        {
          q: '予約はできますか？',
          a: 'お電話（03-0000-0000）にてご相談ください。混雑時はお時間をいただく場合がございます。',
        },
        {
          q: '駐車場はありますか？',
          a: '専用駐車場がない場合は、近隣のコインパーキングをご利用ください。',
        },
        {
          q: '一人でも入りやすいですか？',
          a: 'はい。カウンター席もございます。お一人でもお気軽にどうぞ。',
        },
        {
          q: 'テイクアウトは可能ですか？',
          a: 'メニューによって異なります。お電話または店頭でお問い合わせください。',
        },
      ],
      cafeInstagramFeedItems: [
        { imageUrl: '/cafe-1/ig-marquee/1.png', postUrl: 'https://www.instagram.com/' },
        { imageUrl: '/cafe-1/ig-marquee/2.png', postUrl: 'https://www.instagram.com/' },
        { imageUrl: '/cafe-1/ig-marquee/3.png', postUrl: 'https://www.instagram.com/' },
      ],
      sections: [
        {
          id: 'concept',
          title: 'コンセプト',
          content:
            '毎日の仕込みから一品一品にこだわり、腹が満たされる「ごはん屋」でありたいと考えています。\n\n仕事や学びのあと、気軽に立ち寄れる価格と味付けを心がけています。',
        },
        {
          id: 'staff',
          title: '店主・スタッフ',
          content:
            '今日のおすすめや仕入れの話など、気軽にお声がけください。お一人様も、ご家族連れも、どうぞゆっくりお過ごしください。',
          imageUrl:
            'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=1200',
        },
        {
          id: 'menu',
          title: 'お品書き（全15品・税込）',
          content: '全15品・税込。',
        },
        {
          id: 'access',
          title: '店舗・地図',
          content: 'JR渋谷駅より徒歩圏内。道玄坂を上がり、赤い看板が目印です。下の地図で位置をご確認ください。',
        },
        {
          id: 'hours',
          title: '営業時間',
          content: CAFE_1_HOURS_SECTION_CONTENT,
        },
        {
          id: 'faq',
          title: 'よくあるご質問（Q&A）',
          content: '',
        },
        {
          id: 'shop',
          title: '店舗詳細情報',
          content:
            '店内は全席禁煙です。喫煙は店外の指定スペースをご利用ください。お子さま連れの方も安心してお食事いただけます。\n\n【お支払い方法】\n現金 / クレジットカード（Visa, Master, JCB, Amex） / PayPay / 交通系ICカード\n\n【設備・サービス】\n総席数：25席（カウンター10席、テーブル15席） / 無料Wi-Fiあり / コンセント利用可（一部席）',
        },
        {
          id: 'contact',
          title: 'お問い合わせ',
          content:
            'ご来店前に席の空き状況をお電話でご確認いただくとスムーズです。キャンペーンや新メニューはSNSでもお知らせしています。',
        },
      ],
      cafeMenuTextRows: [
        { groupLabel: 'お食事（定食・どんぶり）', name: '名物！鉄人スタミナ豚炒め定食', price: '¥980', description: 'ニンニクの効いた秘伝タレでご飯が止まらない。', badge: '店主イチオシ' },
        { groupLabel: 'お食事（定食・どんぶり）', name: '厚切りサクサク！とんかつ定食', price: '¥1,100', description: '200gのロース肉を贅沢に使用した一番人気。', badge: '人気No.1' },
        { groupLabel: 'お食事（定食・どんぶり）', name: '自家製タルタルのチキン南蛮定食', price: '¥950', description: '卵たっぷりの濃厚タルタルをたっぷり。' },
        { groupLabel: 'お食事（定食・どんぶり）', name: 'とろとろ親子丼（大盛り無料）', price: '¥850', description: '出汁が決め手のふわとろ食感。' },
        { groupLabel: 'お食事（定食・どんぶり）', name: 'ピリ辛麻婆豆腐定食', price: '¥900', description: '山椒が香る、本格派の痺れる旨さ。' },
        { groupLabel: 'お食事（定食・どんぶり）', name: '黄金比の生姜焼き定食', price: '¥920', description: '生生姜の香りが際立つ、家庭では出せない味。' },
        { groupLabel: 'お食事（定食・どんぶり）', name: '肉厚ホッケの塩焼き定食', price: '¥1,050', description: '豊洲直送。脂の乗った大ぶりなホッケ。' },
        { groupLabel: 'お食事（定食・どんぶり）', name: '鉄人特製 カツカレー', price: '¥1,150', description: '3日間煮込んだスパイシーな濃厚ルー。', badge: '満腹保証' },
        { groupLabel: 'お食事（定食・どんぶり）', name: '野菜たっぷり野菜炒め定食', price: '¥880', description: 'シャキシャキ野菜が400g。ヘルシーかつ満腹。' },
        { groupLabel: 'お食事（定食・どんぶり）', name: '日替わり「今日のガッツリ」定食', price: '¥900', description: '店主の気まぐれ。毎日来ても飽きない一皿。' },
        { groupLabel: 'ドリンク', name: 'キンキンに冷えた生ビール（中）', price: '¥550', description: '' },
        { groupLabel: 'ドリンク', name: '強炭酸！レモンサワー', price: '¥450', description: '' },
        { groupLabel: 'ドリンク', name: 'こだわり酒場のハイボール', price: '¥480', description: '' },
        { groupLabel: 'ドリンク', name: '濃厚 黒ウーロン茶', price: '¥300', description: '' },
        { groupLabel: 'ドリンク', name: 'キンキンの瓶コーラ', price: '¥250', description: '' },
      ],
      heroSlides: [...CAFE_1_DEFAULT_HERO_SLIDES],
      cafeShopLocations: [
        {
          name: '道玄坂食堂',
          detail: buildCafe1ShopLocationDetail('03-0000-0000', '〒150-0043 東京都渋谷区道玄坂1-2-3'),
          mapUrl: 'https://maps.google.com/?q=東京都渋谷区道玄坂',
          imageUrl:
            'https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=900',
        },
      ],
      mapEmbedUrl:
        'https://maps.google.com/maps?q=%E6%9D%B1%E4%BA%AC%E9%83%BD%E6%B8%8B%E8%B0%B7%E5%8C%BA%E9%81%93%E7%8E%84%E5%9D%82&output=embed',
      ctaLabel: 'お電話はこちら',
      ctaHref: 'tel:0300000000',
      footerText: `© ${now} 道玄坂食堂 | 東京都渋谷区道玄坂1-2-3 | 03-0000-0000`,
      footerInstagramUrl: 'https://www.instagram.com/',
      footerLineUrl: 'https://line.me/',
    };
  } else if (id === 'ramen_2') {
    content = {
      siteName: '麺処 あさひ',
      title: '麺処 あさひ',
      headline: '毎日通いたくなる、一杯。',
      subheadline: '鶏ガラと豚骨を長時間煮込んだ清湯スープ。毎朝仕込む自家製麺で、ほっとする時間をどうぞ。',
      ctaLabel: 'メニューを見る',
      ctaHref: '#menu',
      ramen2Hours: '11:00〜15:00 / 18:00〜22:00（L.O. 21:30）',
      ramen2Closed: '毎週火曜日',
      ramen2Station: '〇〇駅 北口 徒歩3分',
      mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3241.747975468381!2d139.7027863152582!3d35.659545280197!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188b5653d2f8a1%3A0x3f62daad6c2a5342!2z5p2x5Lqs6aeF!5e0!3m2!1sja!2sjp!4v1234567890',
      catalogImages: [
        'https://images.pexels.com/photos/8969237/pexels-photo-8969237.jpeg?auto=compress&cs=tinysrgb&w=600',
        'https://images.pexels.com/photos/6249499/pexels-photo-6249499.jpeg?auto=compress&cs=tinysrgb&w=600',
        'https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg?auto=compress&cs=tinysrgb&w=600',
        'https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=600',
        'https://images.pexels.com/photos/1907228/pexels-photo-1907228.jpeg?auto=compress&cs=tinysrgb&w=600',
        'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=600',
      ],
      priceRows: [
        { name: '醤油らーめん', price: '¥900' },
        { name: '塩らーめん', price: '¥900' },
        { name: 'つけ麺（並）', price: '¥980' },
        { name: '味噌らーめん', price: '¥950' },
        { name: '辛味噌らーめん', price: '¥1,000' },
        { name: '替え玉', price: '¥150' },
      ],
      sections: [
        {
          id: 'menu',
          title: 'メニュー',
          content: '人気の定番から季節限定まで、丁寧に仕込んだ一杯をご用意しています。替え玉・トッピングもどうぞ。',
        },
        {
          id: 'concept',
          title: 'こだわり',
          content:
            '鶏ガラと豚骨を長時間煮込んだ清湯スープ。毎朝仕込む自家製麺。素材の味を活かした丁寧な一杯です。\n\n添加物は一切使用せず、毎日作り置きなしで提供しています。スープが無くなり次第終了となりますので、お早めにどうぞ。',
          imageUrl: 'https://images.pexels.com/photos/8969237/pexels-photo-8969237.jpeg?auto=compress&cs=tinysrgb&w=800',
        },
        {
          id: 'access',
          title: '営業情報・アクセス',
          content: '東京都〇〇区〇〇 1-2-3\n〇〇駅 北口 徒歩3分\n\n営業時間：11:00〜15:00 / 18:00〜22:00（L.O. 21:30）\n定休日：毎週火曜日\n\nお支払い：現金・各種クレジットカード・PayPay',
        },
      ],
      footerInstagramUrl: 'https://www.instagram.com/',
      footerTwitterUrl: 'https://x.com/',
      footerTiktokUrl: 'https://www.tiktok.com/',
      footerText: `© ${now} 麺処 あさひ`,
      footerAddress: '東京都〇〇区〇〇 1-2-3',
      footerPhone: '03-XXXX-XXXX',
    };
  } else if (id === 'beauty_salon_mellow') {
    content = {
      siteName: 'mellow by luce',
      title: 'OMOTESANDO HAIR SALON',
      headline: 'やわらかく、上品に。\n毎日に自然と\nなじむ髪へ。',
      subheadline:
        'ショート・ボブ・ミディアムを中心に、\n扱いやすさとやわらかな質感を大切にした\nプライベート感のあるヘアサロン',
      footerAddress: '〒150-0001 東京都渋谷区神宮前3-18-7',
      footerPhone: '03-0000-1842',
      mapEmbedUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3241.747975468381!2d139.7027863152582!3d35.659545280197!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188b5653d2f8a1%3A0x3f62daad6c2a5342!2z5p2x5Lqs6aeF!5e0!3m2!1sja!2sjp!4v1234567890',
      footerInstagramUrl: 'https://www.instagram.com/',
      footerTwitterUrl: 'https://x.com/',
      footerTiktokUrl: 'https://www.tiktok.com/',
      footerText: `© ${now} mellow by luce | 表参道のヘアサロン`,
      heroSlides: [
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1400&q=80',
      ],
      faqItems: [
        { q: '初めてでも大丈夫ですか？', a: 'はい。カウンセリングでご希望を伺いながらご提案します。' },
        { q: '予約は必要ですか？', a: 'WEBまたはお電話にてご予約をお願いしております。' },
      ],
      sections: [
        { id: 'concept', title: 'コンセプト', content: 'やわらかな質感と扱いやすさを大切にしたご提案です。' },
        { id: 'menu', title: 'メニュー', content: 'カット・カラー・パーマ・トリートメントなどをご用意しています。' },
        { id: 'access', title: 'アクセス', content: '表参道駅より徒歩圏内です。' },
      ],
      ctaLabel: 'WEB予約',
      ctaHref: '#reserve',
    };
  } else {
    content = {
      siteName: name,
      title: name,
      headline: name,
      subheadline: 'サービス内容のご案内です。詳細はお問い合わせください。',
      sections: [
        { id: 'concept', title: 'コンセプト', content: '事業内容や想い、強みが伝わる文章をご用意しています。' },
        { id: 'menu', title: 'サービス', content: '提供内容の概要を分かりやすく掲載できます。' },
        { id: 'hours', title: '営業時間', content: '平日 10:00-19:00 / 土日祝 9:00-18:00' },
        { id: 'access', title: 'アクセス', content: '東京都〇〇区〇〇 1-2-3' },
        { id: 'contact', title: 'お問い合わせ', content: 'お問い合わせはフォームまたはSNSからご連絡ください。' },
      ],
      ctaLabel: 'お問い合わせ',
      ctaHref: '#contact',
      footerText: `© ${now} ${name}`,
      heroSlides: ['https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400'],
    };
  }

  content = applyTemplateCustomization(content, ov);
  if (id === 'cafe_1' && normalizeCafeVisualGenreId(content.cafeVisualGenre || ov.cafeVisualGenre) === 'ramen') {
    content.heroSlides = [...CAFE_1_RAMEN_HERO_SLIDES];
    content.heroSlideStyles = [];
  }
  let seo = buildDefaultSeoFromMergedContent(id, name, content);
  if (options && options.previewSocialFromContent) {
    const snapTitle = seo.metaTitle;
    const snapDesc = seo.metaDescription;
    seo = applySeoCustomization(seo, ov);
    seo.metaTitle = snapTitle;
    seo.metaDescription = snapDesc;
  } else {
    seo = applySeoCustomization(seo, ov);
  }
  if (options && options.previewCanonicalUrl) {
    seo.canonicalUrl = options.previewCanonicalUrl;
  }
  const previewOrigin = options && options.previewAbsoluteOrigin ? String(options.previewAbsoluteOrigin).replace(/\/$/, '') : '';
  if (previewOrigin) {
    if (seo.ogImageUrl && seo.ogImageUrl.startsWith('/')) {
      seo.ogImageUrl = previewOrigin + seo.ogImageUrl;
    }
    if (!seo.ogImageUrl && Array.isArray(content.heroSlides) && content.heroSlides.length) {
      const u = String(content.heroSlides[0] || '').trim();
      if (u.startsWith('/')) seo.ogImageUrl = previewOrigin + u;
    }
  }
  if (options && options.returnResolvedData) {
    return { id, content, seo };
  }
  let html = buildHtml(content, seo, id, {
    contactForm: id === 'cafe_1' || id === 'beauty_salon_mellow' ? false : true,
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
