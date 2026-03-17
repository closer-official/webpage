import { useCallback } from 'react';
import { TEMPLATES } from '../lib/templates';
import { buildHtml } from '../lib/buildHtml';
import type { PageContent, SEOData } from '../types';

/** テンプレートIDごとのサンプル（雰囲気に合う文言・Unsplash画像） */
const SAMPLE_BY_TEMPLATE: Record<
  string,
  { content: PageContent; seo: SEOData }
> = {
  minimal_luxury: {
    content: {
      siteName: 'LA RÉSERVE',
      title: 'LA RÉSERVE',
      headline: 'LA RÉSERVE',
      subheadline: 'Tokyo — Hotel & Spa',
      quote: '時間を、手放す。',
      sections: [
        {
          id: 'concept',
          title: '静寂と再生',
          content:
            '都心の一画に佇む、全28室の隠れ家ホテル。時間を手放し、五感だけを残す。当館のエステティックサロンでは、フランス由来のトリートメントと独自のオーガニックオイルで、肌と心を解きほぐします。',
          imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800',
        },
        {
          id: 'experience',
          title: '体験',
          content:
            'アロマトリートメント／フェイシャル／ボディケア／フットリフレクソロジー。ご予約は専用ラインまたは電話にて承ります。',
          imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800',
        },
        {
          id: 'access',
          title: 'アクセス',
          content: '東京都港区南青山 5-8-12 ラ・リザーブビル 2F　地下鉄表参道駅より徒歩6分',
        },
      ],
      footerText: '© 2025 LA RÉSERVE. All rights reserved.',
      ctaLabel: 'ご予約はこちら',
      ctaHref: '#reserve',
      footerAddress: '東京都港区南青山 5-8-12',
      footerPhone: '03-XXXX-XXXX',
      footerEmail: 'reserve@example.com',
    },
    seo: {
      metaTitle: 'LA RÉSERVE — Hotel & Spa | 東京・南青山',
      metaDescription: '都心の隠れ家ホテル＆エステティックサロン。静寂と再生の時間を。',
      keywords: 'ホテル, エステ, 南青山, スパ',
      ogImageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200',
      canonicalUrl: '',
    },
  },
  dark_edge: {
    content: {
      siteName: 'VOID',
      title: 'VOID',
      headline: 'VOID',
      subheadline: 'NIGHT BAR & LOUNGE',
      sections: [
        {
          id: 'concept',
          title: 'CONCEPT',
          content:
            '光を消した先にある、もう一つの時間。都心の地下に潜るようにして辿り着く、28席だけのバー。厳選したスピリッツと、その夜だけの音で、境界を溶かす。',
          imageUrl: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=800',
        },
        {
          id: 'reserve',
          title: 'RESERVE',
          content: '完全予約制。前日までにウェブまたは電話にてご予約ください。ドレスコード：スマートカジュアル。',
        },
        {
          id: 'access',
          title: 'ACCESS',
          content: '東京都渋谷区道玄坂 2-XX-X B1F　渋谷駅より徒歩8分',
        },
      ],
      footerText: '© 2025 VOID. All rights reserved.',
      ctaLabel: 'RESERVE',
      ctaHref: '#reserve',
      footerAddress: '東京都渋谷区道玄坂 2-XX-X B1F',
      footerPhone: '03-XXXX-XXXX',
    },
    seo: {
      metaTitle: 'VOID — Night Bar & Lounge | 渋谷',
      metaDescription: '光を消した先の、もう一つの時間。完全予約制ナイトバー。',
      keywords: 'バー, ラウンジ, 渋谷, 予約制',
      ogImageUrl: 'https://images.unsplash.com/photo-1514933653103-974c4e9b2c3b?auto=format&fit=crop&w=1200',
      canonicalUrl: '',
    },
  },
  corporate_trust: {
    content: {
      siteName: '山田コンサルティング',
      title: '山田コンサルティング',
      headline: '山田コンサルティング',
      subheadline: '経営戦略・組織人事のパートナー',
      stats: [
        { value: '25年', label: '創業' },
        { value: '300社+', label: '支援実績' },
        { value: '98%', label: '継続率' },
      ],
      sections: [
        {
          id: 'concept',
          title: '私たちの強み',
          content:
            '創業25年、上場企業から中堅・中小企業まで、経営戦略の策定と実行支援、組織・人事制度の設計を一貫してサポートしています。',
          imageUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800',
        },
        {
          id: 'service',
          title: 'サービス',
          content:
            '経営戦略策定／M&Aアドバイザリー／組織設計・人事制度構築／リーダーシップ研修。まずはお気軽にご相談ください。',
          imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800',
        },
        {
          id: 'access',
          title: 'アクセス',
          content: '東京都千代田区丸の内 1-XX-X 丸の内ビルディング 15F　JR東京駅直結',
        },
      ],
      footerText: '© 2025 山田コンサルティング. All rights reserved.',
      ctaLabel: '無料相談',
      ctaHref: '#contact',
      footerAddress: '東京都千代田区丸の内 1-XX-X',
      footerPhone: '03-XXXX-XXXX',
      footerEmail: 'info@example.com',
    },
    seo: {
      metaTitle: '山田コンサルティング | 経営戦略・組織人事',
      metaDescription: '経営戦略と組織・人事の設計で、企業の持続的成長を支援します。',
      keywords: 'コンサルティング, 経営戦略, 組織設計, 人事制度',
      ogImageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200',
      canonicalUrl: '',
    },
  },
  warm_organic: {
    content: {
      siteName: 'café ことの葉',
      title: 'café ことの葉',
      headline: 'café ことの葉',
      subheadline: '自家焙煎と、季節のあんこ',
      quote: 'ちょっとだけ、甘い休憩を。',
      sections: [
        {
          id: 'concept',
          title: 'こだわり',
          content:
            '町の焙煎所がはじめた、ちょっとだけ甘い休憩場所。豆は自家焙煎で、あんこは旬の小豆を炊いて毎日つくっています。',
          imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800',
        },
        {
          id: 'menu',
          title: 'メニュー',
          content:
            'ブレンドコーヒー／単品豆／あんこトースト／季節のあんみつ／ケーキ各種。テイクアウトもご用意しています。',
          imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800',
        },
        {
          id: 'access',
          title: 'アクセス',
          content: '東京都世田谷区奥沢 5-XX-X　東急大井町線・目黒線 奥沢駅より徒歩3分',
        },
      ],
      footerText: '© 2025 café ことの葉. All rights reserved.',
      ctaLabel: '予約する',
      ctaHref: '#reserve',
      footerAddress: '東京都世田谷区奥沢 5-XX-X',
      footerPhone: '03-XXXX-XXXX',
    },
    seo: {
      metaTitle: 'café ことの葉 | 奥沢の自家焙煎カフェ',
      metaDescription: '自家焙煎コーヒーと季節のあんこが嬉しい、奥沢のカフェです。',
      keywords: 'カフェ, 奥沢, 自家焙煎, あんこ',
      ogImageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200',
      canonicalUrl: '',
    },
  },
  pop_friendly: {
    content: {
      siteName: 'POP KIDS',
      title: 'POP KIDS',
      headline: 'POP KIDS',
      subheadline: 'キッズ＆ママのあそび場',
      sections: [
        {
          id: 'concept',
          title: 'あそび場について',
          content:
            '雨の日も晴れの日も、思いっきり体を動かせる室内あそび場。ボールプール、トランポリン、工作コーナーに、お誕生日会もできるパーティルーム。',
          imageUrl: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800',
        },
        {
          id: 'info',
          title: '利用案内',
          content:
            '対象：0歳〜小学生。入場料は1時間〜。予約優先・当日も空きがあればご利用可能。オムツ替えスペース・授乳室あり。',
          imageUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=800',
        },
        {
          id: 'access',
          title: 'アクセス',
          content: '東京都練馬区大泉学園 3-XX-X キッズビル 2F　大泉学園駅より徒歩5分',
        },
      ],
      footerText: '© 2025 POP KIDS. All rights reserved.',
      ctaLabel: '予約はこちら',
      ctaHref: '#reserve',
      footerAddress: '東京都練馬区大泉学園 3-XX-X',
      footerPhone: '03-XXXX-XXXX',
    },
    seo: {
      metaTitle: 'POP KIDS | キッズあそび場 練馬・大泉学園',
      metaDescription: 'キッズ＆ママの室内あそび場。ボールプール・トランポリン・工作・お誕生日会。',
      keywords: 'キッズ, あそび場, 練馬, 大泉学園, 室内',
      ogImageUrl: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=1200',
      canonicalUrl: '',
    },
  },
  high_energy: {
    content: {
      siteName: 'FIRE GYM',
      title: 'FIRE GYM',
      headline: 'FIRE GYM',
      subheadline: '結果にコミットする、パーソナルジム',
      stats: [
        { value: '3ヶ月', label: 'で結果' },
        { value: '90分', label: '集中トレーニング' },
        { value: '1on1', label: '専属トレーナー' },
      ],
      sections: [
        {
          id: 'concept',
          title: 'フィアの考え方',
          content:
            '週2回・90分の集中トレーニングと、食事管理で、3ヶ月でカラダを変える。専属トレーナーがマンツーマンで伴走します。',
          imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800',
        },
        {
          id: 'program',
          title: 'プログラム',
          content:
            'ボディメイク／ダイエット／姿勢改善／競技者向け強化。入会金・月額はプログラムにより異なります。まずは体験から。',
          imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800',
        },
        {
          id: 'access',
          title: 'アクセス',
          content: '東京都新宿区西新宿 7-XX-X 新宿フィアビル 3F　新宿駅西口より徒歩6分',
        },
      ],
      footerText: '© 2025 FIRE GYM. All rights reserved.',
      ctaLabel: '無料体験',
      ctaHref: '#trial',
      footerAddress: '東京都新宿区西新宿 7-XX-X',
      footerPhone: '03-XXXX-XXXX',
    },
    seo: {
      metaTitle: 'FIRE GYM | パーソナルジム 新宿',
      metaDescription: '3ヶ月で結果を出すパーソナルジム。専属トレーナーがマンツーマンでサポート。',
      keywords: 'パーソナルジム, 新宿, ダイエット, ボディメイク',
      ogImageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200',
      canonicalUrl: '',
    },
  },
};

const SAMPLE_DEFAULT: PageContent = {
  siteName: 'サンプル店舗',
  title: 'サンプル店舗',
  headline: 'サンプル店舗',
  subheadline: '6パターン確認用のプレビューです。',
  sections: [
    { id: 'concept', title: 'コンセプト', content: 'このテンプレートの雰囲気を確認できます。' },
    { id: 'strengths', title: '私たちの強み', content: '実際のLPではここに店舗の強みが入ります。' },
    { id: 'access', title: 'アクセス', content: '〇〇県〇〇市〇〇 1-2-3' },
  ],
  footerText: '© 2025 サンプル店舗. All rights reserved.',
};

const SAMPLE_SEO_DEFAULT: SEOData = {
  metaTitle: 'サンプル店舗 | 6パターン確認',
  metaDescription: 'デザインテンプレートの確認用プレビューです。',
  keywords: 'サンプル, 確認用',
  ogImageUrl: '',
  canonicalUrl: '',
};

const PREVIEW_BG: Record<string, string> = {
  minimal_luxury: '#F9F9F7',
  dark_edge: '#080808',
  corporate_trust: '#f8fafc',
  warm_organic: '#FDFBF7',
  pop_friendly: '#fef08a',
  high_energy: '#fff',
};

const PREVIEW_COLOR: Record<string, string> = {
  minimal_luxury: '#1A1A1A',
  dark_edge: '#fff',
  corporate_trust: '#1e293b',
  warm_organic: '#3d2914',
  pop_friendly: '#1a1a1a',
  high_energy: '#0f0f0f',
};

export function DesignCheckPanel() {
  const openPreview = useCallback((tpl: (typeof TEMPLATES)[number]) => {
    const sample = SAMPLE_BY_TEMPLATE[tpl.id];
    const content = sample ? sample.content : SAMPLE_DEFAULT;
    const seo = sample ? sample.seo : SAMPLE_SEO_DEFAULT;
    const html = buildHtml(content, seo, tpl);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }, []);

  return (
    <div className="panel theme-picker theme-picker-design design-check-panel">
      <h2 className="design-step-label">⓪ デザイン</h2>
      <p className="design-step-desc">
        6パターンが正しくできているか確認するためのページです。クリックするとそのデザインのプレビューが別タブで開きます。
      </p>
      <ul className="design-list" aria-label="デザインパターン一覧">
        {TEMPLATES.map((tpl, i) => (
          <li key={tpl.id}>
            <button
              type="button"
              className="design-card design-card-preview-only"
              onClick={() => openPreview(tpl)}
            >
              <span className="design-card-index">{i + 1}</span>
              <span className="design-card-name">{tpl.name}</span>
              <span className="design-card-desc">{tpl.description}</span>
              <div
                className="design-card-preview"
                style={{
                  background: PREVIEW_BG[tpl.id] ?? '#fff',
                  color: PREVIEW_COLOR[tpl.id] ?? '#333',
                }}
              >
                Aa
              </div>
              <span className="design-card-action">別タブでプレビューを開く</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
