import { useState, useCallback, useEffect } from 'react';
import { isApiAvailable, api } from './lib/api';
import './App.css';
import './App.operator.css';

const OPS_LINKS: { href: string; title: string; desc: string }[] = [
  {
    href: '/admin/template-worker-basic.html',
    title: '店舗ドラフト（基本情報のみ）',
    desc: 'cafe_1 など。店名・住所・電話・地図・SNS 中心のたたき台。',
  },
  {
    href: '/admin/template-worker.html',
    title: '店舗ドラフト編集（作業者用）',
    desc: '全テンプレの文言・写真URL・SEO などフル編集。',
  },
  {
    href: '/admin/outreach-phases.html?v=7phase',
    title: '送付・フェーズ管理',
    desc: '7種のフェーズ管理・配信停止用URLのコピー（ダッシュボード案件）。',
  },
  {
    href: '/admin/outreach-analytics.html',
    title: '送信・フェーズ分析',
    desc: 'テンプレ別・時間帯・曜日などの棒グラフ集計（期間は補助フィルタ）。',
  },
  {
    href: '/admin/outreach-memo-leads.html?v=memo1',
    title: 'メモリード一覧（フェーズ前）',
    desc: 'WEBがない・弱い店の店名とリンクメモだけを残し、店舗ドラフト編集へ流し込み。',
  },
  {
    href: '/mail-preference.html',
    title: '配信停止ページ（店主向け・確認用）',
    desc: '本番はメールに記載の ?t= 付きURLから開きます。トークンなしでは画面デモのみ。',
  },
];

function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authEnabled, setAuthEnabled] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

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
      <div className="app app--operator admin-auth-screen">
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
    <div className="app app--operator">
      <header className="app-header app-header--workbench">
        <div className="app-header-workbench-row">
          <h1>Closer 運営</h1>
          <p className="operator-hub-lead">
            作業は次の4つから開きます。テンプレのたたき台・送付フェーズ・店主向け配信停止の確認に使い分けてください。
          </p>
        </div>
      </header>
      <main className="operator-main-shell">
        <div className="operator-hub">
          <ul className="operator-hub-grid">
            {OPS_LINKS.map((link) => (
              <li key={link.href}>
                <a className="operator-hub-card" href={link.href}>
                  <span className="operator-hub-card-title">{link.title}</span>
                  <span className="operator-hub-card-desc">{link.desc}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}

export default App;
