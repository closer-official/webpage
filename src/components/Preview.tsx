import { useRef, useEffect } from 'react';
import type { PageContent, SEOData } from '../types';
import type { TemplateOption } from '../types';
import { buildHtml } from '../lib/buildHtml';

interface PreviewProps {
  content: PageContent;
  seo: SEOData;
  template: TemplateOption | null;
}

export function Preview({ content, seo, template }: PreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current || !template) return;
    const html = buildHtml(content, seo, template);
    iframeRef.current.srcdoc = html;
  }, [content, seo, template]);

  if (!template) {
    return (
      <div className="panel preview preview-empty">
        <p>デザインを選択するとプレビューが表示されます。</p>
      </div>
    );
  }

  return (
    <div className="panel preview">
      <h2>プレビュー</h2>
      <div className="preview-frame-wrap">
        <iframe
          ref={iframeRef}
          title="ページプレビュー"
          className="preview-frame"
          sandbox="allow-same-origin"
        />
      </div>
    </div>
  );
}
