import { useCallback } from 'react';
import { TEMPLATES } from '../lib/templates';
import { buildHtml } from '../lib/buildHtml';
import type { PageContent, SEOData } from '../types';

const SAMPLE_CONTENT: PageContent = {
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

const SAMPLE_SEO: SEOData = {
  metaTitle: 'サンプル店舗 | 6パターン確認',
  metaDescription: 'デザインテンプレートの確認用プレビューです。',
  keywords: 'サンプル, 確認用',
  ogImageUrl: '',
  canonicalUrl: '',
};

/** A-1 確認用：超高級ホテル・エステ向けサンプル（それっぽい文言・フリー素材画像） */
const SAMPLE_CONTENT_A1: PageContent = {
  siteName: 'LA RÉSERVE',
  title: 'LA RÉSERVE',
  headline: 'LA RÉSERVE',
  subheadline: 'Tokyo — Hotel & Spa',
  sections: [
    {
      id: 'concept',
      title: '静寂と再生',
      content:
        '都心の一画に佇む、全28室の隠れ家ホテル。時間を手放し、五感だけを残す。当館のエステティックサロンでは、フランス由来のトリートメントと独自のオーガニックオイルで、肌と心を解きほぐします。',
    },
    {
      id: 'experience',
      title: '体験',
      content:
        'アロマトリートメント／フェイシャル／ボディケア／フットリフレクソロジー。ご予約は専用ラインまたは電話にて承ります。',
    },
    {
      id: 'access',
      title: 'アクセス',
      content: '東京都港区南青山 5-8-12 ラ・リザーブビル 2F　地下鉄表参道駅より徒歩6分',
    },
  ],
  footerText: '© 2025 LA RÉSERVE. All rights reserved.',
};

const SAMPLE_SEO_A1: SEOData = {
  metaTitle: 'LA RÉSERVE — Hotel & Spa | 東京・南青山',
  metaDescription: '都心の隠れ家ホテル＆エステティックサロン。静寂と再生の時間を。',
  keywords: 'ホテル, エステ, 南青山, スパ',
  ogImageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200',
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
    const content = tpl.id === 'minimal_luxury' ? SAMPLE_CONTENT_A1 : SAMPLE_CONTENT;
    const seo = tpl.id === 'minimal_luxury' ? SAMPLE_SEO_A1 : SAMPLE_SEO;
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
