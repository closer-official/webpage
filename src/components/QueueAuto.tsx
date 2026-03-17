import { useState, useCallback, useEffect } from 'react';
import { api, isApiAvailable } from '../lib/api';

interface QueueAutoProps {
  onCollectDone: () => void;
  onProcessDone: () => void;
}

export function QueueAuto({ onCollectDone, onProcessDone }: QueueAutoProps) {
  const [query, setQuery] = useState('');
  const [minReviews, setMinReviews] = useState(3);
  const [collecting, setCollecting] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [autoRunning, setAutoRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshAutoStatus = useCallback(() => {
    if (!isApiAvailable()) return;
    api.getAutoProcessStatus().then((r) => setAutoRunning(r.running)).catch(() => setAutoRunning(false));
  }, []);

  useEffect(() => {
    refreshAutoStatus();
    if (!autoRunning) return;
    const t = setInterval(() => {
      onCollectDone();
      onProcessDone();
      refreshAutoStatus();
    }, 5000);
    return () => clearInterval(t);
  }, [autoRunning, refreshAutoStatus, onCollectDone, onProcessDone]);

  const handleCollect = useCallback(async () => {
    if (!query.trim()) return;
    setError(null);
    setCollecting(true);
    try {
      await api.collect(query.trim(), minReviews, 20);
      onCollectDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : '収集に失敗しました');
    } finally {
      setCollecting(false);
    }
  }, [query, minReviews, onCollectDone]);

  const handleProcessOne = useCallback(async () => {
    setError(null);
    setProcessing(true);
    try {
      await api.processNext();
      onProcessDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : '処理に失敗しました');
    } finally {
      setProcessing(false);
    }
  }, [onProcessDone]);

  const handleAutoStart = useCallback(async () => {
    setError(null);
    try {
      await api.startAutoProcess();
      setAutoRunning(true);
      onCollectDone();
      onProcessDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : '自動処理の開始に失敗しました');
    }
  }, [onCollectDone, onProcessDone]);

  const handleAutoStop = useCallback(async () => {
    try {
      await api.stopAutoProcess();
      setAutoRunning(false);
    } catch {
      setAutoRunning(false);
    }
  }, []);

  if (!isApiAvailable()) return null;

  return (
    <div className="panel queue-auto">
      <h2>フルオート（サーバーで実行）</h2>
      <p className="hint">
        ウェブサイトがない店をサーバーが検索し、口コミから雰囲気・客層・コンセプト・強みを分析してLP案3つとDM文面を自動作成します。承認はダッシュボードで行います。
      </p>
      <div className="search-row">
        <input
          type="text"
          placeholder="例: 港区 カフェ"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          value={minReviews}
          onChange={(e) => setMinReviews(Number(e.target.value))}
        >
          <option value={0}>レビュー制限なし</option>
          <option value={1}>1件以上</option>
          <option value={3}>3件以上</option>
          <option value={5}>5件以上</option>
        </select>
        <button
          type="button"
          className="primary"
          onClick={handleCollect}
          disabled={collecting}
        >
          {collecting ? '収集中…' : 'サーバーで収集'}
        </button>
      </div>
      <div className="process-row">
        <button
          type="button"
          className="primary"
          onClick={handleProcessOne}
          disabled={processing || autoRunning}
        >
          {processing ? '処理中…' : 'キューを1件処理（分析→LP3案＋DM）'}
        </button>
      </div>
      <div className="auto-process-row">
        <h3>キュー自動処理</h3>
        <p className="hint">調べる→作成→メール文まで自動。最後のメール送信と確認だけダッシュボードで行います。</p>
        {autoRunning ? (
          <button type="button" className="danger" onClick={handleAutoStop}>自動処理を停止</button>
        ) : (
          <button type="button" className="primary" onClick={handleAutoStart}>キューを自動で全件処理（開始）</button>
        )}
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
