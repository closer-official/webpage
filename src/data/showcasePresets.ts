import type { PageContent, SEOData, StyleId } from '../types';
import { SHOWCASE_VARIANT_COUNT } from '../types';
import { WARM_ORGANIC_CAFE_PRESET } from './warmOrganicCafePreset';

/** 1テンプレあたりのバリアント数（6×5=30スロット） */
const VARIANT_COUNT = SHOWCASE_VARIANT_COUNT;

/** 汎用プレースホルダー（テンプレ3〜10のひな形） */
function genericPlaceholder(name: string, metaTitle: string, metaDesc: string): { content: PageContent; seo: SEOData } {
  return {
    content: {
      siteName: name,
      title: name,
      headline: name,
      subheadline: 'コンセプト・メニュー・アクセスをご案内します。',
      sections: [
        { id: 'concept', title: 'こだわり', content: '当店のこだわりをご紹介します。' },
        { id: 'menu', title: 'メニュー', content: 'メニュー・料金はお問い合わせください。' },
        { id: 'hours', title: '営業時間', content: '営業時間はお問い合わせください。' },
        { id: 'access', title: 'アクセス', content: 'アクセス情報をご確認ください。' },
        { id: 'contact', title: 'お問い合わせ', content: 'ご予約・お問い合わせはお気軽にどうぞ。' },
      ],
      footerText: `© ${new Date().getFullYear()} ${name}. All rights reserved.`,
      ctaLabel: 'お問い合わせ',
      ctaHref: '#contact',
      heroSlides: ['https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200'],
    },
    seo: { metaTitle, metaDescription: metaDesc, keywords: '', ogImageUrl: '', canonicalUrl: '' },
  };
}

/**
 * 各テンプレの完成例（LP作成時は検索条件に合わせたテンプレのひな形へ店舗情報を差し込む）
 * 1. 美容室＝GOALD/LECO/ALBUM 参照、2. カフェ＝旧 warm_organic、3〜10＝汎用ひな形
 */
export const SHOWCASE_BY_STYLE_ID: Record<StyleId, { content: PageContent; seo: SEOData }> = {
  salon_barber: {
    content: {
      siteName: 'ALBUM',
      title: 'ALBUM',
      headline: 'ALBUM',
      subheadline: '人生に彩りを。毎日にデザインを。',
      quote: 'ファーストビューでターゲット層の雰囲気に合わせた魅力的なモデル写真を大きく配置。ニュース・スタッフ・ヘアカタログ・サロン情報が縦スクロールでまとまり、白・黒・ベージュのシンプルな背景で写真を引き立てる。SNS・オンライン予約への導線を明確に。',
      sections: [
        { id: 'concept', title: 'CONCEPT', content: '人生に彩りを。毎日にデザインを。スタイリストのこだわりと世界観が伝わる、雑誌のようなレイアウトで「予約」への動線を大切にしています。', imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800' },
        { id: 'menu', title: 'HAIR CATALOG', content: 'ヘアスタイル・施術メニューをご覧いただけます。', imageUrl: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800' },
        { id: 'hours', title: '営業時間', content: '10:00–20:00（不定休）' },
        { id: 'access', title: 'ACCESS', content: '東京都渋谷区〇〇 1-2-3　渋谷駅より徒歩5分' },
        { id: 'staff', title: 'STAFF', content: '役職ごとにグループ分けしたスタッフ紹介。体制と実績が伝わる構成です。', imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800' },
        { id: 'gallery', title: 'SALON', content: 'サロン内の雰囲気をご覧ください。', imageUrl: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800' },
        { id: 'contact', title: 'オンライン予約', content: 'ご予約はオンラインまたはお電話にて。' },
      ],
      footerText: '© 2025 ALBUM. All rights reserved.',
      ctaLabel: 'オンライン予約',
      ctaHref: '#contact',
      footerAddress: '東京都渋谷区〇〇 1-2-3',
      footerPhone: '03-XXXX-XXXX',
      heroSlides: [
        'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200',
        'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200',
        'https://images.unsplash.com/photo-1605497788044-5a32c7068489?auto=format&fit=crop&w=1200',
      ],
    },
    seo: {
      metaTitle: 'ALBUM — 美容室 | 渋谷',
      metaDescription: '人生に彩りを。毎日にデザインを。スタイリストの世界観が伝わるヘアサロン。',
      keywords: '美容室, 渋谷, ヘアサロン, オンライン予約',
      ogImageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200',
      canonicalUrl: '',
    },
  },
  cafe_tea: {
    content: WARM_ORGANIC_CAFE_PRESET.content,
    seo: WARM_ORGANIC_CAFE_PRESET.seo,
  },
  bakery: genericPlaceholder('街のパン屋', '街のパン屋 | 焼き立て・本日のラインナップ', '焼き立てパンと温かみのある空間。'),
  clinic_chiropractic: genericPlaceholder('整骨院・整体', '整骨院・整体・鍼灸 | 清潔感と信頼感', '院長の顔写真と選ばれる理由が伝わる構成。'),
  gym_yoga: genericPlaceholder('パーソナルジム', 'パーソナルジム・ヨガ | 体験予約', 'ビフォーアフター・体験予約へ誘導。'),
  builder: genericPlaceholder('工務店・リノベ', '工務店・リノベ | 施工事例', '施工事例ギャラリーと職人のこだわり。'),
  professional: genericPlaceholder('士業事務所', '行政書士・税理士・社労士 | お問い合わせ', '誠実さを感じさせるネイビー・白の基調。'),
  cram_school: genericPlaceholder('個別指導塾', '個別指導塾・習い事 | 月謝・講師', '親御さんが安心する優しいトーン。'),
  izakaya: genericPlaceholder('こだわり居酒屋', 'こだわり居酒屋・バー | 夜の雰囲気', 'ダークな配色でお酒・料理をドラマチックに。'),
  pet_salon: genericPlaceholder('ペットサロン', 'ペットサロン・ドッグ | 安心感', 'プロの専門性が伝わる安心感重視のデザイン。'),
};

/**
 * 10テンプレ × 5バリアント = 50スロットの枠。
 * 各スロットは現状同じ内容のコピー。画像は template-sources/ で差し替え用を用意。
 */
export const SHOWCASE_PRESETS_6X5: Record<
  StyleId,
  [{ content: PageContent; seo: SEOData }, { content: PageContent; seo: SEOData }, { content: PageContent; seo: SEOData }, { content: PageContent; seo: SEOData }, { content: PageContent; seo: SEOData }]
> = (() => {
  const styleIds = Object.keys(SHOWCASE_BY_STYLE_ID) as StyleId[];
  const out = {} as Record<StyleId, [{ content: PageContent; seo: SEOData }, { content: PageContent; seo: SEOData }, { content: PageContent; seo: SEOData }, { content: PageContent; seo: SEOData }, { content: PageContent; seo: SEOData }]>;
  for (const id of styleIds) {
    const base = SHOWCASE_BY_STYLE_ID[id]!;
    out[id] = Array.from({ length: VARIANT_COUNT }, () => ({
      content: structuredClone(base.content),
      seo: structuredClone(base.seo),
    })) as typeof out[StyleId];
  }
  return out;
})();

/** バリアント指定なしの場合は 0 を参照（従来どおり） */
export function getShowcasePreset(styleId: StyleId, variant?: number): { content: PageContent; seo: SEOData } {
  const v = variant != null && variant >= 0 && variant < VARIANT_COUNT ? variant : 0;
  const p = SHOWCASE_PRESETS_6X5[styleId]![v]!;
  return {
    content: structuredClone(p.content),
    seo: structuredClone(p.seo),
  };
}
