import { useState, useCallback, useEffect } from 'react';
import { isApiAvailable, api } from './lib/api';
import './App.css';
import './App.operator.css';

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
      <header className="app-header">
        <h1>運営メニュー</h1>
        <p className="operator-hub-lead">
          テンプレのプレビュー・店舗ドラフト・ウィザードは下のリンクから開きます。旧「フルオート／ダッシュボード／手動キュー／ヒアリング一覧／設定」タブは整理のためここから外しています（サーバーAPIは互換のため残っています）。
        </p>
      </header>

      <main className="operator-hub">
        <ul className="operator-hub-grid">
          <li>
            <a className="operator-hub-card" href="/admin/template-hub.html">
              <span className="operator-hub-card-title">テンプレ・ギャラリーハブ</span>
              <span className="operator-hub-card-desc">ビルトインのプレビュー・ギャラリー公開の切替・手順文のコピー</span>
            </a>
          </li>
          <li>
            <a className="operator-hub-card" href="/admin/template-worker.html">
              <span className="operator-hub-card-title">店舗ドラフト編集（作業者用）</span>
              <span className="operator-hub-card-desc">ベーステンプレ＋文章・画像URL・SEO を保存（要 API ログイン）</span>
            </a>
          </li>
          <li>
            <a className="operator-hub-card" href="/admin/store-wizard.html">
              <span className="operator-hub-card-title">店舗セットアップ</span>
              <span className="operator-hub-card-desc">納品テンプレ選択・店舗キー・購入者用編集URLの発行</span>
            </a>
          </li>
          <li>
            <a className="operator-hub-card" href="/admin/sales-console.html">
              <span className="operator-hub-card-title">売上コンソール</span>
              <span className="operator-hub-card-desc">販売・決済まわり（利用している場合）</span>
            </a>
          </li>
          <li>
            <a className="operator-hub-card" href="/admin/gym-lp.html">
              <span className="operator-hub-card-title">ジムLP 管理</span>
              <span className="operator-hub-card-desc">gym LP 用ツール（利用している場合）</span>
            </a>
          </li>
          <li>
            <a className="operator-hub-card" href="/template-gallery" target="_blank" rel="noopener noreferrer">
              <span className="operator-hub-card-title">公開テンプレギャラリー</span>
              <span className="operator-hub-card-desc">一般向けカタログ（別タブ）</span>
            </a>
          </li>
        </ul>
      </main>
    </div>
  );
}

export default App;
