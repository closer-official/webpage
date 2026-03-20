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
              <p><strong>{it.storeName}</strong> / {it.contactName}（{it.contactMethod}: {it.contactValue}）</p>
              <p>テンプレ: <code>{it.chosenTemplateId}</code> / 受付: {new Date(it.createdAt).toLocaleString('ja-JP')}</p>
              {it.mustHaveContent && <p>載せたい内容: {it.mustHaveContent.slice(0, 120)}{it.mustHaveContent.length > 120 ? '…' : ''}</p>}
              <p>
                プレビュー: <a href={it.previewUrl} target="_blank" rel="noopener noreferrer">{it.previewUrl}</a>
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
