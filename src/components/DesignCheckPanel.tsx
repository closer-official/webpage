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

const PREVIEW_BG: Record<string, string> = {
  minimal_luxury: '#FAFAFA',
  dark_edge: '#080808',
  corporate_trust: '#f8fafc',
  warm_organic: '#FDFBF7',
  pop_friendly: '#fef08a',
  high_energy: '#fff',
};

const PREVIEW_COLOR: Record<string, string> = {
  minimal_luxury: '#111',
  dark_edge: '#fff',
  corporate_trust: '#1e293b',
  warm_organic: '#3d2914',
  pop_friendly: '#1a1a1a',
  high_energy: '#0f0f0f',
};

export function DesignCheckPanel() {
  const openPreview = useCallback((tpl: (typeof TEMPLATES)[number]) => {
    const html = buildHtml(SAMPLE_CONTENT, SAMPLE_SEO, tpl);
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
