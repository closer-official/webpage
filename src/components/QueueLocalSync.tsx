import { useState, useCallback, useEffect } from 'react';
import { getQueue, setQueue } from '../lib/queueStorage';
import { isApiAvailable, api } from '../lib/api';
import type { QueueTarget } from '../types';

interface QueueLocalSyncProps {
  onSynced: () => void;
}

function queueKey(item: QueueTarget): string {
  return item.placeId || item.id;
}

/** ローカルストレージのキューのみ → サーバーへ送り、フルオート対象にする */
export function QueueLocalSync({ onSynced }: QueueLocalSyncProps) {
  const [localCount, setLocalCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [doneMsg, setDoneMsg] = useState<string | null>(null);

  const refreshCount = useCallback(() => {
    if (!isApiAvailable()) {
      setLocalCount(0);
      return;
    }
    setLocalCount(getQueue().length);
  }, []);

  useEffect(() => {
    refreshCount();
  }, [refreshCount]);

  const handleSync = useCallback(async () => {
    const items = getQueue() as QueueTarget[];
    if (items.length === 0) return;
    setDoneMsg(null);
    setSyncing(true);
    let newOk = 0;
    let skipped = 0;
    let failed = 0;
    const removeKeys = new Set<string>();

    try {
      for (const item of items) {
        const key = queueKey(item);
        try {
          const res = (await api.addToQueue({
            source: item.source,
            name: item.name,
            address: item.address,
            placeId: item.placeId,
            notes: item.notes || '',
            signals: item.signals,
            category: item.category,
            searchQuery: item.searchQuery || '',
            rating: item.signals.rating,
            userRatingsTotal: item.signals.userRatingsTotal,
            hasOpeningHours: item.signals.hasOpeningHours,
            hasPhoto: item.signals.hasPhoto,
            reviews: [],
          })) as { alreadyInQueue?: boolean };
          removeKeys.add(key);
          if (res?.alreadyInQueue) skipped += 1;
          else newOk += 1;
        } catch {
          failed += 1;
        }
      }

      const remaining = items.filter((i) => !removeKeys.has(queueKey(i)));
      setQueue(remaining);
      setLocalCount(remaining.length);
      onSynced();

      if (newOk + skipped === 0 && failed > 0) {
        setDoneMsg('サーバーへ送れませんでした。VITE_API_URL・サーバー起動・ネットワークを確認してください。');
      } else {
        setDoneMsg(
          `サーバーへ反映しました（新規 ${newOk} 件、既にサーバーにあったためスキップ ${skipped} 件${
            failed ? `、失敗 ${failed} 件（ローカルに残しています）` : ''
          }）。フルオートが使えます。`
        );
      }
      setTimeout(() => setDoneMsg(null), 10000);
    } finally {
      setSyncing(false);
    }
  }, [onSynced]);

  if (!isApiAvailable() || localCount === 0) return null;

  return (
    <div className="panel queue-local-sync" style={{ marginBottom: 16, borderColor: 'var(--accent, #2563eb)' }}>
      <p className="hint" style={{ marginTop: 0 }}>
        <strong>ブラウザにだけ保存されているキューが {localCount} 件あります。</strong>
        フルオートは<strong>サーバー上のキュー</strong>しか処理しません。このままでは自動処理が空振りします。
      </p>
      <button type="button" className="primary" onClick={handleSync} disabled={syncing}>
        {syncing ? '送信中…' : 'このキューをサーバーへ送る（フルオート対象にする）'}
      </button>
      {doneMsg && (
        <p className="hint" style={{ marginTop: 8, color: 'var(--ok, #15803d)' }}>
          {doneMsg}
        </p>
      )}
    </div>
  );
}
