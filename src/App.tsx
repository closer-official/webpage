import { useState, useCallback, useEffect } from 'react';
import { PDFUpload } from './components/PDFUpload';
import { ThemePicker } from './components/ThemePicker';
import { PageEditor } from './components/PageEditor';
import { SEOEditor } from './components/SEOEditor';
import { Preview } from './components/Preview';
import { Export } from './components/Export';
import { MapsCollect } from './components/MapsCollect';
import { ManualAddTarget } from './components/ManualAddTarget';
import { QueueList } from './components/QueueList';
import { ResearchForm } from './components/ResearchForm';
import { ReviewDashboard } from './components/ReviewDashboard';
import { AIBudgetSettings } from './components/AIBudgetSettings';
import { GenerationOptions } from './components/GenerationOptions';
import { StripePayment } from './components/StripePayment';
import { QueueAuto } from './components/QueueAuto';
import { ReferenceSitesPanel } from './components/ReferenceSitesPanel';
import { LearningPanel } from './components/LearningPanel';
import type { PageContent, SEOData, QueueTarget } from './types';
import type { TemplateOption } from './types';
import { isApiAvailable, api } from './lib/api';
import { TEMPLATES } from './lib/templates';
import { getQueue, getDashboard } from './lib/queueStorage';
import {
  generateMetaDescription,
  generateMetaTitle,
  generateKeywords,
} from './lib/seo';
import './App.css';

type DashboardItemLike = ReturnType<typeof getDashboard>[number] & { contentVariants?: { templateId: string; html: string }[] };

const defaultSEO: SEOData = {
  metaTitle: '',
  metaDescription: '',
  keywords: '',
  ogImageUrl: '',
  canonicalUrl: '',
};

type TabId = 'queue' | 'dashboard' | 'page' | 'settings';

function App() {
  const [tab, setTab] = useState<TabId>('queue');
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
    refreshQueue();
  }, [tab]);
  useEffect(() => {
    refreshDashboard();
  }, [tab]);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [content, setContent] = useState<PageContent | null>(null);
  const [seo, setSeo] = useState<SEOData>(defaultSEO);
  const [template, setTemplate] = useState<TemplateOption | null>(null);
  const [industryId, setIndustryId] = useState('general');
  const [styleId, setStyleId] = useState('minimal');

  const handleContentReady = useCallback((c: PageContent) => {
    setContent(c);
    setSeo({
      metaTitle: generateMetaTitle(c, c.siteName),
      metaDescription: generateMetaDescription(c),
      keywords: generateKeywords(c).join(', '),
      ogImageUrl: defaultSEO.ogImageUrl,
      canonicalUrl: defaultSEO.canonicalUrl,
    });
    setTemplate(TEMPLATES[0]);
    setStyleId(TEMPLATES[0].styleId);
    setStep(2);
  }, []);

  const handleAutoFillSEO = useCallback(() => {
    if (!content) return;
    setSeo((prev) => ({
      ...prev,
      metaTitle: generateMetaTitle(content, content.siteName),
      metaDescription: generateMetaDescription(content),
      keywords: generateKeywords(content).join(', '),
    }));
  }, [content]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>ウェブページ作成ツール</h1>
        <p>キュー（Maps／手動）→ 調査 → 検閲ダッシュボード ／ PDFから直接作成</p>
        <nav className="app-tabs" aria-label="メイン">
          <button
            type="button"
            className={tab === 'learning' ? 'active' : ''}
            onClick={() => setTab('learning')}
          >
            学習
          </button>
          <button
            type="button"
            className={tab === 'queue' ? 'active' : ''}
            onClick={() => setTab('queue')}
          >
            キュー
          </button>
          <button
            type="button"
            className={tab === 'dashboard' ? 'active' : ''}
            onClick={() => setTab('dashboard')}
          >
            検閲ダッシュボード
          </button>
          <button
            type="button"
            className={tab === 'page' ? 'active' : ''}
            onClick={() => setTab('page')}
          >
            PDF・テキストから作成
          </button>
          <button
            type="button"
            className={tab === 'settings' ? 'active' : ''}
            onClick={() => setTab('settings')}
          >
            設定
          </button>
        </nav>
      </header>

      <div className="app-steps">
        {tab === 'learning' && (
          <LearningPanel />
        )}
        {tab === 'queue' && (
          <>
            <QueueAuto onCollectDone={refreshQueue} onProcessDone={refreshDashboard} />
            <ReferenceSitesPanel />
            <MapsCollect />
            <ManualAddTarget onAdded={refreshQueue} />
            <QueueList
              queue={queue}
              onRefresh={refreshQueue}
              onResearch={(t) => setResearchTarget(t)}
              useApi={isApiAvailable()}
            />
          </>
        )}

        {tab === 'dashboard' && (
          <ReviewDashboard
            items={dashboardItems}
            onRefresh={refreshDashboard}
            useApi={isApiAvailable()}
          />
        )}

        {tab === 'settings' && (
          <>
            <GenerationOptions />
            <StripePayment />
            <AIBudgetSettings />
          </>
        )}

        {tab === 'page' && (
          <>
            {step >= 1 && (
              <section className="step">
                <h3>ステップ 1: コンテンツの取り込み</h3>
                <PDFUpload onComplete={handleContentReady} />
              </section>
            )}
            {content && step >= 2 && (
              <section className="step">
                <h3>ステップ 2: デザインを選ぶ</h3>
                <ThemePicker
                  selectedIndustryId={industryId}
                  selectedStyleId={styleId}
                  onSelect={setTemplate}
                  onIndustryChange={setIndustryId}
                  onStyleChange={setStyleId}
                />
                <button type="button" className="primary" onClick={() => setStep(3)}>
                  編集・プレビューへ進む
                </button>
              </section>
            )}
            {content && step >= 3 && (
              <section className="step step-row">
                <div className="editor-column">
                  <h3>ステップ 3: 内容・SEOの編集</h3>
                  <PageEditor content={content} onChange={setContent} />
                  <SEOEditor seo={seo} onChange={setSeo} onAutoFill={handleAutoFillSEO} />
                </div>
                <div className="preview-column">
                  <Preview content={content} seo={seo} template={template} />
                  <Export content={content} seo={seo} template={template} />
                </div>
              </section>
            )}
          </>
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
