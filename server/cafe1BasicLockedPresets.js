/**
 * cafe_1「基本情報のみ」編集モード用：メニュー・写真・本文コンセプト等はジャンル別に固定し、
 * 店名・住所・電話・地図・SNS だけ差し替える。
 */
import {
  CAFE_1_DEFAULT_HERO_SLIDES,
  CAFE_1_RAMEN_HERO_SLIDES,
  normalizeCafeVisualGenreId,
} from './cafe1GenrePresets.js';
import {
  CAFE_1_OPENING_HOURS_JSON_LD,
  CAFE_1_HOURS_SECTION_CONTENT,
  buildCafe1ShopLocationDetail,
} from './cafe1HoursPreset.js';

const PLACEHOLDER_MAP =
  'https://www.google.com/maps?q=%E6%9D%B1%E4%BA%AC%E9%83%BD%E6%B8%8B%E8%B0%B7%E5%8C%BA&output=embed';

const IG = 'https://www.instagram.com/';

/** 編集画面のジャンルID → 固定プリセット種別 */
export function mapGenreToBasicPresetKind(genreId) {
  const id = normalizeCafeVisualGenreId(genreId);
  if (id === 'ramen') return 'ramen';
  if (id === 'cafe_coffee' || id === 'kissaten') return 'cafe';
  return 'default';
}

function faqGeneric() {
  return [
    { q: '予約はできますか？', a: 'お電話にてお問い合わせください。混雑状況によりお断りする場合がございます。' },
    { q: 'クレジットカードは使えますか？', a: 'お支払い方法は店舗にお問い合わせください。' },
    { q: '駐車場はありますか？', a: '専用駐車場がない場合は、近隣のコインパーキングをご利用ください。' },
    { q: '一人でも入りやすいですか？', a: 'はい。お一人様でもお気軽にどうぞ。' },
  ];
}

function instagramGrid(urls) {
  return urls.map((imageUrl) => ({ imageUrl, postUrl: IG }));
}

function shopCard(name, phone, address, mapUrl, imageUrl) {
  return [
    {
      name,
      detail: buildCafe1ShopLocationDetail(phone, address),
      mapUrl,
      imageUrl,
    },
  ];
}

function ramenOverride() {
  return {
    cafeVisualGenre: 'ramen',
    headline: '一杯の満足を、気軽な価格で。（ラーメン向け固定サンプル）',
    subheadline:
      'スープと麺にこだわった一杯をご提供します。※掲載の写真は著作権の観点から、実店舗の写真ではなくフリー素材を使用しています。',
    heroSlides: [...CAFE_1_RAMEN_HERO_SLIDES],
    heroSlideStyles: [],
    footerLineUrl: '',
    cafeReviewCtaText: '',
    cafeReviewCtaUrl: '',
    faqItems: faqGeneric(),
    cafeInstagramFeedItems: instagramGrid([
      'https://images.pexels.com/photos/1907228/pexels-photo-1907228.jpeg?auto=compress&cs=tinysrgb&w=900',
      'https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=900',
      'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=900',
      'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg?auto=compress&cs=tinysrgb&w=900',
    ]),
    sections: [
      {
        id: 'concept',
        title: 'ラーメンのこだわり',
        content:
          'スープは毎日店内で仕込み、麺は茹で加減までこだわりました。一杯ごとに温度とタイミングを調整し、ラーメン好きの方にも満足いただける一杯を目指しています。\n\n※本文はジャンル別の固定サンプルです。実店舗の内容とは異なる場合があります。',
        imageUrl:
          'https://images.pexels.com/photos/1907228/pexels-photo-1907228.jpeg?auto=compress&cs=tinysrgb&w=1200',
      },
      {
        id: 'staff',
        title: '店主より',
        content:
          '「今日も美味しい一杯を」— その想いだけは変わりません。常連の方も、初めての方も、気軽に声をかけてください。（固定サンプル文）',
        imageUrl:
          'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=1200',
      },
      {
        id: 'gallery',
        title: '料理・店内の雰囲気',
        content: '湯気・スープの色・トッピングのバランスを意識したイメージです。（フリー素材）',
        imageUrl:
          'https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=1200',
      },
      {
        id: 'menu',
        title: 'お品書き（テキスト・サンプル）',
        content: '価格・メニュー名はサンプルです。実店舗のメニューに合わせてフル編集画面から差し替えてください。',
      },
      {
        id: 'access',
        title: '店舗・地図',
        content:
          '下記の地図は「Googleマップの埋め込みURL」を基本情報から入力すると、その場所が表示されます。住所・最寄り駅はこの文章でも補足できます。',
      },
      {
        id: 'hours',
        title: '営業時間',
        content: CAFE_1_HOURS_SECTION_CONTENT,
      },
      { id: 'faq', title: 'よくあるご質問（Q&A）', content: '' },
      {
        id: 'shop',
        title: '店舗詳細情報',
        content:
          '禁煙・お支払い方法・席数などの定型文はサンプルです。\n\n【お支払い例】\n現金 / カード / 交通系IC など\n\n※実店舗の運用に合わせてフル編集で修正してください。',
      },
      {
        id: 'contact',
        title: 'お問い合わせ',
        content: 'ご予約・お問い合わせはお電話にて承ります。（電話番号は基本情報から入力してください）',
      },
    ],
    cafeMenuTextRows: [
      { groupLabel: 'ラーメン', name: '醤油ラーメン', price: '¥850', description: '鶏と豚のWスープ。', badge: '定番' },
      { groupLabel: 'ラーメン', name: '味噌ラーメン', price: '¥900', description: '信州味噌ベース。', badge: '' },
      { groupLabel: 'ラーメン', name: '塩ラーメン', price: '¥850', description: '魚介の香り。', badge: '' },
      { groupLabel: 'ラーメン', name: 'つけ麺（中）', price: '¥1,000', description: '濃厚つけ汁。', badge: '人気' },
      { groupLabel: 'トッピング', name: '味玉', price: '¥120', description: '', badge: '' },
      { groupLabel: 'トッピング', name: 'チャーシュー増し', price: '¥200', description: '', badge: '' },
      { groupLabel: 'サイド', name: 'ライス（小）', price: '¥150', description: '', badge: '' },
      { groupLabel: 'ドリンク', name: '生ビール（中）', price: '¥550', description: '', badge: '' },
    ],
    cafeShopLocations: shopCard(
      '店名（基本情報で入力）',
      '03-0000-0000',
      '〒000-0000 住所（基本情報で入力）',
      PLACEHOLDER_MAP,
      'https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=900',
    ),
    mapEmbedUrl: PLACEHOLDER_MAP,
    cafeFloatingMapUrl: PLACEHOLDER_MAP,
    cafeGbPostsEmbedUrl: PLACEHOLDER_MAP,
    ctaLabel: 'お電話はこちら（番号は基本情報で入力）',
    ctaHref: 'tel:0300000000',
  };
}

function cafeOverride() {
  return {
    cafeVisualGenre: 'cafe_coffee',
    headline: '一杯のコーヒーから、ゆるやかな時間を。（カフェ向け固定サンプル）',
    subheadline:
      '豆の選び方から抽出まで、丁寧に一杯ずつお出しします。※写真はフリー素材です。',
    heroSlides: [
      'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=1400',
      'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=1400',
      'https://images.pexels.com/photos/683039/pexels-photo-683039.jpeg?auto=compress&cs=tinysrgb&w=1400',
    ],
    footerLineUrl: '',
    cafeReviewCtaText: '',
    cafeReviewCtaUrl: '',
    faqItems: faqGeneric(),
    cafeInstagramFeedItems: instagramGrid([
      'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=900',
      'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=900',
      'https://images.pexels.com/photos/683039/pexels-photo-683039.jpeg?auto=compress&cs=tinysrgb&w=900',
      'https://images.pexels.com/photos/414630/pexels-photo-414630.jpeg?auto=compress&cs=tinysrgb&w=900',
    ]),
    sections: [
      {
        id: 'concept',
        title: 'カフェのコンセプト',
        content:
          '厳選した豆を浅煎り〜中深煎りで。ミルクとの相性も考えたブレンドをご用意しています。パティスリーとのコラボスイーツもお楽しみください。（固定サンプル）',
        imageUrl:
          'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=1200',
      },
      {
        id: 'staff',
        title: 'バリスタより',
        content: '今日のおすすめ豆と抽出レシピをご案内します。苦さ・酸味の好みもお聞きします。（固定サンプル）',
        imageUrl:
          'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=1200',
      },
      {
        id: 'gallery',
        title: '店内・スイーツ',
        content: '木の温もりと自然光を意識したイメージです。（フリー素材）',
        imageUrl:
          'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=1200',
      },
      {
        id: 'menu',
        title: 'メニュー（テキスト・サンプル）',
        content: 'ドリンク・フードの価格はサンプルです。',
      },
      {
        id: 'access',
        title: '店舗・地図',
        content: '埋め込み地図は基本情報で指定した Google マップのURLが表示されます。',
      },
      { id: 'hours', title: '営業時間', content: CAFE_1_HOURS_SECTION_CONTENT },
      { id: 'faq', title: 'よくあるご質問（Q&A）', content: '' },
      {
        id: 'shop',
        title: '店舗詳細情報',
        content: '禁煙席・電源・Wi-Fi などはサンプル文言です。実店舗に合わせフル編集で修正してください。',
      },
      {
        id: 'contact',
        title: 'お問い合わせ',
        content: 'テイクアウトの取り置きなどはお電話にて。（電話番号は基本情報から入力）',
      },
    ],
    cafeMenuTextRows: [
      { groupLabel: 'コーヒー', name: 'ドリップコーヒー', price: '¥450', description: '本日の豆', badge: '' },
      { groupLabel: 'コーヒー', name: 'カフェラテ', price: '¥550', description: 'エスプレッソ＋ミルク', badge: '人気' },
      { groupLabel: 'コーヒー', name: 'カプチーノ', price: '¥550', description: '', badge: '' },
      { groupLabel: 'コーヒー', name: 'アイスコーヒー', price: '¥500', description: '', badge: '' },
      { groupLabel: 'フード', name: 'クロワッサン', price: '¥350', description: '', badge: '' },
      { groupLabel: 'フード', name: 'チーズケーキ', price: '¥600', description: '', badge: '' },
      { groupLabel: 'フード', name: 'サンドイッチプレート', price: '¥850', description: '', badge: '' },
      { groupLabel: 'その他', name: 'ソフトドリンク', price: '¥400', description: '', badge: '' },
    ],
    cafeShopLocations: shopCard(
      '店名（基本情報で入力）',
      '03-0000-0000',
      '〒000-0000 住所（基本情報で入力）',
      PLACEHOLDER_MAP,
      'https://images.pexels.com/photos/414630/pexels-photo-414630.jpeg?auto=compress&cs=tinysrgb&w=900',
    ),
    mapEmbedUrl: PLACEHOLDER_MAP,
    cafeFloatingMapUrl: PLACEHOLDER_MAP,
    cafeGbPostsEmbedUrl: PLACEHOLDER_MAP,
    ctaLabel: 'お電話はこちら（番号は基本情報で入力）',
    ctaHref: 'tel:0300000000',
  };
}

function defaultOverride() {
  return {
    cafeVisualGenre: 'other_food',
    headline: '腹が減ったら、ここへ。（飲食店向け固定サンプル）',
    subheadline:
      '定食から一品料理まで、気軽に立ち寄れる一枚皿を揃えました。※写真はフリー素材です。',
    heroSlides: [...CAFE_1_DEFAULT_HERO_SLIDES],
    footerLineUrl: '',
    cafeReviewCtaText: '',
    cafeReviewCtaUrl: '',
    faqItems: faqGeneric(),
    cafeInstagramFeedItems: instagramGrid([
      'https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=900',
      'https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=900',
      'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg?auto=compress&cs=tinysrgb&w=900',
      'https://images.pexels.com/photos/1907228/pexels-photo-1907228.jpeg?auto=compress&cs=tinysrgb&w=900',
    ]),
    sections: [
      {
        id: 'concept',
        title: 'お店のコンセプト',
        content:
          '素材の旨味を引き出す火加減と、ご飯が進む味付けを心がけています。家族連れからお一人様まで、幅広くお楽しみいただけるメニュー構成です。（固定サンプル）',
        imageUrl:
          'https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=1200',
      },
      {
        id: 'staff',
        title: '店主より',
        content: '今日のおすすめや仕入れの話など、気軽にお声がけください。（固定サンプル）',
        imageUrl:
          'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=1200',
      },
      {
        id: 'gallery',
        title: '料理写真',
        content: '定食・どんぶり・一品のイメージです。（フリー素材）',
        imageUrl:
          'https://images.pexels.com/photos/1907228/pexels-photo-1907228.jpeg?auto=compress&cs=tinysrgb&w=1200',
      },
      {
        id: 'menu',
        title: 'お品書き（テキスト・サンプル）',
        content: 'メニュー名・価格はサンプルです。',
      },
      {
        id: 'access',
        title: '店舗・地図',
        content: '地図は基本情報の Google マップ埋め込みURLで表示されます。',
      },
      { id: 'hours', title: '営業時間', content: CAFE_1_HOURS_SECTION_CONTENT },
      { id: 'faq', title: 'よくあるご質問（Q&A）', content: '' },
      {
        id: 'shop',
        title: '店舗詳細情報',
        content:
          'お支払い・席数・禁煙などの定型はサンプルです。フル編集画面で実店舗に合わせてください。',
      },
      {
        id: 'contact',
        title: 'お問い合わせ',
        content: 'ご来店前のお問い合わせはお電話にて。（電話番号は基本情報から入力）',
      },
    ],
    cafeMenuTextRows: [
      { groupLabel: '定食', name: '生姜焼き定食', price: '¥920', description: '', badge: '人気' },
      { groupLabel: '定食', name: 'から揚げ定食', price: '¥950', description: '', badge: '' },
      { groupLabel: '定食', name: '日替わり定食', price: '¥900', description: '', badge: '' },
      { groupLabel: '丼', name: 'カツ丼', price: '¥880', description: '', badge: '' },
      { groupLabel: '丼', name: '親子丼', price: '¥850', description: '', badge: '' },
      { groupLabel: '一品', name: '餃子（6個）', price: '¥350', description: '', badge: '' },
      { groupLabel: 'ドリンク', name: '生ビール（中）', price: '¥550', description: '', badge: '' },
      { groupLabel: 'ドリンク', name: '烏龍茶', price: '¥300', description: '', badge: '' },
    ],
    cafeShopLocations: shopCard(
      '店名（基本情報で入力）',
      '03-0000-0000',
      '〒000-0000 住所（基本情報で入力）',
      PLACEHOLDER_MAP,
      'https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=900',
    ),
    mapEmbedUrl: PLACEHOLDER_MAP,
    cafeFloatingMapUrl: PLACEHOLDER_MAP,
    cafeGbPostsEmbedUrl: PLACEHOLDER_MAP,
    ctaLabel: 'お電話はこちら（番号は基本情報で入力）',
    ctaHref: 'tel:0300000000',
  };
}

/**
 * @param {'ramen'|'cafe'|'default'} presetKind
 * @returns {Record<string, unknown>}
 */
export function getCafe1BasicLockedOverride(presetKind) {
  const k = presetKind === 'ramen' || presetKind === 'cafe' ? presetKind : 'default';
  const part = k === 'ramen' ? ramenOverride() : k === 'cafe' ? cafeOverride() : defaultOverride();
  const now = new Date().getFullYear();
  const siteName = '店名（基本情報で入力）';
  const footerAddress = '〒000-0000 都道府県市区町村番地（基本情報で入力）';
  const footerPhone = '03-0000-0000';
  return {
    siteName,
    title: siteName,
    footerText: `© ${now} ${siteName} | ${footerAddress} | ${footerPhone}`,
    footerAddress,
    footerPhone,
    footerInstagramUrl: '',
    footerTwitterUrl: '',
    cafeInstagramPermalink: '',
    cafeMeo: {
      servesCuisine: k === 'ramen' ? 'ラーメン;飲食店' : k === 'cafe' ? 'カフェ;コーヒー' : '飲食店',
      priceRange: k === 'cafe' ? '¥400〜¥900' : '¥800〜¥1,200',
      openingHours: [...CAFE_1_OPENING_HOURS_JSON_LD],
      streetAddress: footerAddress,
      addressLocality: '',
      addressRegion: '',
      postalCode: '',
    },
    metaTitle: siteName,
    metaDescription: `${footerAddress}の${siteName}（サンプル）`,
    ogImageUrl: '',
    keywords: '',
    canonicalUrl: '',
    ...part,
  };
}

/**
 * @param {'ramen'|'cafe'|'default'} presetKind
 * @param {Record<string, unknown>} editable
 */
export function mergeCafe1BasicEditable(presetKind, editable = {}) {
  const base = getCafe1BasicLockedOverride(presetKind);
  const e = editable && typeof editable === 'object' ? editable : {};
  const siteName = String(e.siteName || '').trim().slice(0, 120) || '店名未入力';
  const footerAddress = String(e.footerAddress || '').trim().slice(0, 300) || '住所未入力';
  const footerPhone = String(e.footerPhone || '').trim().slice(0, 40) || '03-0000-0000';
  const mapEmbedUrl = String(e.mapEmbedUrl || '').trim().slice(0, 2000);
  const footerInstagramUrl = String(e.footerInstagramUrl || '').trim().slice(0, 2000);
  const footerTwitterUrl = String(e.footerTwitterUrl || '').trim().slice(0, 2000);
  const openingHoursText = String(e.openingHoursText || '').trim();

  const year = new Date().getFullYear();
  base.siteName = siteName;
  base.title = siteName;
  base.footerAddress = footerAddress;
  base.footerPhone = footerPhone;
  base.footerText = `© ${year} ${siteName} | ${footerAddress} | ${footerPhone}`;
  base.metaTitle = siteName.slice(0, 120);
  base.metaDescription = `${footerAddress}の${siteName}。`.slice(0, 320);
  base.footerInstagramUrl =
    footerInstagramUrl && /^https?:\/\//i.test(footerInstagramUrl) ? footerInstagramUrl : '';
  base.footerTwitterUrl =
    footerTwitterUrl && /^https?:\/\//i.test(footerTwitterUrl) ? footerTwitterUrl : '';
  base.footerLineUrl = '';
  base.cafeInstagramPermalink = base.footerInstagramUrl || '';

  const telDigits = footerPhone.replace(/[^\d+]/g, '');
  base.ctaHref = telDigits ? `tel:${telDigits}` : 'tel:';
  base.ctaLabel = `お電話はこちら（${footerPhone}）`;

  const hourLines = openingHoursText
    ? openingHoursText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
    : [...CAFE_1_OPENING_HOURS_JSON_LD];

  base.cafeMeo = {
    ...(base.cafeMeo || {}),
    openingHours: hourLines.slice(0, 14),
    streetAddress: footerAddress,
  };

  const hoursSection = (base.sections || []).find((s) => s.id === 'hours');
  if (hoursSection) hoursSection.content = hourLines.join('\n');

  const shop = (base.cafeShopLocations || [])[0];
  if (shop) {
    shop.name = siteName;
    shop.detail = buildCafe1ShopLocationDetail(footerPhone, footerAddress);
    if (mapEmbedUrl && /^https?:\/\//i.test(mapEmbedUrl)) shop.mapUrl = mapEmbedUrl;
  }

  if (mapEmbedUrl && /^https?:\/\//i.test(mapEmbedUrl)) {
    base.mapEmbedUrl = mapEmbedUrl;
    base.cafeFloatingMapUrl = mapEmbedUrl;
    base.cafeGbPostsEmbedUrl = mapEmbedUrl;
  }

  const firstHero = Array.isArray(base.heroSlides) && base.heroSlides[0] ? String(base.heroSlides[0]) : '';
  if (/^https?:\/\//i.test(firstHero)) {
    base.ogImageUrl = firstHero;
  }

  return base;
}
