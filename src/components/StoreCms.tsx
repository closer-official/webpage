import { useState, useCallback } from 'react';
import type { DashboardItem, PageContent, SEOData, PageSection } from '../types';
import { api, isApiAvailable, getPreviewPublicUrl } from '../lib/api';
import { getEffectiveCanonicalForBuild } from '../lib/seo';

function linesToUrls(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function urlsToLines(urls: string[] | undefined): string {
  return (urls ?? []).join('\n');
}

interface StoreCmsProps {
  items: DashboardItem[];
  onRefresh: () => void;
}

export function StoreCms({ items, onRefresh }: StoreCmsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<PageContent | null>(null);
  const [seo, setSeo] = useState<SEOData | null>(null);

  const editingItem = editingId ? items.find((i) => i.id === editingId) : null;

  const startEdit = useCallback(
    (item: DashboardItem) => {
      setEditingId(item.id);
      setContent(JSON.parse(JSON.stringify(item.content)));
      setSeo(JSON.parse(JSON.stringify(item.seo)));
      setError(null);
    },
    []
  );

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setContent(null);
    setSeo(null);
    setError(null);
  }, []);

  const updateContent = useCallback((patch: Partial<PageContent>) => {
    setContent((prev) => (prev ? { ...prev, ...patch } : null));
  }, []);

  const updateSeo = useCallback((patch: Partial<SEOData>) => {
    setSeo((prev) => (prev ? { ...prev, ...patch } : null));
  }, []);

  const updateSection = useCallback((index: number, patch: Partial<PageSection>) => {
    setContent((prev) => {
      if (!prev || !prev.sections) return prev;
      const next = [...prev.sections];
      next[index] = { ...next[index], ...patch };
      return { ...prev, sections: next };
    });
  }, []);

  const pickImageForSection = useCallback(
    (index: number, file: File | null) => {
      if (!file || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        const url = typeof reader.result === 'string' ? reader.result : '';
        if (url) updateSection(index, { imageUrl: url });
      };
      reader.readAsDataURL(file);
    },
    [updateSection]
  );

  const handleSave = useCallback(async () => {
    if (!editingId || !content) return;
    if (!isApiAvailable()) {
      setError('保存するにはサーバーに接続してください。');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await api.updateDashboardContent(editingId, content, seo ?? undefined);
      onRefresh();
      cancelEdit();
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  }, [editingId, content, seo, onRefresh, cancelEdit]);

  // 一覧表示（一時的に全件表示。のちに cms オプション有効のみに絞る）
  if (!editingItem && !editingId) {
    return (
      <div className="panel store-cms">
        <h2>管理者画面</h2>
        <p className="store-cms-hint">
          アクセス数の確認、文言・写真の差し替えができます。（現在は全店舗表示・のちにオプション加入店のみに制限予定）
        </p>
        <p className="store-cms-hint" style={{ marginTop: 8 }}>
          店舗ドメイン運用時は <strong>トップが店舗LP</strong>、ツールの管理画面は{' '}
          <code>/admin/</code> です（例: <code>https://店舗名.store-official.net/admin/</code>）。ジムLP（gym-valx）専用の編集・閲覧数は{' '}
          <a href="/admin/gym-lp.html" target="_blank" rel="noopener noreferrer">
            /admin/gym-lp.html
          </a>
          からも行えます。
        </p>
        {items.length === 0 ? (
          <p className="store-cms-empty">ダッシュボードに案件がありません。</p>
        ) : (
          <ul className="store-cms-list">
            {items.map((item) => (
              <li key={item.id} className="store-cms-card">
                <div className="store-cms-card-main">
                  <span className="store-cms-name">{item.content?.siteName ?? item.researched?.name ?? '—'}</span>
                  <span className="store-cms-views">閲覧数: {item.viewCount ?? 0}</span>
                </div>
                <div className="store-cms-card-actions">
                  <a
                    href={getPreviewPublicUrl(item.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="store-cms-btn store-cms-btn-preview"
                  >
                    プレビューを開く
                  </a>
                  <button type="button" className="store-cms-btn store-cms-btn-edit" onClick={() => startEdit(item)}>
                    編集
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // 編集フォーム
  if (!content || !editingItem) return null;

  return (
    <div className="panel store-cms store-cms-edit">
      <div className="store-cms-edit-header">
        <h2>編集: {content.siteName || editingItem.researched?.name}</h2>
        <div className="store-cms-edit-actions">
          <button type="button" className="store-cms-btn" onClick={cancelEdit}>
            キャンセル
          </button>
          <button type="button" className="store-cms-btn store-cms-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? '保存中…' : '保存'}
          </button>
        </div>
      </div>
      {error && <p className="store-cms-error">{error}</p>}

      <section className="store-cms-form-section">
        <h3>基本情報</h3>
        <label>
          店名・サイト名
          <input
            type="text"
            value={content.siteName}
            onChange={(e) => updateContent({ siteName: e.target.value })}
            placeholder="店名"
          />
        </label>
        <label>
          ページタイトル（SEO）
          <input
            type="text"
            value={content.title}
            onChange={(e) => updateContent({ title: e.target.value })}
            placeholder="タイトル"
          />
        </label>
        <label>
          キャッチコピー
          <input
            type="text"
            value={content.headline}
            onChange={(e) => updateContent({ headline: e.target.value })}
            placeholder="メインの見出し"
          />
        </label>
        <label>
          サブコピー
          <input
            type="text"
            value={content.subheadline}
            onChange={(e) => updateContent({ subheadline: e.target.value })}
            placeholder="補足"
          />
        </label>
      </section>

      {seo && (
        <section className="store-cms-form-section">
          <h3>SEO（検索用）</h3>
          <label>
            メタタイトル
            <input
              type="text"
              value={seo.metaTitle}
              onChange={(e) => updateSeo({ metaTitle: e.target.value })}
              placeholder="検索結果に表示されるタイトル"
            />
          </label>
          <label>
            メタ説明
            <textarea
              value={seo.metaDescription}
              onChange={(e) => updateSeo({ metaDescription: e.target.value })}
              placeholder="検索結果の説明文"
              rows={2}
            />
          </label>
          <label>
            OG画像URL（SNSでシェア時の画像）
            <input
              type="text"
              value={seo.ogImageUrl}
              onChange={(e) => updateSeo({ ogImageUrl: e.target.value })}
              placeholder="https://..."
            />
          </label>
          <label>
            正規URL（canonical）— 空欄なら「自動用親ドメイン」から店名サブドメインを生成
            <input
              type="url"
              value={seo.canonicalUrl}
              onChange={(e) => updateSeo({ canonicalUrl: e.target.value })}
              placeholder="https://example.com/"
            />
          </label>
          <label>
            自動用親ドメイン（例: closer-official.com ・ store-official.net）
            <input
              type="text"
              value={seo.autoCanonicalHost ?? ''}
              onChange={(e) =>
                updateSeo({ autoCanonicalHost: e.target.value.trim() || undefined })
              }
              placeholder="未設定時は .env の VITE_AUTO_CANONICAL_HOST / event は event-view.net"
            />
          </label>
          {editingItem && content ? (
            <p className="hint" style={{ marginTop: '0.5rem' }}>
              <strong>解決後の正規URL（プレビュー）:</strong>{' '}
              {getEffectiveCanonicalForBuild(seo, content.siteName, editingItem.templateId) || '—（親ドメイン未設定で自動生成なし）'}
            </p>
          ) : null}
        </section>
      )}

      <section className="store-cms-form-section">
        <h3>セクション（ブロックごとの文章・写真）</h3>
        {content.sections && content.sections.length > 0 ? (
          <ul className="store-cms-sections">
            {content.sections.map((sec, idx) => (
              <li key={sec.id || idx} className="store-cms-section-item">
                <h4>セクション {idx + 1}: {sec.title || sec.id || '無題'}</h4>
                <label>
                  見出し
                  <input
                    type="text"
                    value={sec.title}
                    onChange={(e) => updateSection(idx, { title: e.target.value })}
                    placeholder="見出し"
                  />
                </label>
                <label>
                  本文
                  <textarea
                    value={sec.content}
                    onChange={(e) => updateSection(idx, { content: e.target.value })}
                    placeholder="本文"
                    rows={4}
                  />
                </label>
        <label>
                  画像URL（差し替え用）
                  <input
                    type="text"
                    value={sec.imageUrl?.startsWith('data:') ? '' : (sec.imageUrl ?? '')}
                    onChange={(e) => updateSection(idx, { imageUrl: e.target.value.trim() || undefined })}
                    placeholder={
                      sec.imageUrl?.startsWith('data:')
                        ? '端末画像設定中。URLを入力すると差し替え'
                        : 'https://... または下でファイル選択'
                    }
                  />
                </label>
                {sec.imageUrl?.startsWith('data:') && (
                  <p className="store-cms-dataurl-note">端末から選択した画像が使われています。URLを入力すると差し替わります。</p>
                )}
                <label className="store-cms-file-row">
                  <span className="store-cms-file-label">または画像ファイルを選択</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="store-cms-file-input"
                    onChange={(e) => pickImageForSection(idx, e.target.files?.[0] ?? null)}
                  />
                </label>
                {sec.imageUrl && (
                  <div className="store-cms-section-preview">
                    <img src={sec.imageUrl} alt="" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="store-cms-empty">セクションがありません。</p>
        )}
      </section>

      <section className="store-cms-form-section">
        <h3>ファーストビュー画像（カフェ等・複数は1行1URL）</h3>
        <label>
          画像URL一覧
          <textarea
            value={urlsToLines(content.heroSlides)}
            onChange={(e) => updateContent({ heroSlides: linesToUrls(e.target.value) })}
            placeholder="https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg"
            rows={3}
          />
        </label>
      </section>

      <section className="store-cms-form-section">
        <h3>ヘアカタログ等の複数画像（美容室など・1行1URL）</h3>
        <label>
          画像URL一覧
          <textarea
            value={urlsToLines(content.catalogImages)}
            onChange={(e) => updateContent({ catalogImages: linesToUrls(e.target.value) })}
            placeholder="https://..."
            rows={4}
          />
        </label>
      </section>

      <section className="store-cms-form-section">
        <h3>引用文（あるテンプレで表示）</h3>
        <label>
          引用
          <textarea
            value={content.quote ?? ''}
            onChange={(e) => updateContent({ quote: e.target.value || undefined })}
            placeholder="キャッチな引用があれば"
            rows={2}
          />
        </label>
      </section>

      <section className="store-cms-form-section">
        <h3>フッター・連絡先</h3>
        <label>
          フッター文言
          <textarea
            value={content.footerText}
            onChange={(e) => updateContent({ footerText: e.target.value })}
            rows={2}
          />
        </label>
        <label>
          住所
          <input
            type="text"
            value={content.footerAddress ?? ''}
            onChange={(e) => updateContent({ footerAddress: e.target.value || undefined })}
            placeholder="住所"
          />
        </label>
        <label>
          電話
          <input
            type="text"
            value={content.footerPhone ?? ''}
            onChange={(e) => updateContent({ footerPhone: e.target.value || undefined })}
            placeholder="03-xxxx-xxxx"
          />
        </label>
        <label>
          メール
          <input
            type="email"
            value={content.footerEmail ?? ''}
            onChange={(e) => updateContent({ footerEmail: e.target.value || undefined })}
            placeholder="info@example.com"
          />
        </label>
      </section>

      <section className="store-cms-form-section">
        <h3>メインのボタン（予約・お問い合わせなど）</h3>
        <label>
          ボタン文言
          <input
            type="text"
            value={content.ctaLabel ?? ''}
            onChange={(e) => updateContent({ ctaLabel: e.target.value || undefined })}
            placeholder="オンライン予約"
          />
        </label>
        <label>
          リンク先（#contact や https://...）
          <input
            type="text"
            value={content.ctaHref ?? ''}
            onChange={(e) => updateContent({ ctaHref: e.target.value || undefined })}
            placeholder="#contact"
          />
        </label>
      </section>

      <div className="store-cms-edit-footer">
        <button type="button" className="store-cms-btn" onClick={cancelEdit}>
          キャンセル
        </button>
        <button type="button" className="store-cms-btn store-cms-btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? '保存中…' : '保存'}
        </button>
      </div>
    </div>
  );
}
