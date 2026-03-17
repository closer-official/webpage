import { removeFromQueue } from '../lib/queueStorage';
import { isApiAvailable, api } from '../lib/api';
import type { QueueTarget } from '../types';

interface QueueListProps {
  queue: QueueTarget[];
  onRefresh: () => void;
  onResearch: (target: QueueTarget) => void;
  useApi?: boolean;
}

export function QueueList({ queue, onRefresh, onResearch, useApi }: QueueListProps) {
  const handleRemove = async (id: string) => {
    if (useApi && isApiAvailable()) {
      await api.removeFromQueue(id);
    } else {
      removeFromQueue(id);
    }
    onRefresh();
  };

  if (queue.length === 0) {
    return (
      <div className="panel queue-list">
        <h2>キュー</h2>
        <p className="hint">Google Maps で取得するか、手動で追加するとここに表示されます。</p>
      </div>
    );
  }

  return (
    <div className="panel queue-list">
      <div className="queue-header">
        <h2>キュー（{queue.length} 件）</h2>
        <button type="button" className="small" onClick={onRefresh}>
          更新
        </button>
      </div>
      <ul className="queue-items">
        {queue.map((t) => (
          <li key={t.id} className="queue-item">
            <div className="queue-item-main">
              <span className="queue-name">{t.name}</span>
              <span className="queue-meta">
                {t.source === 'google_maps' ? 'Maps' : '手動'}
                {t.signals.userRatingsTotal != null && ` · レビュー ${t.signals.userRatingsTotal} 件`}
                {t.signals.needsVerification && (
                  <span className="badge-warn" title="レビューが少ないため実在確認を推奨">要確認</span>
                )}
              </span>
              {t.address && <span className="queue-address">{t.address}</span>}
            </div>
            <div className="queue-item-actions">
              {t.signals.mapsUrl && (
                <a href={t.signals.mapsUrl} target="_blank" rel="noopener noreferrer" className="link-maps small">
                  Maps
                </a>
              )}
              <button type="button" className="small primary" onClick={() => onResearch(t)}>
                調査
              </button>
              <button type="button" className="small danger" onClick={() => handleRemove(t.id)}>
                削除
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
