import { useState, useCallback, useEffect } from 'react';
import { MapsCollect } from './components/MapsCollect';
import { ManualAddTarget } from './components/ManualAddTarget';
import { QueueList } from './components/QueueList';
import { ResearchForm } from './components/ResearchForm';
import { ReviewDashboard } from './components/ReviewDashboard';
import { AIBudgetSettings } from './components/AIBudgetSettings';
import { GenerationOptions } from './components/GenerationOptions';
import { StripePayment } from './components/StripePayment';
import { QueueLocalSync } from './components/QueueLocalSync';
import { ReferenceSitesPanel } from './components/ReferenceSitesPanel';
import { FullAutoMain } from './components/FullAutoMain';
import { CustomerIntakePanel } from './components/CustomerIntakePanel';
import type { QueueTarget } from './types';
import { isApiAvailable, api } from './lib/api';
import { getQueue, getDashboard } from './lib/queueStorage';
import './App.css';

type DashboardItemLike = ReturnType<typeof getDashboard>[number] & {
  contentVariants?: { templateId: string; html: string }[];
};

type TabId = 'auto' | 'queue' | 'dashboard' | 'intake' | 'settings';

function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authEnabled, setAuthEnabled] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [tab, setTab] = useState<TabId>('auto');
  const [queue, setQueue] = useState<QueueTarget[]>([]);
  const [dashboardItems, setDashboardItems] = useState(getDashboard());
  const [researchTarget, setResearchTarget] = useState<QueueTarget | null>(null);

  const refreshQueue = useCallback(async () => {
    if (isApiAvailable()) {
      try {
        const data = await api.getQueue();
        setQueue((data as QueueTarget[]) || []);
      } catch {
        setQueue(getQueue());
      }
    } else {
      setQueue(getQueue());
    }
  }, []);

  const refreshDashboard = useCallback(async () => {
    if (isApiAvailable()) {
      try {
        const data = await api.getDashboard();
        setDashboardItems((data as DashboardItemLike[]) || []);
      } catch {
        setDashboardItems(getDashboard());
      }
    } else {
      setDashboardItems(getDashboard());
    }
  }, []);

  useEffect(() => {
    if (!isApiAvailable()) {
      setAuthChecked(true);
      return;
    }
    api
      .getAdminAuthStatus()
      .then((r) => {
        setAuthEnabled(!!r.enabled);
        setAuthed(!!r.authenticated);
      })
      .catch(() => {
        setAuthEnabled(false);
        setAuthed(true);
      })
      .finally(() => setAuthChecked(true));
  }, []);

  useEffect(() => {
    if (tab === 'queue') refreshQueue();
  }, [tab, refreshQueue]);
  useEffect(() => {
    if (tab === 'dashboard') refreshDashboard();
  }, [tab, refreshDashboard]);

  const flowSteps: { id: TabId; label: string }[] = [
    { id: 'auto', label: 'フルオート' },
    { id: 'dashboard', label: 'ダッシュボード' },
    { id: 'intake', label: 'ヒアリング回答' },
    { id: 'queue', label: '手動・詳細' },
    { id: 'settings', label: '設定' },
  ];

  const handleLogin = useCallback(async () => {
    if (!loginUser.trim() || !loginPass.trim()) {
      setLoginError('ユーザー名とパスワードを入力してください。');
      return;
    }
    setLoginError(null);
    setLoginLoading(true);
    try {
      await api.loginAdmin(loginUser.trim(), loginPass);
      setAuthed(true);
      setLoginPass('');
    } catch (e) {
      setLoginError(e instanceof Error ? e.message : 'ログインに失敗しました');
    } finally {
      setLoginLoading(false);
    }
  }, [loginUser, loginPass]);

  if (!authChecked) {
    return (
      <div className="app admin-auth-screen">
        <div className="admin-auth-card">
          <h2>読み込み中...</h2>
        </div>
      </div>
    );
  }

  if (authEnabled && !authed) {
    return (
      <div className="app admin-auth-screen">
        <div className="admin-auth-card">
          <h2>管理ページ ログイン</h2>
          <p>このページは管理者のみ閲覧できます。</p>
          <label>
            ユーザー名
            <input value={loginUser} onChange={(e) => setLoginUser(e.target.value)} autoComplete="username" />
          </label>
          <label>
            パスワード
            <input
              type="password"
              value={loginPass}
              onChange={(e) => setLoginPass(e.target.value)}
              autoComplete="current-password"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleLogin();
              }}
            />
          </label>
          <button type="button" onClick={handleLogin} disabled={loginLoading}>
            {loginLoading ? 'ログイン中...' : 'ログイン'}
          </button>
          {loginError && <p className="admin-auth-error">{loginError}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>ウェブページ作成ツール</h1>
        <p className="app-flow-desc">
          <span className="flow-main">フルオート</span>
          <span className="flow-arrow" aria-hidden>
            →
          </span>
          <span className="flow-main">ダッシュボードで確認・送信</span>
          <span className="flow-sub">　手動キュー・設定／納品テンプレは店舗セットアップページ</span>
        </p>
        <nav className="app-tabs" aria-label="メインメニュー">
          {flowSteps.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className={tab === id ? 'active' : ''}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <div className="app-steps">
        {tab === 'auto' && (
          <FullAutoMain
            onOpenDashboard={() => {
              setTab('dashboard');
              refreshDashboard();
            }}
            onRefreshDashboard={refreshDashboard}
          />
        )}

        {tab === 'queue' && (
          <section className="tab-content queue-tab">
            <p className="tab-hint">
              個別に Maps から追加したい場合・参照サイト学習はこちら。メインの一括作成は<strong>フルオート</strong>タブを使ってください。
            </p>
            <div className="queue-section queue-section-list">
              <QueueList
                queue={queue}
                onRefresh={refreshQueue}
                onResearch={(t) => setResearchTarget(t)}
                useApi={isApiAvailable()}
              />
            </div>
            <div className="queue-section">
              <h3 className="queue-section-title">候補を手動で追加</h3>
              {isApiAvailable() && <QueueLocalSync onSynced={refreshQueue} />}
              <MapsCollect onAdded={refreshQueue} />
              <ManualAddTarget onAdded={refreshQueue} />
            </div>
            <div className="queue-section">
              <ReferenceSitesPanel />
            </div>
          </section>
        )}

        {tab === 'dashboard' && (
          <section className="tab-content">
            <p className="tab-hint">
              フルオートの結果がここに並びます。LPプレビュー・DM文の編集・承認・送信前の最終確認を行います。
            </p>
            <ReviewDashboard
              items={dashboardItems}
              onRefresh={refreshDashboard}
              useApi={isApiAvailable()}
            />
          </section>
        )}

        {tab === 'intake' && <CustomerIntakePanel />}

        {tab === 'settings' && (
          <section className="tab-content settings-tab">
            <p className="tab-hint">生成するLPのオプション・決済・AI利用の予算を設定します。</p>
            <div className="settings-block">
              <h3 className="settings-block-title">納品テンプレ・新店舗</h3>
              <p className="tab-hint">
                テンプレ選択・店舗キー・購入者用CMSの発行は{' '}
                <a href="/admin/store-wizard.html">店舗セットアップ</a>
                から行います（各テンプレの「見た目を見る」あり）。
              </p>
            </div>
            <div className="settings-block">
              <h3 className="settings-block-title">LP生成オプション</h3>
              <GenerationOptions />
            </div>
            <div className="settings-block">
              <h3 className="settings-block-title">決済・料金</h3>
              <StripePayment />
            </div>
            <div className="settings-block">
              <h3 className="settings-block-title">AI予算</h3>
              <AIBudgetSettings />
            </div>
          </section>
        )}
      </div>

      {researchTarget && (
        <ResearchForm
          target={researchTarget}
          onClose={() => setResearchTarget(null)}
          onDone={() => {
            refreshQueue();
            refreshDashboard();
            setTab('dashboard');
          }}
        />
      )}
    </div>
  );
}

export default App;
