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
    </div>
  );
}
