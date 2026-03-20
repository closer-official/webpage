import { useCallback, useEffect, useState } from 'react';
import { api, isApiAvailable, type CustomerIntakeItem } from '../lib/api';

export function CustomerIntakePanel() {
  const [items, setItems] = useState<CustomerIntakeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isApiAvailable()) return;
    setLoading(true);
    setError(null);
    try {
      const list = await api.getCustomerIntakeList();
      setItems(list || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : '取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section className="tab-content">
      <p className="tab-hint">顧客が入力したヒアリング回答の一覧です。あなた（管理者ログイン済み）のみ閲覧できます。</p>
      <button type="button" className="small" onClick={load} disabled={loading}>
        {loading ? '更新中...' : '一覧を更新'}
      </button>
      {error && <p className="error">{error}</p>}
      {items.length === 0 ? (
        <p className="hint">まだ回答はありません。</p>
      ) : (
        <ul className="queue-list" style={{ marginTop: 12 }}>
          {items.map((it) => (
            <li key={it.id} className="queue-item">
              <p>
                <strong>{it.storeName}</strong> / {it.contactName}（{it.contactMethod}: {it.contactValue}）
              </p>
              <p>
                状態: <strong>{it.status === 'draft' ? '途中保存' : '送信済み'}</strong>
                {' / '}テンプレ: <code>{it.chosenTemplateId}</code>
                {' / '}受付: {new Date(it.createdAt).toLocaleString('ja-JP')}
              </p>
              <details style={{ marginTop: 8 }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>回答詳細を開く</summary>
                <div style={{ marginTop: 8 }}>
                  <p><strong>目的:</strong> {it.websiteGoal || '-'}</p>
                  <p><strong>ターゲット:</strong> {it.targetAudience || '-'}</p>
                  <p><strong>デザイン希望:</strong> {(it.designTastes && it.designTastes.length) ? it.designTastes.join(' / ') : '-'}</p>
                  <p><strong>メインカラー:</strong> {it.mainColor || '-'}</p>
                  <p><strong>載せたい内容:</strong> {it.mustHaveContent || '-'}</p>
                  <p><strong>参考サイトURL:</strong> {it.favoriteSiteUrl || '-'}</p>
                  <p><strong>現在の活動URL:</strong> {it.currentActivityUrl || '-'}</p>
                  <p><strong>テイスト補足:</strong> {it.styleDetail || '-'}</p>
                  <p><strong>その他補足:</strong> {it.requestSummary || '-'}</p>
                </div>
              </details>
              <p>
                プレビュー: <a href={it.previewUrl} target="_blank" rel="noopener noreferrer">{it.previewUrl}</a>
              </p>
              {it.styleDraftTemplateId && (
                <p>
                  参考URLからのテンプレ下書き:{' '}
                  <a
                    href={`/api/template-preview/${encodeURIComponent(it.styleDraftTemplateId)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {it.styleDraftTemplateId}
                  </a>{' '}
                  （公開承認後にヒアリング候補へ）
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
