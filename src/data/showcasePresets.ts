import type { PageContent, SEOData, StyleId } from '../types';
import { SHOWCASE_VARIANT_COUNT } from '../types';
import { WARM_ORGANIC_CAFE_PRESET } from './warmOrganicCafePreset';

/** 1テンプレあたりのバリアント数（12×1=12スロット） */
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
  cafe_1: {
    content: {
      siteName: 'STUDIO TABLE',
      title: 'STUDIO TABLE',
      headline: '街と緑のあいだで、ひと息つく場所。',
      subheadline: 'Have a calm moment.',
      navItems: [
        { label: 'About', href: '#concept' },
        { label: 'Menu', href: '#menu' },
        { label: 'Recruit', href: '#recruit' },
        { label: 'Business', href: '#business' },
        { label: 'Shop', href: '#access' },
        { label: 'Contact', href: '#contact' },
      ],
      sections: [
        {
          id: 'concept',
          title: 'ABOUT',
          content:
            '世代をまたいで通えるレストランカフェとして、ペントハウスのような開放感と落ち着きの両方を大切にしています。朝のコーヒーから夜の食事まで、日常にそっと寄り添う一杯と一皿をご用意しています。',
        },
        {
          id: 'gallery',
          title: '',
          content: '',
          imageUrl:
            'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200',
        },
        {
          id: 'menu',
          title: 'MENU',
          content: '店舗ごとのメニューは、ボタンから別タブでご覧いただけます。',
        },
        {
          id: 'recruit',
          title: 'RECRUIT',
          content:
            'ホール・キッチン・マネジメント候補を募集しています。未経験からキャリアを積みたい方、おいしいものと空間づくりが好きな方を歓迎します。詳細は採用サイトをご確認ください。',
        },
        {
          id: 'business',
          title: 'BUSINESS',
          content:
            '店舗運営のほか、ケータリングやコラボイベントのご相談も承っています。ブランドの世界観を守りながら、柔軟にご提案いたします。',
        },
        {
          id: 'access',
          title: 'SHOP',
          content: '各店の最新情報・ご予約は店舗ページよりお願いいたします。',
        },
        {
          id: 'contact',
          title: 'CONTACT',
          content: 'お問い合わせ・ご予約は下記よりお願いいたします。',
        },
      ],
      footerText: '© STUDIO TABLE GROUP. All rights reserved.',
      footerInstagramUrl: 'https://www.instagram.com/',
      ctaLabel: 'お問い合わせ',
      ctaHref: '#contact',
      heroSlides: [
        'https://images.unsplash.com/photo-1447933601403-0c6688cbabf7?auto=format&fit=crop&w=1400',
        'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=1400',
        'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1400',
      ],
      cafeBranchMenuItems: [
        { groupLabel: '都心エリア', label: 'NORTH GATE', menuUrl: 'https://example.com/menu/north' },
        { groupLabel: '都心エリア', label: 'EAST YARD', menuUrl: 'https://example.com/menu/east' },
        { groupLabel: '公園沿い', label: 'RIVER SIDE', menuUrl: 'https://example.com/menu/river' },
        { groupLabel: '公園沿い', label: 'HILL TERRACE', menuUrl: 'https://example.com/menu/hill' },
      ],
      cafeShopLocations: [
        {
          name: 'STUDIO TABLE NORTH GATE',
          detail: '平日 11:00–22:00 / 土日祝 10:00–22:00\n03-0000-0001\n東京都〇〇区〇〇 1-2-3',
          mapUrl: 'https://maps.google.com/',
          reserveLabel: '予約する',
          reserveUrl: 'https://example.com/reserve/north',
          imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=900',
        },
        {
          name: 'STUDIO TABLE RIVER SIDE',
          detail: '平日 10:00–21:00 / 定休：火曜\n03-0000-0002\n神奈川県〇〇市〇〇 4-5-6',
          mapUrl: 'https://maps.google.com/',
          reserveLabel: '予約する',
          reserveUrl: 'https://example.com/reserve/river',
          imageUrl: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=900',
        },
      ],
    },
    seo: {
      metaTitle: 'STUDIO TABLE | レストランカフェ',
      metaDescription: '街と緑のあいだで。複数店舗で展開するレストランカフェの公式ページ。',
      keywords: 'カフェ, レストラン, 複数店舗, ブランチ',
      ogImageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688cbabf7?auto=format&fit=crop&w=1200',
      canonicalUrl: '',
    },
  },
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
  gym_yoga: {
    content: {
      siteName: 'パーソナルトレーニング',
      title: 'パーソナルトレーニング',
      headline: 'お前の筋肉、バルク足りてねぇぞ！ぼくが筋肥大に変えてやる！',
      subheadline:
        'NSCA-CPT保持。DMだけだと一歩が重い人へ——このサイトから予約の流れが一目でわかります。理想のカラダと、続くモチベを一緒に。',
      ctaLabel: '予約・相談',
      ctaHref: '#reserve',
      gymHeroBadge: 'NSCA-CPT保持',
      gymTrainerQuote: 'バルク足りすぎてんだろー！',
      gymPaymentNote: 'お支払いは当日、現地にて。キャッシュレス対応可。',
      gymAudienceIntro:
        'パーソナルを選ぶ理由は人それぞれ。この3タイプのどれに近いか、まずは自分に当てはまるものから読んでみてください。',
      gymAudienceHooks: [
        {
          tag: 'BODY',
          title: 'このトレーナーみたいな体になりたい',
          body: '見た目の変化・筋肥大・バルクアップを最優先。Before/Afterと数値で「自分も変われる」イメージを具体化します。',
        },
        {
          tag: 'FORM',
          title: 'フォームを完璧にしたい・モチベを保ちたい',
          body: '正しいフォームで効かせる感覚を、対面で丁寧に矯正。食事や習慣も含め、一人では続かない部分をプロが伴走します。',
        },
        {
          tag: 'FAN',
          title: 'この人に直接教わりたい',
          body: 'SNSで見てきた世界観そのままに。人柄・こだわりはQ&Aと実績で。ファン目線でも「申し込みやすい導線」を用意しています。',
        },
      ],
      gymStatAnimations: [{ end: 7, suffix: '万人' }, { end: 200, suffix: '名+' }],
      stats: [
        { value: '7万人', label: 'SNSフォロワー' },
        { value: '200名+', label: '指導実績' },
        { value: '−10kg', label: 'お客様の変化例' },
      ],
      reasonItems: [
        { num: '1', title: 'NSCA-CPT保持の確かな知識', body: '国際的に認められた資格に基づく、安全で効果的なプログラム設計。根拠のあるトレーニングで確実に結果を出します。' },
        { num: '2', title: '初心者特化の分かりやすい指導', body: 'いきなりハードなメニューはしません。フォーム・呼吸・食事の基本から丁寧に。初めてでも続けられる環境です。' },
        { num: '3', title: 'SNSフォロワー約7万人の信頼', body: '多くの方に支持されている実績。Before/Afterやお客様の声をSNSで発信し、透明性の高い指導を心がけています。' },
      ],
      gymReasonIcons: ['🏅', '📱', '💪'],
      catalogImages: [
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600',
        'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=600',
        'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=600',
      ],
      priceRows: [
        { name: '体重−10kg・体脂肪率改善', price: '' },
        { name: '胸囲+5cm・姿勢改善', price: '' },
        { name: '筋力アップ・挙上重量UP', price: '' },
      ],
      gymClientVoices: [
        'Tシャツがパツパツになった！',
        'フォームが変わって、効いてる感がすごい。',
        '食事のアドバイスが続けやすくて助かった。',
      ],
      gymMenuLede:
        '「何をされるか分からない不安」をなくすため、対面の流れとオンラインとの違いを表で整理しました。まずは自分に合う方を選んでください。',
      gymProgramSteps: [
        { title: 'カウンセリング', body: '目標・生活リズム・既往歴をヒアリング。無理のない頻度とメニューの方向性を決めます。' },
        { title: 'フォーム修正', body: '関節の可動域と筋の入り方を確認。効かせる角度・呼吸を一つずつ整えます。' },
        { title: '追い込み＆フィードバック', body: '本日のボリュームとRPEを管理。次回までの自主トレと食事のポイントもお渡しします。' },
      ],
      gymMenuCards: [
        { title: 'パーソナル（対面）', body: 'ジムまたは出張でマンツーマン指導。カウンセリング→フォーム修正→追い込みまで一貫サポート。', price: '要相談' },
        { title: 'オンラインコーチング', body: '遠方の方もOK。食事・トレーニング計画の提案とチャットサポートで、ご自宅やお近くの施設で実践できます。', price: '要相談' },
      ],
      gymMenuCompareRows: [
        { feature: '場所', onsite: '指定ジム・スタジオ等で対面', online: '自宅・お近くのジムで実施' },
        { feature: 'フォーム指導', onsite: '手を添えてその場で矯正', online: '動画提出・ライブでチェック' },
        { feature: '食事アドバイス', onsite: '◎（生活に合わせて提案）', online: '◎（チャットで継続フォロー）' },
        { feature: '向いている人', onsite: '初心者〜上級・フォームに不安がある方', online: '遠方・忙しく通いづらい方' },
      ],
      gymTrainerQa: [
        { q: '好きな種目は？', a: 'ベンチプレスとスクワット。バルクの土台はここから。' },
        { q: '初心者に一言', a: 'いきなり重くしなくていい。フォームと「効かせる」感覚を一緒に磨いていこう。' },
      ],
      faqItems: [
        { q: '初心者でも大丈夫ですか？', a: 'はい。初心者こそ歓迎です。フォームや呼吸の基本から丁寧にお伝えしますので、運動が久しぶりの方でも安心してご参加いただけます。' },
        { q: '食事指導はありますか？', a: 'はい。トレーニングと合わせて食事のアドバイスも行います。無理な制限ではなく、続けやすい範囲でご提案します。' },
        { q: 'DMだけだと不安でした。サイトからでも申し込めますか？', a: 'はい。このページの「予約・相談」から流れを確認し、日時を選ぶだけで申し込みに進めます。従来のDM相談と併用できます。' },
        { q: '予約の流れを教えてください', a: '予約ボタンから枠を選択→初回カウンセリング→トレーニング→アフターフォローの流れです。お支払いは当日現地にて、キャッシュレス対応。事前のカード登録は不要です。' },
      ],
      sections: [
        { id: 'program', title: 'プログラム', content: '初回カウンセリングで目標と現状をヒアリング。無理のないプランをご提案し、最短で「変われた」を実感していただきます。', imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800' },
        { id: 'staff', title: 'トレーナー紹介', content: 'NSCA-CPT保持。初心者に寄り添う丁寧な指導と、結果にこだわるプログラムで伴走します。' },
        { id: 'menu', title: 'コース・料金', content: 'パーソナル（対面）とオンラインコーチングをご用意。下のカードで特徴を比較して、自分に合う方を選べます。' },
        { id: 'access', title: 'アクセス', content: '〒XXX-XXXX 〇〇県〇〇市〇〇 1-2-3\n〇〇駅より徒歩3分' },
        { id: 'contact', title: '予約・申し込み', content: 'ご予約は下のボタンから。日時を選ぶだけ！お支払いは当日、現地にて（キャッシュレス対応）。事前のクレジットカード登録は不要です。' },
      ],
      footerText: '© 2025 パーソナルトレーニング. All rights reserved.',
      footerAddress: '〒XXX-XXXX 〇〇県〇〇市〇〇 1-2-3',
      footerPhone: 'XXX-XXXX-XXXX',
      mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3241.747975468381!2d139.7027863152582!3d35.659545280197!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188b5653d2f8a1%3A0x3f62daad6c2a5342!2z5p2x5Lqs6aeF!5e0!3m2!1sja!2sjp!4v1234567890',
      heroSlides: [
        'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1400&q=85',
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1400&q=85',
      ],
      gymFooterSns: [
        { label: 'Instagram', href: 'https://instagram.com/' },
        { label: 'TikTok', href: 'https://tiktok.com/' },
      ],
    },
    seo: {
      metaTitle: 'パーソナルトレーニング | NSCA-CPT 筋肥大・ダイエット 予約',
      metaDescription:
        'NSCA-CPT保持のパーソナルトレーニング。SNSフォロワー約7万人。体づくり・フォーム矯正・オンラインまで。DM以外にサイトから予約可能。初回カウンセリング歓迎。',
      keywords:
        'パーソナルトレーニング, パーソナルジム, 筋トレ, 筋肥大, ダイエット, NSCA-CPT, オンラインコーチング, フォーム指導, 初心者',
      ogImageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1200&q=85',
      canonicalUrl: '',
    },
  },
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
  professional: {
    content: {
      siteName: '〇〇税理士事務所',
      title: '〇〇税理士事務所',
      headline: '相続・事業承継の悩みを、信頼で解決します',
      subheadline: '初回相談無料。お気軽にご連絡ください。',
      ctaLabel: '無料相談',
      ctaHref: '#contact',
      proTrustBullets: ['初回相談無料', '土日祝対応可', 'オンライン相談可'],
      proStepItems: [
        { step: '1', title: 'ご相談', body: 'お電話またはフォームでご予約。ご不安やご希望をお聞きします。' },
        { step: '2', title: 'お見積り', body: '内容に応じてお見積りと今後の流れをご説明します。' },
        { step: '3', title: '解決', body: '必要書類の作成・手続きをサポートし、完了まで伴走します。' },
      ],
      proServiceItems: [
        { icon: '📋', title: '相続・遺言', body: '遺言書作成、相続手続き、遺産分割のご相談を承ります。' },
        { icon: '🏢', title: '法人・事業承継', body: '会社設立、決算・申告、M&A・事業承継のサポートをいたします。' },
        { icon: '📊', title: '個人の確定申告', body: '副業・不動産・医療費控除など、確定申告のご依頼を歓迎します。' },
        { icon: '🤝', title: '経営相談', body: '資金繰り・補助金・節税など、経営者の悩みにワンストップで対応します。' },
      ],
      stats: [
        { value: '500+', label: '相談実績' },
        { value: '72時間', label: '最短対応' },
        { value: '0円', label: '初回相談料' },
      ],
      priceRows: [
        { name: '初回相談（60分）', price: '無料' },
        { name: '相続税申告（目安）', price: '〇〇円〜' },
        { name: '遺言書作成（1通）', price: '〇〇円〜' },
      ],
      faqItems: [
        { q: '初回相談は無料ですか？', a: 'はい。60分程度、初回のご相談は無料で承っております。お気軽にご連絡ください。' },
        { q: '土日祝は対応していますか？', a: '事前予約制で土日祝も対応可能な場合がございます。お問い合わせ時にご希望をお伝えください。' },
        { q: 'オンライン相談はできますか？', a: 'Zoom等によるオンライン相談にも対応しています。遠方の方もご利用いただけます。' },
      ],
      sections: [
        {
          id: 'concept',
          title: 'ご挨拶・理念',
          content:
            '「信頼を、自分に期待してください。」\n\n私たちは、お客様一人ひとりの事情に寄り添い、相続・事業・税務の悩みを一緒に整理し、納得のいく解決へと導きます。数字だけでなく、ご家族や経営の未来まで見据えた提案を心がけています。',
          imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800',
        },
        {
          id: 'staff',
          title: '代表プロフィール',
          content:
            '〇〇 〇〇（税理士・〇〇年在籍）\n\n大手法人で経験を積んだのち独立。相続・事業承継を中心に、個人・法人の皆様からご依頼をいただいています。相談しやすいと評判をいただくよう、丁寧な説明とスピード感のある対応を心がけています。',
          imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400',
        },
        {
          id: 'menu',
          title: '料金の目安',
          content: '以下は目安です。案件の内容により変動します。正確なお見積りは初回相談時にご案内します。',
        },
        {
          id: 'faq',
          title: 'よくある質問',
          content: 'ご相談前に、よくいただく質問をまとめました。',
        },
        {
          id: 'access',
          title: 'アクセス',
          content: '〇〇県〇〇市〇〇町1-2-3 〇〇ビル 3F\n〇〇駅 徒歩5分\n駐車場2台完備',
        },
        {
          id: 'contact',
          title: '無料相談のご予約',
          content: 'お電話または下のボタンからお申し込みください。24時間以内にご連絡いたします。',
        },
      ],
      footerText: `© ${new Date().getFullYear()} 〇〇税理士事務所`,
      footerAddress: '〇〇県〇〇市〇〇町1-2-3 〇〇ビル 3F',
      footerPhone: '03-XXXX-XXXX',
      mapEmbedUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3241.747975468381!2d139.7027863152582!3d35.659545280197!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188b5653d2f8a1%3A0x3f62daad6c2a5342!2z5p2x5Lqs6aeF!5e0!3m2!1sja!2sjp!4v1234567890',
    },
    seo: {
      metaTitle: '〇〇税理士事務所 | 相続・事業承継・確定申告',
      metaDescription:
        '初回相談無料。相続・遺言・法人・確定申告まで、信頼と実績でお応えします。土日祝・オンライン対応可。',
      keywords: '税理士, 相続, 事業承継, 確定申告, 無料相談',
      ogImageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200',
      canonicalUrl: '',
    },
  },
  cram_school: {
    content: {
      siteName: 'キッズ塾サンプル',
      title: 'キッズ塾サンプル',
      headline: 'お子さまの「できた！」を増やす。',
      subheadline: '無料体験・資料請求はお気軽にどうぞ。',
      ctaLabel: '無料体験申込',
      ctaHref: '#contact',
      ctaSecondaryLabel: '資料請求',
      ctaSecondaryHref: '#contact',
      stats: [
        { value: '94%', label: '保護者満足度' },
        { value: '100+', label: '教室数' },
        { value: '10,000+', label: '累計利用者' },
      ],
      segmentItems: [
        { label: '幼児', href: '#menu' },
        { label: '小学生', href: '#menu' },
        { label: '中学生', href: '#menu' },
        { label: '高校生', href: '#menu' },
      ],
      reasonItems: [
        { num: '1', title: '一人ひとりに合わせた指導', body: '個別カリキュラムで、お子さまのペースと目標に合わせて無理なく学べます。' },
        { num: '2', title: '無料体験で安心', body: '入会前に教室の雰囲気や講師を体験。資料請求も随時受付中です。' },
        { num: '3', title: '通いやすい立地と時間', body: '駅近教室が多く、送迎しやすい時間帯もご相談いただけます。' },
      ],
      sections: [
        { id: 'concept', title: '教室の想い', content: '「できた！」の積み重ねが、お子さまの自信につながります。私たちは一人ひとりに寄り添い、学ぶ楽しさと習慣づくりをサポートします。' },
        { id: 'menu', title: 'コース・月謝', content: '幼児コース・小学生コース・中学生コース・高校生コースをご用意。月謝や時間帯はお問い合わせください。' },
        { id: 'access', title: 'アクセス', content: '〇〇県〇〇市〇〇町1-2-3\n〇〇駅 徒歩5分\n駐車場あり' },
        { id: 'contact', title: 'お問い合わせ', content: '無料体験・資料請求は下のボタンから。お電話でも承っております。' },
      ],
      footerText: `© ${new Date().getFullYear()} キッズ塾サンプル. All rights reserved.`,
      mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3241.747975468381!2d139.7027863152582!3d35.659545280197!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188b5653d2f8a1%3A0x3f62daad6c2a5342!2z5p2x5Lqs6aeF!5e0!3m2!1sja!2sjp!4v1234567890',
    },
    seo: {
      metaTitle: '個別指導塾・習い事 | 無料体験・資料請求',
      metaDescription: 'お子さまの「できた！」を増やす。保護者満足度94%。無料体験・資料請求受付中。',
      keywords: '塾, 習い事, 個別指導, 無料体験, 資料請求',
      ogImageUrl: '',
      canonicalUrl: '',
    },
  },
  izakaya: genericPlaceholder('こだわり居酒屋', 'こだわり居酒屋・バー | 夜の雰囲気', 'ダークな配色でお酒・料理をドラマチックに。'),
  pet_salon: {
    content: {
      siteName: '薫トリミング',
      title: '薫トリミング',
      headline: 'トリミングに込める、ひとりひとりの想い',
      subheadline: '清潔で安心できる空間で、ワンちゃんの個性を大切にした仕上がりをご提案します。',
      ctaLabel: 'ご予約',
      ctaHref: '#contact',
      mapEmbedUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3241.747975468381!2d139.7027863152582!3d35.659545280197!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188b5653d2f8a1%3A0x3f62daad6c2a5342!2z5p2x5Lqs6aeF!5e0!3m2!1sja!2sjp!4v1234567890',
      petServiceItems: [
        { icon: '📋', title: 'カウンセリング', body: '性格・被毛の状態を伺い、無理のないスタイルとお手入れのコツをご提案します。' },
        { icon: '🧴', title: 'シャンプー・ブロー', body: '肌に優しい洗剤で丁寧に洗い上げ、ふんわり仕上げます。' },
        { icon: '✂️', title: 'カット', body: 'お散歩しやすい長さからモデルカットまで、ご希望に沿って整えます。' },
        { icon: '🛁', title: 'オプション', body: '歯みがき・爪切り・耳そうじなど、お困りごともまとめてご相談ください。' },
      ],
      petPolicyItems: [
        {
          title: 'ご来店前のご確認（ワクチン・体調など）',
          body:
            '混合ワクチン・狂犬病の接種を完了しているワンちゃんのみご利用いただけます。発情中・妊娠中・体調不良の場合は事前にご相談ください。攻撃性が強い場合、他のお客様の安全のためお断りすることがあります。',
        },
        {
          title: 'キャンセル・無断キャンセルについて',
          body:
            '前日までのキャンセルは無料です。当日キャンセル・無断キャンセルはキャンセル料をいただく場合がございます。詳細はご予約時にご案内します。',
        },
        {
          title: '利用規約（抜粋）',
          body:
            '1. 当サロンのサービスはペットの美容目的に限ります。\n2. 施術中の事故防止のため、スタッフの指示にご協力ください。\n3. 施術に伴う偶発的な皮膚トラブル等については、可能な限り配慮いたしますが、事前に申し出のない既往等によるものは責任を負いかねる場合があります。\n4. 本文の全文は店頭・お問い合わせにてご確認いただけます。',
        },
      ],
      catalogImages: [
        'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=400',
        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400',
        'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400',
        'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=400',
        'https://images.unsplash.com/photo-1530281700549-e82e7bf50d96?auto=format&fit=crop&w=400',
        'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400',
      ],
      sections: [
        {
          id: 'concept',
          title: 'トリミングに込める想い',
          content:
            'うちの子がリラックスできるかどうか。それが何より大切だと考えています。\n\n無理なカットはせず、被毛の健康と生活しやすさのバランスを大切にしています。初めての方も、まずはカウンセリングからお気軽にどうぞ。',
          imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800',
        },
        { id: 'staff', title: 'スタッフ', content: '愛犬家スタッフが、丁寧な声かけと手元で安心感をお届けします。', imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800' },
        {
          id: 'menu',
          title: 'メニュー・料金',
          content:
            '【シャンプー＆カット】小型犬 〇〇円〜／中型犬 〇〇円〜\n【シャンプーのみ】〇〇円〜\n※被毛の長さ・状態により追加料金がかかる場合があります。正確なお見積りはご来店時にご案内します。',
        },
        {
          id: 'gallery',
          title: '仕上がりギャラリー',
          content: 'スタイルのイメージにお役立てください。犬種・個体差により仕上がりは異なります。',
        },
        { id: 'hours', title: '営業時間', content: '平日 10:00–18:00\n土日祝 9:00–17:00\n定休日：火曜・水曜（祝日の場合は翌平日）' },
        {
          id: 'access',
          title: 'アクセス',
          content: '東京都〇〇区〇〇 1-2-3\n〇〇駅 徒歩7分\n※駐車場は近隣コインパーキングをご利用ください。',
        },
        { id: 'contact', title: 'ご予約・お問い合わせ', content: 'LINE・お電話にてご予約を承っております。初めての方もお気軽にご連絡ください。' },
      ],
      footerText: `© ${new Date().getFullYear()} 薫トリミング`,
      footerAddress: '東京都〇〇区〇〇 1-2-3',
      footerPhone: '03-XXXX-XXXX',
    },
    seo: {
      metaTitle: '薫トリミング | 犬のトリミングサロン',
      metaDescription:
        'カウンセリング重視・ミントとベージュの清潔感あるサロン。仕上がりギャラリーと分かりやすいメニューをご案内。',
      keywords: 'トリミング, 犬, ドッグサロン, 予約',
      ogImageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1200',
      canonicalUrl: '',
    },
  },
  apparel: genericPlaceholder('アパレルショップ', 'アパレル・ファッション | ブランド', 'コンセプト・コレクション・アクセスをご案内します。'),
  event: genericPlaceholder('イベント', 'イベント・フェス | お申し込み', '概要・プログラム・アクセス・お申し込みをご案内します。'),
  academy_lp: {
    content: {
      siteName: 'REAL GROWTH ACADEMY',
      title: 'REAL GROWTH ACADEMY',
      headline: '実行まで、やり切る。',
      subheadline: '経営者としての基準と実行力を鍛える実践型プログラム',
      ctaLabel: '無料説明会に参加する',
      ctaHref: '#contact',
      sections: [
        { id: 'concept', title: 'このスクールの価値', content: '一流の実践知を学ぶだけでなく、事業に落とし込む実行まで伴走します。' },
        { id: 'menu', title: '4つの特徴', content: '実践設計 / 短いPDCA / 高頻度フィードバック / 同期コミュニティ' },
        { id: 'staff', title: 'フェーズ別ロードマップ', content: '起業前・立ち上げ・成長の各段階で、今やるべきことを整理して進めます。' },
        { id: 'faq', title: 'よくある質問', content: '仕事と両立できる？未経験でも可能？などの疑問に回答します。' },
        { id: 'contact', title: 'お申し込みの流れ', content: 'LINE登録 → 日程調整 → 無料カウンセリング → 個別相談' },
      ],
      footerText: `© ${new Date().getFullYear()} REAL GROWTH ACADEMY`,
      heroSlides: ['https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400'],
    },
    seo: {
      metaTitle: 'REAL GROWTH ACADEMY | 実践型経営スクール',
      metaDescription: '経営者としての基準と実行力を鍛える実践型スクール。',
      keywords: '経営, スクール, 実践, 起業',
      ogImageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200',
      canonicalUrl: '',
    },
  },
  navy_cyan_consult: {
    content: {
      siteName: 'STUDY NAVY',
      title: 'STUDY NAVY',
      headline: '理解が続く、学びの設計。',
      subheadline: 'オンライン講座・個別コンサルで、迷いを減らし次の一歩まで伴走します。',
      ctaLabel: '無料相談を予約する',
      ctaHref: '#contact',
      sections: [
        { id: 'concept', title: 'こんな方におすすめ', content: '独学で行き詰まっている／体系立てて学び直したい／短期で成果の出る計画が欲しい、という方へ。' },
        { id: 'menu', title: '3つの特徴', content: '短時間モジュール設計／復習しやすい資料／質問しやすいサポート体制で、続けやすさを重視しています。' },
        { id: 'staff', title: 'プログラムの流れ', content: 'ヒアリング → カリキュラム提案 → 学習・実践 → 振り返り。ペースは個別に調整します。' },
        { id: 'faq', title: 'よくある質問', content: '受講形式、料金の目安、サポート範囲など、お問い合わせ前の疑問にお答えします。' },
        { id: 'contact', title: 'お問い合わせ', content: 'フォームまたはLINEからご連絡ください。24時間以内にご返信します。' },
      ],
      footerText: `© ${new Date().getFullYear()} STUDY NAVY`,
      heroSlides: ['https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400'],
    },
    seo: {
      metaTitle: 'STUDY NAVY | オンライン講座・コンサル',
      metaDescription: 'ネイビー基調の落ち着いたトーンで、講座・コンサル・セミナーLPに。',
      keywords: '講座, オンライン, コンサル, 学習',
      ogImageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200',
      canonicalUrl: '',
    },
  },
  ramen: {
    content: {
      siteName: '麺屋 こだわり',
      title: '麺屋 こだわり',
      headline: '一杯に、こだわりを。',
      subheadline: 'スープと麺にこだわった一杯をご用意しています。',
      ctaLabel: 'メニューを見る',
      ctaHref: '#menu',
      mapEmbedUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3241.747975468381!2d139.7027863152582!3d35.659545280197!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188b5653d2f8a1%3A0x3f62daad6c2a5342!2z5p2x5Lqs6aeF!5e0!3m2!1sja!2sjp!4v1234567890',
      catalogImages: [
        'https://images.unsplash.com/photo-1569718212165-3a2853992c38?auto=format&fit=crop&w=600',
        'https://images.unsplash.com/photo-1557872943-16a5ac26437e?auto=format&fit=crop&w=600',
        'https://images.unsplash.com/photo-1609909514023-474c5c430c6f?auto=format&fit=crop&w=600',
      ],
      priceRows: [
        { name: '醤油ラーメン', price: '¥850' },
        { name: '味噌ラーメン', price: '¥900' },
        { name: '塩ラーメン', price: '¥850' },
      ],
      sections: [
        {
          id: 'concept',
          title: 'こだわり',
          content:
            '創業より変わらぬ製法で、鶏ガラと豚骨を合わせたスープを一晩かけて仕込みています。中太ストレートの麺は、のど越しとコシのバランスにこだわりました。',
          imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a2853992c38?auto=format&fit=crop&w=800',
        },
        {
          id: 'menu',
          title: 'お品書き',
          content: '人気メニューをご紹介します。替え玉・トッピングもご用意しています。',
        },
        {
          id: 'gallery',
          title: 'お知らせ',
          content: '季節限定メニューや休業日のお知らせを掲載しています。',
        },
        {
          id: 'access',
          title: '店舗',
          content: '東京都〇〇区〇〇 1-2-3\n〇〇駅 徒歩5分\n営業時間：11:00〜15:00、18:00〜22:00\n定休日：水曜',
        },
        { id: 'contact', title: 'お問い合わせ', content: 'ご予約・お問い合わせはお電話にて承っております。' },
      ],
      footerText: `© ${new Date().getFullYear()} 麺屋 こだわり`,
      footerAddress: '東京都〇〇区〇〇 1-2-3',
      footerPhone: '03-XXXX-XXXX',
    },
    seo: {
      metaTitle: '麺屋 こだわり | ラーメン',
      metaDescription: 'スープと麺にこだわった一杯。醤油・味噌・塩ラーメンをご用意しています。',
      keywords: 'ラーメン, 〇〇, 醤油, 味噌',
      ogImageUrl: 'https://images.unsplash.com/photo-1569718212165-3a2853992c38?auto=format&fit=crop&w=1200',
      canonicalUrl: '',
    },
  },
};

/**
 * 全テンプレ × 1バリアントの枠。
 * 各スロットは現状同じ内容のコピー。画像は template-sources/ で差し替え用を用意。
 */
type PresetSlot = { content: PageContent; seo: SEOData };
export const SHOWCASE_PRESETS_6X5: Record<StyleId, PresetSlot[]> = (() => {
  const styleIds = Object.keys(SHOWCASE_BY_STYLE_ID) as StyleId[];
  const out = {} as Record<StyleId, PresetSlot[]>;
  for (const id of styleIds) {
    const base = SHOWCASE_BY_STYLE_ID[id]!;
    out[id] = Array.from({ length: VARIANT_COUNT }, () => ({
      content: structuredClone(base.content),
      seo: structuredClone(base.seo),
    }));
  }
  return out;
})();

/** バリアント指定なしの場合は 0 を参照。旧データの bakery は cafe_tea にマップ */
export function getShowcasePreset(styleId: StyleId, variant?: number): { content: PageContent; seo: SEOData } {
  const normalizedId = ((styleId as string) === 'bakery' ? 'cafe_tea' : styleId) as StyleId;
  const v = variant != null && variant >= 0 && variant < VARIANT_COUNT ? variant : 0;
  const arr = SHOWCASE_PRESETS_6X5[normalizedId]!;
  const p = arr[v] ?? arr[0]!;
  return {
    content: structuredClone(p.content),
    seo: structuredClone(p.seo),
  };
}
