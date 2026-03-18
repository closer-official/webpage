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
import { DesignCheckPanel } from './components/DesignCheckPanel';
import type { PageContent, SEOData, QueueTarget } from './types';
import type { TemplateOption } from './types';
import { isApiAvailable, api } from './lib/api';
import { TEMPLATES } from './lib/templates';
import { WARM_ORGANIC_CAFE_PRESET } from './data/warmOrganicCafePreset';
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

type TabId = 'design' | 'queue' | 'dashboard' | 'page' | 'settings';

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
  const [styleId, setStyleId] = useState('minimal_luxury');

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

  const flowSteps = [
    { id: 'design' as const, label: '⓪ デザイン' },
    { id: 'queue' as const, label: '① キュー' },
    { id: 'dashboard' as const, label: '② ダッシュボード' },
    { id: 'page' as const, label: '③ PDFから作成' },
    { id: 'settings' as const, label: '設定' },
  ];

  return (
    <div className="app">
      <header className="app-header">
        <h1>ウェブページ作成ツール</h1>
        <p className="app-flow-desc">
          <span className="flow-main">⓪ デザイン</span>
          <span className="flow-arrow" aria-hidden>→</span>
          <span className="flow-main">① キュー</span>
          <span className="flow-arrow" aria-hidden>→</span>
          <span className="flow-main">② ダッシュボード</span>
          <span className="flow-sub">　③ PDFから作成　・　設定</span>
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
        {tab === 'design' && (
          <section className="tab-content">
            <DesignCheckPanel />
          </section>
        )}

        {tab === 'queue' && (
          <section className="tab-content queue-tab">
            <p className="tab-hint">
              店舗候補をキューに登録し、各項目の「調査」でLP作成へ進むか、下の「フルオート」で一括処理。確認・送信は「② ダッシュボード」で行います。
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
              <h3 className="queue-section-title">候補を追加する</h3>
              <MapsCollect />
              <ManualAddTarget onAdded={refreshQueue} />
            </div>
            <div className="queue-section">
              <QueueAuto onCollectDone={refreshQueue} onProcessDone={refreshDashboard} />
            </div>
            <div className="queue-section">
              <ReferenceSitesPanel />
            </div>
          </section>
        )}

        {tab === 'dashboard' && (
          <section className="tab-content">
            <p className="tab-hint">
              処理済みのLPを確認し、承認・DM文の編集・メール送信を行います。キューで「調査」した結果やフルオート処理の結果がここに並びます。
            </p>
            <ReviewDashboard
              items={dashboardItems}
              onRefresh={refreshDashboard}
              useApi={isApiAvailable()}
            />
          </section>
        )}

        {tab === 'settings' && (
          <section className="tab-content settings-tab">
            <p className="tab-hint">
              生成するLPのオプション・決済・AI利用の予算を設定します。
            </p>
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

        {tab === 'page' && (
          <section className="tab-content">
            <p className="tab-hint">
              PDFやテキストから店舗情報を取り込み、テーマを選んでLPを編集・出力します。キューを使わない単発作成用です。
            </p>
            <div className="page-tab-shortcut">
              <h3 className="page-tab-shortcut-title">テンプレ4（カフェ・Warm Organic）だけ作る</h3>
              <p className="hint">
                ひな形を読み込み、編集画面へ進みます。完成後は「テンプレ4用JSONをダウンロード」で{' '}
                <code>src/data/warm-organic-showcase.json</code> に上書きすると、⓪デザインのプレビューが同じ内容になります。
              </p>
              <button
                type="button"
                className="primary"
                onClick={() => {
                  const wo = TEMPLATES.find((t) => t.id === 'warm_organic') ?? null;
                  setContent(
                    JSON.parse(JSON.stringify(WARM_ORGANIC_CAFE_PRESET.content)) as PageContent
                  );
                  setSeo({ ...WARM_ORGANIC_CAFE_PRESET.seo });
                  setTemplate(wo);
                  setStyleId('warm_organic');
                  setIndustryId('restaurant');
                  setStep(3);
                }}
              >
                Warm Organic のひな形から編集へ
              </button>
            </div>
            <>
            {step === 1 && (
              <section className="step">
                <h3>ステップ 1: コンテンツの取り込み（PDF）</h3>
                <PDFUpload onComplete={handleContentReady} />
              </section>
            )}
            {content && step === 2 && (
              <section className="step step-design">
                <h3>ステップ 2: デザイン選択</h3>
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
