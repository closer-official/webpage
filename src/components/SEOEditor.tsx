import type { SEOData } from '../types';

interface SEOEditorProps {
  seo: SEOData;
  onChange: (seo: SEOData) => void;
  onAutoFill: () => void;
}

export function SEOEditor({ seo, onChange, onAutoFill }: SEOEditorProps) {
  return (
    <div className="panel seo-editor">
      <h2>SEO設定</h2>
      <p className="hint">検索エンジンとSNSシェア用のメタ情報です。自動生成ボタンで内容から推奨値を入れられます。</p>
      <button type="button" className="small primary" onClick={onAutoFill}>
        内容から自動生成
      </button>

      <div className="field">
        <label>タイトル（title タグ）</label>
        <input
          type="text"
          value={seo.metaTitle}
          onChange={(e) => onChange({ ...seo, metaTitle: e.target.value })}
          placeholder="60字程度推奨"
          maxLength={70}
        />
        <span className="char-count">{seo.metaTitle.length}/70</span>
      </div>
      <div className="field">
        <label>メタ説明（description）</label>
        <textarea
          value={seo.metaDescription}
          onChange={(e) => onChange({ ...seo, metaDescription: e.target.value })}
          placeholder="120〜160字程度推奨"
          rows={3}
          maxLength={320}
        />
        <span className="char-count">{seo.metaDescription.length}/320</span>
      </div>
      <div className="field">
        <label>キーワード（カンマ区切り）</label>
        <input
          type="text"
          value={seo.keywords}
          onChange={(e) => onChange({ ...seo, keywords: e.target.value })}
          placeholder="キーワード1, キーワード2"
        />
      </div>
      <div className="field">
        <label>OGP画像URL</label>
        <input
          type="url"
          value={seo.ogImageUrl}
          onChange={(e) => onChange({ ...seo, ogImageUrl: e.target.value })}
          placeholder="https://example.com/ogp.jpg"
        />
      </div>
      <div className="field">
        <label>正規URL（canonical）</label>
        <input
          type="url"
          value={seo.canonicalUrl}
          onChange={(e) => onChange({ ...seo, canonicalUrl: e.target.value })}
          placeholder="https://example.com/"
        />
      </div>
    </div>
  );
}
