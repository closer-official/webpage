import { useState, useCallback, useEffect } from 'react';
import { api, isApiAvailable } from '../lib/api';
import type { ReferenceSite, DesignInsights } from '../lib/api';

export function ReferenceSitesPanel() {
  const [query, setQuery] = useState('');
  const [minReviews, setMinReviews] = useState(0);
  const [maxResults, setMaxResults] = useState(60);
  const [refs, setRefs] = useState<ReferenceSite[]>([]);
  const [insights, setInsights] = useState<DesignInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRefs = useCallback(() => {
    if (!isApiAvailable()) return;
    api.getReferenceSites().then(setRefs).catch(() => setRefs([]));
  }, []);
  const loadInsights = useCallback(() => {
    if (!isApiAvailable()) return;
    api.getDesignInsights().then(setInsights).catch(() => setInsights(null));
  }, []);

  useEffect(() => {
    loadRefs();
    loadInsights();
  }, [loadRefs, loadInsights]);

  const handleCollectWithWebsite = useCallback(async () => {
    if (!query.trim()) return;
    setError(null);
    setLoading(true);
    try {
      await api.collect(query.trim(), minReviews, maxResults, true);
      loadRefs();
    } catch (e) {
      setError(e instanceof Error ? e.message : '収集に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [query, minReviews, maxResults, loadRefs]);

  const handleFetchMeta = useCallback(async () => {
    setError(null);
    setMetaLoading(true);
    try {
      await api.fetchReferenceMeta();
      loadRefs();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'メタ取得に失敗しました');
    } finally {
      setMetaLoading(false);
    }
  }, [loadRefs]);

  const handleAnalyze = useCallback(async () => {
    setError(null);
    setAnalyzeLoading(true);
    try {
      const data = await api.analyzeReferenceSites();
      setInsights(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '分析に失敗しました');
    } finally {
      setAnalyzeLoading(false);
    }
  }, []);

  const handleClear = useCallback(async () => {
    setError(null);
    try {
      await api.deleteReferenceSites();
      setRefs([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'クリアに失敗しました');
    }
  }, []);

  if (!isApiAvailable()) return null;

  return (
    <div className="panel reference-sites">
      <h2>参照サイト（ウェブあり・上位表示分析）</h2>
      <p className="hint">
        ウェブサイトがある店を検索して保存し、「メタ取得」でタイトル・説明文に加え<strong>デザイン（色・フォント・レイアウト）</strong>も抽出します。「上位表示要因を言語化」で文言とデザインの<strong>共通項</strong>を業種別にまとめます。
      </p>
      <div className="search-row">
        <input
          type="text"
          placeholder="例: 港区 パン屋"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={minReviews} onChange={(e) => setMinReviews(Number(e.target.value))}>
          <option value={0}>レビュー制限なし</option>
          <option value={1}>1件以上</option>
          <option value={3}>3件以上</option>
        </select>
        <select value={maxResults} onChange={(e) => setMaxResults(Number(e.target.value))} title="取得件数（学習用は60〜100推奨）">
          <option value={20}>20件</option>
          <option value={60}>60件</option>
          <option value={100}>100件</option>
        </select>
        <button
          type="button"
          className="primary"
          onClick={handleCollectWithWebsite}
          disabled={loading}
        >
          {loading ? '収集中…' : 'ウェブありで収集'}
        </button>
      </div>
      <div className="ref-actions">
        <button type="button" onClick={handleFetchMeta} disabled={metaLoading || refs.length === 0}>
          {metaLoading ? '取得中…' : 'メタ取得（title・description・デザイン）'}
        </button>
        <button type="button" className="primary" onClick={handleAnalyze} disabled={analyzeLoading || refs.length === 0}>
          {analyzeLoading ? '分析中…' : '上位表示要因を言語化'}
        </button>
        <button type="button" onClick={handleClear} disabled={refs.length === 0}>
          一覧をクリア
        </button>
      </div>
      {error && <p className="error">{error}</p>}
      {refs.length > 0 && (
        <div className="ref-list">
          <h3>保存済み {refs.length} 件</h3>
          <ul>
            {refs.slice(0, 30).map((r) => (
              <li key={r.id}>
                <span className="rank">#{r.rankIndex ?? '?'}</span>{' '}
                <a href={r.websiteUrl} target="_blank" rel="noopener noreferrer">{r.name}</a>
                {r.title && <div className="meta title">{r.title}</div>}
                {r.metaDescription && <div className="meta desc">{r.metaDescription}</div>}
                {r.designTraits?.summary && (
                  <div className="meta design">デザイン: {r.designTraits.summary}</div>
                )}
              </li>
            ))}
          </ul>
          {refs.length > 30 && <p className="hint">他 {refs.length - 30} 件</p>}
        </div>
      )}
      {insights && (insights.summary || insights.designSummary || Object.keys(insights.byIndustry || {}).length > 0 || Object.keys(insights.byIndustryDesign || {}).length > 0) && (
        <div className="design-insights">
          <h3>上位表示要因（言語化結果）</h3>
          {insights.summary && (
            <>
              <h4>文言の傾向</h4>
              <div className="summary">{insights.summary}</div>
            </>
          )}
          {insights.byIndustry && Object.keys(insights.byIndustry).length > 0 && (
            <div className="by-industry">
              {Object.entries(insights.byIndustry).map(([cat, text]) => (
                <div key={cat}><strong>{cat}</strong>: {text}</div>
              ))}
            </div>
          )}
          {insights.designSummary && (
            <>
              <h4>デザインの共通項</h4>
              <div className="summary design-summary">{insights.designSummary}</div>
            </>
          )}
          {insights.byIndustryDesign && Object.keys(insights.byIndustryDesign).length > 0 && (
            <div className="by-industry by-industry-design">
              {Object.entries(insights.byIndustryDesign).map(([cat, text]) => (
                <div key={cat}><strong>{cat}</strong>: {text}</div>
              ))}
            </div>
          )}
          {insights.updatedAt && (
            <p className="hint">更新: {new Date(insights.updatedAt).toLocaleString()}</p>
          )}
        </div>
      )}
    </div>
  );
}
