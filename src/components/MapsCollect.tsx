import { useState, useCallback } from 'react';
import { searchPlacesNoWebsite, isMapsConfigured, candidateToVerificationSignals } from '../lib/maps';
import type { MapsPlaceCandidate } from '../lib/maps';
import { addToQueue } from '../lib/queueStorage';

const MIN_REVIEW_OPTIONS = [
  { value: 0, label: '制限なし' },
  { value: 1, label: 'レビュー1件以上' },
  { value: 3, label: 'レビュー3件以上（推奨）' },
  { value: 5, label: 'レビュー5件以上' },
];

export function MapsCollect() {
  const [query, setQuery] = useState('');
  const [minReviews, setMinReviews] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<MapsPlaceCandidate[]>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setError(null);
    setLoading(true);
    setResults([]);
    try {
      const list = await searchPlacesNoWebsite(query.trim(), { minReviews, maxResults: 20 });
      setResults(list);
      setAddedIds(new Set());
    } catch (e) {
      setError(e instanceof Error ? e.message : '検索に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [query, minReviews]);

  const addCandidate = useCallback((c: MapsPlaceCandidate) => {
    const signals = candidateToVerificationSignals(c);
    addToQueue({
      source: 'google_maps',
      name: c.name,
      address: c.address,
      placeId: c.placeId,
      notes: '',
      signals,
      category: c.category,
    });
    setAddedIds((prev) => new Set(prev).add(c.placeId));
  }, []);

  if (!isMapsConfigured()) {
    return (
      <div className="panel maps-collect">
        <h2>Google Maps で取得</h2>
        <p className="hint">
          プロジェクトルートに <code>.env</code> を作成し、
          <code>VITE_GOOGLE_MAPS_API_KEY=あなたのAPIキー</code> を設定してください。
          Google Cloud で「Maps JavaScript API」「Places API」を有効にしたキーが必要です。
        </p>
      </div>
    );
  }

  return (
    <div className="panel maps-collect">
      <h2>Google Maps で取得</h2>
      <p className="hint">
        エリアやキーワードで検索し、<strong>Webサイトが未登録の店舗</strong>だけをキューに追加できます。
        実在確認のため、レビュー数でフィルタすることを推奨します。
      </p>
      <div className="search-row">
        <input
          type="text"
          placeholder="例: 港区 カフェ、目黒区 レストラン"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <select
          value={minReviews}
          onChange={(e) => setMinReviews(Number(e.target.value))}
          title="レビュー数が少ないと実在しない店の可能性が高まります"
        >
          {MIN_REVIEW_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <button type="button" className="primary" onClick={handleSearch} disabled={loading}>
          {loading ? '検索中…' : '検索'}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
      {results.length > 0 && (
        <div className="results-list">
          <p className="results-caption">
            サイト未登録の店舗 {results.length} 件（実在確認のためレビュー数・Mapsリンクでご確認ください）
          </p>
          <ul>
            {results.map((c) => (
              <li key={c.placeId} className="result-item">
                <div className="result-main">
                  <span className="result-name">{c.name}</span>
                  <span className="result-meta">
                    レビュー {c.userRatingsTotal ?? 0} 件
                    {c.rating != null && ` · ${c.rating}★`}
                    {c.hasOpeningHours && ' · 営業時間あり'}
                    {c.hasPhoto && ' · 写真あり'}
                  </span>
                  <span className="result-address">{c.address}</span>
                </div>
                <div className="result-actions">
                  <a
                    href={c.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-maps"
                  >
                    Mapsで確認
                  </a>
                  <button
                    type="button"
                    className="small primary"
                    onClick={() => addCandidate(c)}
                    disabled={addedIds.has(c.placeId)}
                  >
                    {addedIds.has(c.placeId) ? '追加済み' : 'キューに追加'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
