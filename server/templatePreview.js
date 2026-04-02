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
  if (String(customization.siteName || '').trim()) {
    out.siteName = String(customization.siteName).trim().slice(0, 120);
  }
  if (String(customization.title || '').trim()) {
    out.title = String(customization.title).trim().slice(0, 200);
  }
  if (String(customization.footerText || '').trim()) {
    out.footerText = String(customization.footerText).trim().slice(0, 5000);
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
      .filter((u) => /^https?:\/\//i.test(u))
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
  const brand =
    String(content.title || content.siteName || content.headline || fallback)
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
  } else if (id === 'cafe_1') {
    content = {
      siteName: '茅堂寺（いどうじ）公式サイト',
      title: '茅堂寺（いどうじ）',
      headline: '茅堂寺（いどうじ）',
      subheadline: '',
      footerAddress: '〒120-0026 東京都足立区千住旭町40-2',
      footerPhone: '03-6806-1192',
      cafeMeo: {
        servesCuisine: 'ガッツリ系定食;どんぶり;日本料理',
        priceRange: '¥850〜¥1,200',
        openingHours: [...CAFE_1_OPENING_HOURS_JSON_LD],
        streetAddress: '千住旭町40-2',
        addressLocality: '足立区',
        addressRegion: '東京都',
        postalCode: '120-0026',
      },
      cafeFloatingMapUrl: 'https://maps.google.com/?q=東京都足立区千住旭町40-2',
      cafeReviewCtaText: 'スタッフにクチコミ画面提示で100円トッピング無料！',
      cafeReviewCtaUrl:
        'https://search.google.com/local/writereview?placeid=ChIJd8BlQ2CMGGAR3x0qf4l6P6k',
      cafeGbPostsEmbedUrl:
        'https://www.google.com/maps?q=東京都足立区千住旭町40-2&output=embed',
      faqItems: [
        {
          q: '予約はできますか？',
          a: 'お電話（03-6806-1192）にて承っております。ランチタイムの混雑時はお時間をいただく場合がございます。',
        },
        {
          q: '駐車場はありますか？',
          a: '専用駐車場はございません。近隣のコインパーキングをご利用ください。',
        },
        {
          q: '一人でも入りやすいですか？',
          a: 'はい！カウンター席を10席完備しており、東京電機大学の学生さんや会社員の方にお一人で多くご利用いただいています。',
        },
        {
          q: 'テイクアウトは可能ですか？',
          a: '全ての定食メニューでお弁当としての持ち帰りが可能です。',
        },
      ],
      cafeInstagramFeedItems: [
        { imageUrl: 'https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=900', postUrl: 'https://www.instagram.com/' },
        { imageUrl: 'https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=900', postUrl: 'https://www.instagram.com/' },
        { imageUrl: 'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg?auto=compress&cs=tinysrgb&w=900', postUrl: 'https://www.instagram.com/' },
        { imageUrl: 'https://images.pexels.com/photos/1907228/pexels-photo-1907228.jpeg?auto=compress&cs=tinysrgb&w=900', postUrl: 'https://www.instagram.com/' },
      ],
      sections: [
        {
          id: 'concept',
          title: '茅堂寺（いどうじ）',
          content:
            'つくばから発信する、ラーメンの新しいスタンダード\n\n厳選された大仙鶏の旨味と、驚きに満ちた和え玉。\n\n一杯一皿に情熱を込めて。',
        },
        {
          id: 'staff',
          title: '店主・鉄人',
          content:
            '今日も炊きたてご飯と秘伝ダレでお待ちしています。学生さん・お仕事帰りの方も、腹ペコのときは気軽にどうぞ。',
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
          content: '北千住駅東口から徒歩3分、学園通り沿い。東京電機大学から歩いてすぐ。',
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
            '今すぐ来店するなら、席状況を電話で確認→地図で3分。\nクチコミ投稿で100円トッピング無料キャンペーン実施中。',
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
      heroSlides: [
        'https://images.pexels.com/photos/1907228/pexels-photo-1907228.jpeg?auto=compress&cs=tinysrgb&w=1400',
        'https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=1400',
        'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=1400',
      ],
      cafeShopLocations: [
        {
          name: '茅堂寺（いどうじ）',
          detail: buildCafe1ShopLocationDetail('03-6806-1192', '〒120-0026 東京都足立区千住旭町40-2'),
          mapUrl: 'https://maps.google.com/?q=東京都足立区千住旭町40-2',
          imageUrl:
            'https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=900',
        },
      ],
      mapEmbedUrl:
        'https://maps.google.com/maps?q=%E6%9D%B1%E4%BA%AC%E9%83%BD%E8%B6%B3%E7%AB%8B%E5%8C%BA%E5%8D%83%E4%BD%8F%E6%97%AD%E7%94%BA40-2&output=embed',
      ctaLabel: '席を電話で確認',
      ctaHref: 'tel:0368061192',
      footerText: `つくばのラーメン｜茅堂寺（いどうじ）\n© ${now} 茅堂寺（いどうじ） | 東京都足立区千住旭町40-2 | 03-6806-1192`,
      footerInstagramUrl: 'https://www.instagram.com/',
      footerLineUrl: 'https://line.me/',
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

  content = applyTemplateCustomization(content, ov);
  let seo = buildDefaultSeoFromMergedContent(id, name, content);
  seo = applySeoCustomization(seo, ov);
  if (options && options.returnResolvedData) {
    return { id, content, seo };
  }
  let html = buildHtml(content, seo, id, {
    contactForm: id === 'cafe_1' ? false : true,
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
