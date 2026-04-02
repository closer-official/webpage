import { useCallback, useEffect, useState } from 'react';
import type { DashboardItem, QueueTarget } from './types';
import { api, isApiAvailable } from './lib/api';
import { getDashboard, getQueue } from './lib/queueStorage';
import { FullAutoMain } from './components/FullAutoMain';
import { ReviewDashboard } from './components/ReviewDashboard';
import { MapsCollect } from './components/MapsCollect';
import { QueueList } from './components/QueueList';
import { ManualAddTarget } from './components/ManualAddTarget';
import { ResearchForm } from './components/ResearchForm';

export type OperatorMission = 'choose' | 'fullauto' | 'manual' | 'customer' | 'tools';

function FlowStepper({ items }: { items: { title: string; desc: string }[] }) {
  return (
    <ol className="operator-flow-stepper" aria-label="この画面の流れ">
      {items.map((s, i) => (
        <li key={i} className="operator-flow-stepper__item">
          <span className="operator-flow-stepper__title">{s.title}</span>
          <span className="operator-flow-stepper__desc">{s.desc}</span>
        </li>
      ))}
    </ol>
  );
}

export function OperatorWorkbench() {
  const [mission, setMission] = useState<OperatorMission>('choose');
  const [dashItems, setDashItems] = useState<DashboardItem[]>([]);
  const [queue, setQueue] = useState<QueueTarget[]>([]);
  const [researchTarget, setResearchTarget] = useState<QueueTarget | null>(null);

  const useApi = isApiAvailable();

  const refreshDashboard = useCallback(async () => {
    try {
      if (useApi) {
        const raw = await api.getDashboard();
        setDashItems((raw as DashboardItem[]) ?? []);
      } else {
        setDashItems(getDashboard());
      }
    } catch {
      setDashItems(getDashboard());
    }
  }, [useApi]);

  const refreshQueue = useCallback(async () => {
    try {
      if (useApi) {
        const raw = await api.getQueue();
        setQueue((raw as QueueTarget[]) ?? []);
      } else {
        setQueue(getQueue());
      }
    } catch {
      setQueue(getQueue());
    }
  }, [useApi]);

  useEffect(() => {
    void refreshDashboard();
    void refreshQueue();
  }, [refreshDashboard, refreshQueue]);

  useEffect(() => {
    if (mission === 'fullauto' || mission === 'manual') {
      void refreshDashboard();
      void refreshQueue();
    }
  }, [mission, refreshDashboard, refreshQueue]);

  const scrollToReview = useCallback(() => {
    document.getElementById('operator-review-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleResearchClose = useCallback(() => {
    setResearchTarget(null);
  }, []);

  const handleResearchDone = useCallback(() => {
    setResearchTarget(null);
    void refreshDashboard();
    void refreshQueue();
    scrollToReview();
  }, [refreshDashboard, refreshQueue, scrollToReview]);

  if (mission === 'choose') {
    return (
      <div className="operator-workbench">
        <header className="operator-workbench-header">
          <h1 className="operator-workbench-title">Closer 制作ハブ</h1>
          <p className="operator-workbench-lead">
            <strong>いま何をしたいか</strong>を1つ選ぶと、<strong>ゴール（LPの叩き台 ＋ DM文案のたたき台）</strong>までの順番が分かります。
            上から順に進めれば迷いにくい流れになっています。
          </p>
        </header>
        <div className="operator-mission-grid">
          <button type="button" className="operator-mission-card operator-mission-card--primary" onClick={() => setMission('fullauto')}>
            <span className="operator-mission-kicker">メインの営業フロー</span>
            <span className="operator-mission-card-title">地域・業種から自動で探し、LP案とDM文案まで作る</span>
            <span className="operator-mission-card-body">
              <strong>公式サイト未掲載</strong>の店だけを対象に、検索 → 口コミ分析 → LP複数案 → DM案までサーバーが実行。
              終わったら<strong>同じ画面の下</strong>でプレビュー編集・DMのコピー・OK判定をします。
            </span>
          </button>
          <button type="button" className="operator-mission-card" onClick={() => setMission('manual')}>
            <span className="operator-mission-kicker">1店ずつ丁寧に</span>
            <span className="operator-mission-card-title">Maps や手入力でキューに入れ、調査から LP・DM を作る</span>
            <span className="operator-mission-card-body">
              候補をキューに追加 → 各店の「調査」でコンセプト・テンプレを決める → 下の検閲で仕上げ。
              フルオートで取りこぼした店向け。
            </span>
          </button>
          <button type="button" className="operator-mission-card" onClick={() => setMission('customer')}>
            <span className="operator-mission-kicker">お客様向け（公開）</span>
            <span className="operator-mission-card-title">テンプレを見て、申し込み・ヒアリングする</span>
            <span className="operator-mission-card-body">ギャラリー閲覧とフォーム。パスワード不要。別タブで開きます。</span>
          </button>
          <button type="button" className="operator-mission-card operator-mission-card--tools" onClick={() => setMission('tools')}>
            <span className="operator-mission-kicker">管理者向け</span>
            <span className="operator-mission-card-title">テンプレ・店舗発行・売上などのツール</span>
            <span className="operator-mission-card-body">営業フローとは別枠の作業用リンクです。</span>
          </button>
        </div>
      </div>
    );
  }

  if (mission === 'customer') {
    return (
      <div className="operator-workbench">
        <button type="button" className="operator-back-btn" onClick={() => setMission('choose')}>
          ← 目的の選択に戻る
        </button>
        <header className="operator-workbench-header">
          <h1 className="operator-workbench-title">お客様向けページ</h1>
          <p className="operator-workbench-lead">閲覧・申込はパスワード不要です。</p>
        </header>
        <ul className="operator-link-cards">
          <li>
            <a className="operator-hub-card" href="/template-gallery" target="_blank" rel="noopener noreferrer">
              <span className="operator-hub-card-title">テンプレートギャラリー</span>
              <span className="operator-hub-card-desc">キーワード検索・ライブプレビュー</span>
            </a>
          </li>
          <li>
            <a className="operator-hub-card" href="/customer-intake" target="_blank" rel="noopener noreferrer">
              <span className="operator-hub-card-title">ヒアリング・お申し込み</span>
              <span className="operator-hub-card-desc">デザイン選択 → ご依頼内容の入力</span>
            </a>
          </li>
        </ul>
      </div>
    );
  }

  if (mission === 'tools') {
    return (
      <div className="operator-workbench">
        <button type="button" className="operator-back-btn" onClick={() => setMission('choose')}>
          ← 目的の選択に戻る
        </button>
        <header className="operator-workbench-header">
          <h1 className="operator-workbench-title">運営ツール</h1>
          <p className="operator-workbench-lead">必要なツールだけ別ページで開きます。</p>
        </header>
        <main className="operator-hub">
          <ul className="operator-hub-grid">
            <li>
              <a className="operator-hub-card" href="/admin/template-hub.html">
                <span className="operator-hub-card-title">テンプレ・ギャラリーハブ</span>
                <span className="operator-hub-card-desc">プレビュー・ギャラリー公開の切替・手順コピー</span>
              </a>
            </li>
            <li>
              <a className="operator-hub-card" href="/admin/template-worker.html">
                <span className="operator-hub-card-title">店舗ドラフト編集（作業者用）</span>
                <span className="operator-hub-card-desc">全テンプレの文言・写真URL・SEO。cafe_1 はメニュー・FAQ・店舗情報も</span>
              </a>
            </li>
            <li>
              <a className="operator-hub-card" href="/admin/template-worker-basic.html">
                <span className="operator-hub-card-title">店舗ドラフト（基本情報のみ）</span>
                <span className="operator-hub-card-desc">cafe_1：店名・住所・電話・地図・SNS だけ。メニュー等はジャンル別固定</span>
              </a>
            </li>
            <li>
              <a className="operator-hub-card" href="/admin/store-wizard.html">
                <span className="operator-hub-card-title">店舗セットアップ</span>
                <span className="operator-hub-card-desc">テンプレ選択・店舗キー・購入者用URL</span>
              </a>
            </li>
            <li>
              <a className="operator-hub-card" href="/admin/sales-console.html">
                <span className="operator-hub-card-title">売上コンソール</span>
                <span className="operator-hub-card-desc">販売・決済（利用時）</span>
              </a>
            </li>
            <li>
              <a className="operator-hub-card" href="/admin/gym-lp.html">
                <span className="operator-hub-card-title">ジムLP 管理</span>
                <span className="operator-hub-card-desc">gym LP 用（利用時）</span>
              </a>
            </li>
          </ul>
        </main>
      </div>
    );
  }

  const fullautoSteps = [
    { title: '① 条件を入れる', desc: '地域・業種（または自由キーワード）・件数・レビュー条件' },
    { title: '② 開始して待つ', desc: 'サーバーが検索〜LP案〜DM案まで実行（進捗はすぐ下）' },
    { title: '③ 同じページの下で仕上げ', desc: 'LPプレビュー編集・DM文案のコピー・OK / NG' },
  ];

  const manualSteps = [
    { title: '① 店をキューに入れる', desc: 'Maps 検索で追加、または手動で店名・住所を追加' },
    { title: '② 各店の「調査」', desc: 'コンセプト・強み・テンプレを決めてダッシュボードへ' },
    { title: '③ この下で仕上げ', desc: 'プレビュー編集・DM・送信まで' },
  ];

  return (
    <div className="operator-workbench">
      <button type="button" className="operator-back-btn" onClick={() => setMission('choose')}>
        ← 目的の選択に戻る
      </button>

      {mission === 'fullauto' && (
        <>
          <header className="operator-workbench-header">
            <h1 className="operator-workbench-title">フルオート：LP ＋ DM まで</h1>
            <p className="operator-workbench-lead">
              この画面の<strong>上から順</strong>に進めば完了です。③はページを少し下にスクロールした場所にあります（「ダッシュボードで確認」ボタンでもジャンプします）。
            </p>
          </header>
          <FlowStepper items={fullautoSteps} />
          <div className="operator-app-steps">
            <FullAutoMain
              onOpenDashboard={scrollToReview}
              onRefreshDashboard={() => void refreshDashboard()}
            />
          </div>
        </>
      )}

      {mission === 'manual' && (
        <>
          <header className="operator-workbench-header">
            <h1 className="operator-workbench-title">手動キュー：1店ずつ LP ＋ DM</h1>
            <p className="operator-workbench-lead">
              まず店をキューに載せ、<strong>調査</strong>で内容を確定すると検閲一覧に出ます。最後に下で DM を整えます。
            </p>
            {useApi && (
              <p className="operator-workbench-note">
                ※ バックエンド接続時、<strong>調査フォームからの追加はブラウザ保存のダッシュボード</strong>に入る場合があります。本番の一覧と混ざる場合は、まずフルオート運用を優先してください。
              </p>
            )}
          </header>
          <FlowStepper items={manualSteps} />
          <div className="operator-app-steps">
            <MapsCollect
              onAdded={() => {
                void refreshQueue();
              }}
            />
            <ManualAddTarget
              onAdded={() => {
                void refreshQueue();
              }}
            />
            <QueueList
              queue={queue}
              onRefresh={() => void refreshQueue()}
              useApi={useApi}
              onResearch={(t) => setResearchTarget(t)}
            />
          </div>
        </>
      )}

      <section id="operator-review-section" className="operator-review-wrap" aria-labelledby="operator-review-heading">
        <h2 id="operator-review-heading" className="operator-review-wrap__title">
          ③ LPプレビュー・DM文案の仕上げ（検閲）
        </h2>
        <p className="operator-review-wrap__lead">
          左：実在確認 · 中央：LP（プレビュー編集は「プレビューを編集」から）· 右：DM文案をコピーして送信。これで<strong>1件分のたたき台</strong>が揃います。
        </p>
        <ReviewDashboard items={dashItems} onRefresh={() => void refreshDashboard()} useApi={useApi} />
      </section>

      {researchTarget && (
        <ResearchForm target={researchTarget} onClose={handleResearchClose} onDone={handleResearchDone} />
      )}
    </div>
  );
}
