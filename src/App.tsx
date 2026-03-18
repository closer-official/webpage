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
import { DesignCheckPanel } from './components/DesignCheckPanel';
import { FullAutoMain } from './components/FullAutoMain';
import { StoreCms } from './components/StoreCms';
import type { QueueTarget } from './types';
import { isApiAvailable, api } from './lib/api';
import { getQueue, getDashboard } from './lib/queueStorage';
import './App.css';

type DashboardItemLike = ReturnType<typeof getDashboard>[number] & {
  contentVariants?: { templateId: string; html: string }[];
};

type TabId = 'auto' | 'design' | 'queue' | 'dashboard' | 'admin' | 'settings';

function App() {
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
    if (tab === 'queue') refreshQueue();
  }, [tab, refreshQueue]);
  useEffect(() => {
    if (tab === 'dashboard' || tab === 'admin') refreshDashboard();
  }, [tab, refreshDashboard]);

  const flowSteps: { id: TabId; label: string }[] = [
    { id: 'auto', label: 'フルオート' },
    { id: 'dashboard', label: 'ダッシュボード' },
    { id: 'admin', label: '管理者' },
    { id: 'design', label: 'デザイン確認' },
    { id: 'queue', label: '手動・詳細' },
    { id: 'settings', label: '設定' },
  ];

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
          <span className="flow-sub">　デザイン確認・手動キュー・設定</span>
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

        {tab === 'design' && (
          <section className="tab-content">
            <DesignCheckPanel />
          </section>
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

        {tab === 'admin' && (
          <section className="tab-content">
            <p className="tab-hint">
              オプション「管理者画面」加入店向け。アクセス数・文言・写真の編集ができます。（一時的に全件表示）
            </p>
            <StoreCms items={dashboardItems} onRefresh={refreshDashboard} />
          </section>
        )}

        {tab === 'settings' && (
          <section className="tab-content settings-tab">
            <p className="tab-hint">生成するLPのオプション・決済・AI利用の予算を設定します。</p>
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
