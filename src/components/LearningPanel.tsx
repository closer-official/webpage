import { useState, useCallback, useEffect } from 'react';
import { api, isApiAvailable } from '../lib/api';
import type { LearningJobStatus } from '../lib/api';

const POLL_MS = 3000;

export function LearningPanel() {
  const [industries, setIndustries] = useState<string[]>([]);
  const [industry, setIndustry] = useState('cafe');
  const [maxResults, setMaxResults] = useState(60);
  const [status, setStatus] = useState<LearningJobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadIndustries = useCallback(() => {
    if (!isApiAvailable()) return;
    api.getLearningIndustries().then((list) => {
      setIndustries(list);
      if (list.length && !list.includes(industry)) setIndustry(list[0]);
    }).catch(() => setIndustries([]));
  }, [industry]);

  const loadStatus = useCallback(() => {
    if (!isApiAvailable()) return;
    api.getLearningStatus().then(setStatus).catch(() => setStatus(null));
  }, []);

  useEffect(() => {
    loadIndustries();
    loadStatus();
  }, [loadIndustries, loadStatus]);

  useEffect(() => {
    if (!status || status.status !== 'running') return;
    const t = setInterval(loadStatus, POLL_MS);
    return () => clearInterval(t);
  }, [status?.status, loadStatus]);

  const handleStart = useCallback(() => {
    setError(null);
    api.startLearning(industry, maxResults).then(() => loadStatus()).catch((e) => setError(e instanceof Error ? e.message : '開始に失敗しました'));
  }, [industry, maxResults, loadStatus]);

  if (!isApiAvailable()) return null;

  const running = status?.status === 'running';
  const completed = status?.status === 'completed';
  const failed = status?.status === 'failed';

  return (
    <div className="panel learning-panel">
      <h2>学習（骨組み・レイアウト）</h2>
      <p className="hint">
        業種と件数を選んで「学習を開始」すると、<strong>収集 → メタ・デザイン取得 → 分析</strong>を自動で実行します。完了後に「学習結果」でテンプレ作成の参考を確認できます。
      </p>
      <div className="learning-form">
        <label>
          業種
          <select value={industry} onChange={(e) => setIndustry(e.target.value)} disabled={running}>
            <option value="all">全業種（8種を順に収集）</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </label>
        <label>
          件数（業種あたり）
          <select value={maxResults} onChange={(e) => setMaxResults(Number(e.target.value))} disabled={running}>
            <option value={20}>20件</option>
            <option value={60}>60件</option>
            <option value={100}>100件</option>
          </select>
        </label>
        <button type="button" className="primary" onClick={handleStart} disabled={running}>
          {running ? '学習中…' : '学習を開始'}
        </button>
      </div>
      {running && status && (
        <p className="learning-progress">
          {status.phase} {status.current}/{status.total}
        </p>
      )}
      {failed && status?.error && <p className="error">{status.error}</p>}
      {error && <p className="error">{error}</p>}
      {completed && status?.result && (
        <div className="learning-result-preview">
          <h3>学習完了 — テンプレ作成の参考（学習結果）</h3>
          <p className="hint">以下を確認し、必要に応じて server/conceptTemplates.js を編集してください。</p>
          {status.result.summary && (
            <section>
              <h4>文言の傾向（全体）</h4>
              <div className="summary">{status.result.summary}</div>
            </section>
          )}
          {status.result.designSummary && (
            <section>
              <h4>デザインの共通項（全体）</h4>
              <div className="summary">{status.result.designSummary}</div>
            </section>
          )}
          {status.result.byIndustry && Object.keys(status.result.byIndustry).length > 0 && (
            <section>
              <h4>業種別（文言）</h4>
              {Object.entries(status.result.byIndustry).map(([k, v]) => (
                <div key={k}><strong>{k}</strong>: {v}</div>
              ))}
            </section>
          )}
          {status.result.byIndustryDesign && Object.keys(status.result.byIndustryDesign).length > 0 && (
            <section>
              <h4>業種別（デザイン）</h4>
              {Object.entries(status.result.byIndustryDesign).map(([k, v]) => (
                <div key={k}><strong>{k}</strong>: {v}</div>
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
