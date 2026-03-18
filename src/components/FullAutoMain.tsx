import { useState, useCallback, useEffect, useRef } from 'react';
import { isApiAvailable, api } from '../lib/api';

const CATEGORY_PRESETS = [
  { value: 'カフェ', label: 'カフェ・コーヒー' },
  { value: 'ホテル', label: 'ホテル・宿泊' },
  { value: 'ジム', label: 'ジム・フィットネス' },
  { value: 'エステ', label: 'エステ・スパ' },
  { value: 'バー', label: 'バー・ナイト' },
  { value: 'キッズ', label: 'キッズ・室内あそび' },
  { value: 'クリニック', label: 'クリニック・医院' },
  { value: '美容室', label: '美容室・サロン' },
];

export type FullAutoStatus = {
  status: string;
  phase: string;
  processed: number;
  total: number;
  error: string | null;
  lastNames: string[];
  startedAt: string | null;
  finishedAt: string | null;
  noMatches?: boolean;
};

interface FullAutoMainProps {
  onOpenDashboard: () => void;
  onRefreshDashboard: () => void;
}

export function FullAutoMain({ onOpenDashboard, onRefreshDashboard }: FullAutoMainProps) {
  const [region, setRegion] = useState('東京都港区');
  const [categoryMode, setCategoryMode] = useState<'preset' | 'custom'>('preset');
  const [categoryPreset, setCategoryPreset] = useState('カフェ');
  const [categoryCustom, setCategoryCustom] = useState('');
  const [count, setCount] = useState(3);
  const [minReviews, setMinReviews] = useState(3);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [status, setStatus] = useState<FullAutoStatus | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const category =
    categoryMode === 'custom' ? categoryCustom.trim() : categoryPreset;

  const pollStatus = useCallback(async () => {
    try {
      const s = await api.getFullAutoStatus();
      setStatus(s);
      if (s.status !== 'running') {
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
        if (s.status === 'done' && s.processed > 0) {
          onRefreshDashboard();
        }
      }
    } catch {
      /* ignore */
    }
  }, [onRefreshDashboard]);

  useEffect(() => {
    if (!isApiAvailable()) return;
    api.getFullAutoStatus().then(setStatus).catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handleStart = useCallback(async () => {
    if (!category) {
      setStartError('カテゴリを選ぶか、自由入力してください。');
      return;
    }
    setStartError(null);
    setStarting(true);
    try {
      const started = await api.fullAutoStart({
        region: region.trim(),
        category,
        count,
        minReviews,
      });
      await pollStatus();
      if ((started as { completedOnServer?: boolean }).completedOnServer) {
        onRefreshDashboard();
      }
      pollRef.current = setInterval(pollStatus, 2000);
    } catch (e) {
      setStartError(e instanceof Error ? e.message : '開始に失敗しました');
    } finally {
      setStarting(false);
    }
  }, [region, category, count, minReviews, pollStatus]);

  if (!isApiAvailable()) {
    return (
      <section className="tab-content full-auto-main">
        <div className="panel">
          <h2>フルオート（メイン）</h2>
          <p className="error">
            フルオートはサーバー経由でのみ動作します。プロジェクトルートの <code>.env</code> に{' '}
            <code>VITE_API_URL=http://localhost:3001</code> を書き、API サーバーを起動してください。
          </p>
        </div>
      </section>
    );
  }

  const running = status?.status === 'running';
  const noMatchesDone = status?.status === 'done' && (status.noMatches || (status.processed === 0 && status.total === 0));
  const doneWithResults = status?.status === 'done' && status.processed > 0;
  const failed = status?.status === 'error';

  return (
    <section className="tab-content full-auto-main">
      <div className="panel full-auto-hero">
        <h2>フルオート（メイン）</h2>
        <p className="hint full-auto-lead">
          <strong>地域・カテゴリ・件数</strong>を決めて<strong>開始</strong>するだけです。
          サーバーが <strong>検索 → 口コミ分析 → 9種類のテンプレからLP案3パターン作成 → DM（メール）文面</strong> まで自動で行い、
          結果は<strong>ダッシュボード</strong>に並びます。
        </p>
        <p className="hint full-auto-lead" style={{ marginTop: '-0.5rem', color: 'var(--text-muted, #555)' }}>
          <strong>重要:</strong> 集めるのは Google に<strong>サイトURL未登録</strong>の店だけです。港区・渋谷などのカフェはほぼサイトあり →{' '}
          <strong>0件になりやすい</strong>のは正常です。地方・郊外などを試してください。
        </p>

        <div className="full-auto-form">
          <div className="field">
            <label htmlFor="fa-region">地域（エリア）</label>
            <input
              id="fa-region"
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="例: 東京都港区、茨城県つくば市"
            />
          </div>
          <div className="field">
            <span className="label-text">カテゴリ</span>
            <div className="full-auto-category-row">
              <label className="radio-inline">
                <input
                  type="radio"
                  name="catmode"
                  checked={categoryMode === 'preset'}
                  onChange={() => setCategoryMode('preset')}
                />
                よく使う
              </label>
              <select
                value={categoryPreset}
                onChange={(e) => setCategoryPreset(e.target.value)}
                disabled={categoryMode !== 'preset'}
              >
                {CATEGORY_PRESETS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <label className="radio-inline" style={{ marginTop: 8 }}>
              <input
                type="radio"
                name="catmode"
                checked={categoryMode === 'custom'}
                onChange={() => setCategoryMode('custom')}
              />
              自由入力
            </label>
            {categoryMode === 'custom' && (
              <input
                type="text"
                value={categoryCustom}
                onChange={(e) => setCategoryCustom(e.target.value)}
                placeholder="例: パン屋、税理士、ヨガスタジオ"
                style={{ marginTop: 8 }}
              />
            )}
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="fa-count">作成件数（最大25）</label>
              <input
                id="fa-count"
                type="number"
                min={1}
                max={25}
                value={count}
                onChange={(e) => setCount(Number(e.target.value) || 1)}
              />
            </div>
            <div className="field">
              <label htmlFor="fa-reviews">最低レビュー数</label>
              <select
                id="fa-reviews"
                value={minReviews}
                onChange={(e) => setMinReviews(Number(e.target.value))}
              >
                <option value={0}>制限なし</option>
                <option value={1}>1件以上</option>
                <option value={3}>3件以上（推奨）</option>
                <option value={5}>5件以上</option>
              </select>
            </div>
          </div>
          <button
            type="button"
            className="primary full-auto-start-btn"
            onClick={() => void handleStart()}
            disabled={starting || running}
          >
            {running ? '実行中…' : starting ? '開始しています…' : '開始（検索 → LP → メール文 まで自動）'}
          </button>
          {startError && <p className="error">{startError}</p>}
        </div>
      </div>

      {(running || status?.phase) && (
        <div className={`panel full-auto-status${noMatchesDone ? ' full-auto-no-matches' : ''}`}>
          <h3>進捗</h3>
          <p className="full-auto-phase">{status?.phase || '…'}</p>
          {status && status.total > 0 && (
            <p className="hint">
              {status.processed} / {status.total} 件完了
            </p>
          )}
          {failed && status?.error && <p className="error">{status.error}</p>}
          {status?.lastNames && status.lastNames.length > 0 && (
            <ul className="full-auto-names">
              {status.lastNames.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          )}
          {doneWithResults && (
            <div className="full-auto-done-actions">
              <button type="button" className="primary" onClick={onOpenDashboard}>
                ダッシュボードで確認・送信
              </button>
            </div>
          )}
          {noMatchesDone && (
            <p className="hint" style={{ marginTop: 12 }}>
              サイト掲載ありの店を対象にしたい場合は「手動・詳細」で Maps からキューに追加してください。
            </p>
          )}
        </div>
      )}

      <div className="panel full-auto-note">
        <h3>補足</h3>
        <ul className="hint" style={{ margin: 0, paddingLeft: '1.2em' }}>
          <li>
            検索クエリは「<strong>{region.trim() || '地域'}</strong> <strong>{category || 'カテゴリ'}</strong>」の形で Google に送ります。
          </li>
          <li>
            サイト未掲載の店だけ対象です。エリアによっては<strong>希望件数に満たない</strong>こともあります（進捗に件数表示）。
          </li>
          <li>
            サーバーに <code>GEMINI_API_KEY</code> と <code>GOOGLE_MAPS_API_KEY</code> が必要です。Vercel 本番では環境変数に設定し、フルオートは <strong>Supabase 接続</strong>も必要です。
          </li>
          <li>
            <strong>本番（Vercel）</strong>では「開始」後、完了まで <strong>1〜数分</strong>そのまま待つ画面になります（サーバーレス仕様のため）。
          </li>
          <li>手動でキューに入れる・Maps で個別追加する場合は「手動・詳細」タブを使います。</li>
        </ul>
      </div>
    </section>
  );
}
