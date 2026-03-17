import type { PageContent, PageSection } from '../types';

interface PageEditorProps {
  content: PageContent;
  onChange: (content: PageContent) => void;
}

export function PageEditor({ content, onChange }: PageEditorProps) {
  const update = (part: Partial<PageContent>) => {
    onChange({ ...content, ...part });
  };

  const updateSection = (id: string, patch: Partial<PageSection>) => {
    const sections = content.sections.map((s) =>
      s.id === id ? { ...s, ...patch } : s
    );
    update({ sections });
  };

  const addSection = () => {
    const id = `section-${Date.now()}`;
    update({
      sections: [
        ...content.sections,
        { id, title: '新しいセクション', content: '' },
      ],
    });
  };

  const removeSection = (id: string) => {
    if (content.sections.length <= 1) return;
    update({
      sections: content.sections.filter((s) => s.id !== id),
    });
  };

  return (
    <div className="panel page-editor">
      <h2>ページ内容の編集</h2>

      <div className="field">
        <label>サイト名</label>
        <input
          type="text"
          value={content.siteName}
          onChange={(e) => update({ siteName: e.target.value })}
          placeholder="サイト名"
        />
      </div>
      <div className="field">
        <label>ページタイトル</label>
        <input
          type="text"
          value={content.title}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="ページタイトル"
        />
      </div>
      <div className="field">
        <label>メインヘッドライン</label>
        <input
          type="text"
          value={content.headline}
          onChange={(e) => update({ headline: e.target.value })}
          placeholder="メインヘッドライン"
        />
      </div>
      <div className="field">
        <label>サブコピー・キャッチコピー</label>
        <textarea
          value={content.subheadline}
          onChange={(e) => update({ subheadline: e.target.value })}
          placeholder="サブコピー"
          rows={2}
        />
      </div>

      <div className="sections">
        <div className="section-header">
          <label>セクション</label>
          <button type="button" className="small" onClick={addSection}>
            + 追加
          </button>
        </div>
        {content.sections.map((sec) => (
          <div key={sec.id} className="section-block">
            <input
              type="text"
              className="section-title"
              value={sec.title}
              onChange={(e) => updateSection(sec.id, { title: e.target.value })}
              placeholder="見出し"
            />
            <textarea
              value={sec.content}
              onChange={(e) => updateSection(sec.id, { content: e.target.value })}
              placeholder="本文"
              rows={4}
            />
            <button
              type="button"
              className="small danger"
              onClick={() => removeSection(sec.id)}
              disabled={content.sections.length <= 1}
            >
              削除
            </button>
          </div>
        ))}
      </div>

      <div className="field">
        <label>フッター文言</label>
        <input
          type="text"
          value={content.footerText}
          onChange={(e) => update({ footerText: e.target.value })}
          placeholder="© 2025 サイト名"
        />
      </div>
    </div>
  );
}
