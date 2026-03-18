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
      catalogImages: [
        'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=600',
        'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600',
        'https://images.unsplash.com/photo-1605497788044-5a32c7068489?auto=format&fit=crop&w=600',
        'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?auto=format&fit=crop&w=600',
      ],
      mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3241.747975468381!2d139.7027863152582!3d35.659545280197!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188b5653d2f8a1%3A0x3f62daad6c2a5342!2z5p2x5Lqs6aeF!5e0!3m2!1sja!2sjp!4v1234567890',
      sections: [
        { id: 'concept', title: 'CONCEPT', content: '人生に彩りを。毎日にデザインを。\n\nALBUMは、お客様一人ひとりの骨格・雰囲気に寄り添い、その人らしさが引き立つヘアスタイルをご提案しています。トレンドに流されない、丁寧なカウンセリングと技術で、リピート率の高いサロンを目指しています。スタイリスト全員が技術研鑽に励み、雑誌掲載・ショー出場実績も多数。「予約」は画面下部のボタンから24時間受付可能です。', imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800' },
        { id: 'menu', title: 'HAIR CATALOG', content: 'ショート・ミディアム・ロング、パーマ・カラー・トリートメントなど、施術例をご覧いただけます。ご希望のイメージがございましたらお気軽にご相談ください。', imageUrl: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800' },
        { id: 'hours', title: '営業時間', content: '平日 10:00–20:00\n土日祝 9:00–19:00\n定休日：不定休（年末年始除く）' },
        { id: 'access', title: 'ACCESS', content: '東京都渋谷区神南1-2-3 〇〇ビル 2F\n渋谷駅 徒歩5分／表参道駅 徒歩8分\nお車の方は近隣コインパーキングをご利用ください。' },
        { id: 'staff', title: 'STAFF', content: '代表スタイリスト／トップスタイリスト／スタイリスト／アシスタントでチームを編成。役職ごとにグループ分けしたスタッフ紹介で、体制と実績が伝わる構成にしています。全員が技術コンテスト入賞経験あり。', imageUrl: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=800' },
        { id: 'gallery', title: 'SALON', content: '落ち着いた白とベージュを基調とした店内。ミラー越しの自然光で、仕上がりを確認しやすい空間です。', imageUrl: 'https://images.unsplash.com/photo-1562322140-8ba721ce3fef?auto=format&fit=crop&w=800' },
        { id: 'contact', title: 'オンライン予約', content: 'ご予約は下のボタンから24時間受付。お電話でのご予約も承っております。' },
      ],
      footerText: '© 2025 ALBUM. All rights reserved.',
      ctaLabel: 'オンライン予約',
      ctaHref: '#contact',
      footerAddress: '東京都渋谷区神南1-2-3 〇〇ビル 2F',
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
  clinic_chiropractic: {
    content: {
      siteName: 'スタジオS',
      title: 'スタジオS',
      headline: '根本から、身体を整える。',
      subheadline: '痛みの原因にアプローチし、再発しにくい体づくりを。',
      ctaLabel: '体験予約',
      ctaHref: '#contact',
      symptomItems: [
        '慢性的な肩こり・首の痛み',
        '腰痛・坐骨神経痛',
        '疲れが取れない・だるさ',
        '姿勢の悪さが気になる',
        'スポーツ後のケア',
      ],
      reasonItems: [
        { num: '01', title: '根本原因にアプローチ', body: '痛みの箇所だけでなく、骨格・筋肉・生活習慣まで丁寧にヒアリング。原因に合わせた施術で再発しにくい体を目指します。' },
        { num: '02', title: '国家資格者が施術', body: '柔道整復師・鍼灸師など有資格者が在籍。安心して身体を預けていただけます。' },
        { num: '03', title: '清潔な空間と丁寧な対応', body: '院内は常に清潔に保ち、お一人おひとりに寄り添ったカウンセリングと施術をご提供します。' },
      ],
      conceptDiagramLabels: ['心', '身体', '自律神経'],
      stats: [
        { value: '22', label: '年の実績' },
        { value: '10,000', label: '施術実績' },
      ],
      sections: [
        { id: 'program', title: 'PROGRAM', content: '骨格調整・筋肉調整・自律神経調整を組み合わせ、心と身体のバランスを整えます。初回はカウンセリングと検査を丁寧に行い、お悩みに合わせたプランをご提案します。', imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800' },
        { id: 'staff', title: '施術者紹介', content: '代表 〇〇 〇〇\n柔道整復師・鍼灸師。身体の土台から整える施術を得意としています。', imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800' },
        { id: 'evidence', title: '院内・資格', content: '清潔な施術空間と、資格証・認定証を掲示。安心してご来院ください。', imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800' },
        { id: 'access', title: 'ACCESS', content: '〒XXX-XXXX 〇〇県〇〇市〇〇 1-2-3\n〇〇駅より徒歩5分' },
        { id: 'hours', title: '営業時間', content: '平日 9:00–20:00\n土日祝 9:00–18:00\n定休日：不定休' },
        { id: 'contact', title: 'ご予約', content: '体験予約・ご相談はLINEまたはお電話で。' },
      ],
      footerText: '© 2025 スタジオS. All rights reserved.',
      footerAddress: '〒XXX-XXXX 〇〇県〇〇市〇〇 1-2-3',
      footerPhone: 'XXX-XXXX-XXXX',
      mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3241.747975468381!2d139.7027863152582!3d35.659545280197!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188b5653d2f8a1%3A0x3f62daad6c2a5342!2z5p2x5Lqs6aeF!5e0!3m2!1sja!2sjp!4v1234567890',
      heroSlides: ['https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200'],
    },
    seo: {
      metaTitle: 'スタジオS | 整骨院・整体・鍼灸',
      metaDescription: '根本から身体を整える。肩こり・腰痛・疲れにお悩みの方へ。体験予約受付中。',
      keywords: '整骨院, 整体, 鍼灸, 肩こり, 腰痛',
      ogImageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200',
      canonicalUrl: '',
    },
  },
  gym_yoga: genericPlaceholder('パーソナルジム', 'パーソナルジム・ヨガ | 体験予約', 'ビフォーアフター・体験予約へ誘導。'),
  builder: {
    content: {
      siteName: '〇〇設計事務所',
      title: '〇〇設計事務所',
      headline: '都市に余白を編む',
      subheadline: '建築・リノベーションで、その場所らしさを引き出す。',
      quote: '洗練されたミニマリズム。白と黒を基調に写真を主役に。WORKS（事例）・IDEAS（考え方）・PEOPLE（人）・ABOUT（会社）で情報を整理。',
      sections: [
        { id: 'gallery', title: 'WORKS', content: '施工事例・リノベーション実績をご紹介します。住宅・店舗・オフィスなど、高品質な写真とともに掲載。', imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800' },
        { id: 'concept', title: 'IDEAS', content: '私たちは「その場所にしかない価値」を引き出すことを大切にしています。既存の建物や街の文脈を読み、余白や光を編むように設計します。', imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800' },
        { id: 'staff', title: 'PEOPLE', content: '代表をはじめ、設計・施工を担当するスタッフの紹介です。', imageUrl: 'https://images.unsplash.com/photo-1503384936854-8e4c8b2e3b3a?auto=format&fit=crop&w=800' },
        { id: 'about', title: 'ABOUT', content: '会社概要・理念・受賞歴。建築とリノベーションで、住まいと街の可能性をひらきます。', imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800' },
        { id: 'access', title: 'ACCESS', content: '所在地・アクセス・お問い合わせ。' },
        { id: 'contact', title: 'CONTACT', content: 'ご依頼・ご相談はお気軽にどうぞ。' },
      ],
      footerText: '© 2025 〇〇設計事務所. All rights reserved.',
      ctaLabel: 'お問い合わせ',
      ctaHref: '#contact',
      footerAddress: '〒XXX-XXXX 〇〇県〇〇市〇〇 1-2-3',
      footerPhone: 'XXX-XXXX-XXXX',
      heroSlides: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200'],
    },
    seo: {
      metaTitle: '〇〇設計事務所 | 建築・リノベーション',
      metaDescription: '洗練されたミニマルなデザインで、施工事例・考え方・スタッフ・会社概要をご案内。',
      keywords: '建築, リノベーション, 設計, 施工事例',
      ogImageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200',
      canonicalUrl: '',
    },
  },
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
