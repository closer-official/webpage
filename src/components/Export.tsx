import type { PageContent, SEOData } from '../types';
import type { TemplateOption } from '../types';
import { buildHtml } from '../lib/buildHtml';

interface ExportProps {
  content: PageContent;
  seo: SEOData;
  template: TemplateOption | null;
}

export function Export({ content, seo, template }: ExportProps) {
  const handleExport = () => {
    if (!template) return;
    const html = buildHtml(content, seo, template);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `page-${content.title || 'export'}.html`.replace(/\s+/g, '-');
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleWarmOrganicPresetJson = () => {
    const payload = { content, seo };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'warm-organic-showcase.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const isWarmOrganic = template?.id === 'warm_organic';

  return (
    <div className="panel export-panel">
      <h2>エクスポート</h2>
      <p className="hint">SEOメタタグ・OGP・構造化データを含む単一HTMLファイルをダウンロードします。</p>
      <button
        type="button"
        className="primary export-button"
        onClick={handleExport}
        disabled={!template}
      >
        HTMLをダウンロード
      </button>
      {isWarmOrganic && (
        <>
          <p className="hint" style={{ marginTop: '1rem' }}>
            テンプレ4のショーケースとして残すとき：
            <code> warm-organic-showcase.json </code>
            をダウンロードし、プロジェクトの
            <code> src/data/warm-organic-showcase.json </code>
            に上書き保存してください。⓪デザインのプレビューにも反映されます。
          </p>
          <button type="button" className="export-button secondary" onClick={handleWarmOrganicPresetJson}>
            テンプレ4用JSONをダウンロード（上書き用）
          </button>
        </>
      )}
    </div>
  );
}
