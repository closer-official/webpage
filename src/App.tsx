import { useState, useCallback, useEffect } from 'react';
import { isApiAvailable, api } from './lib/api';
import { OperatorWorkbench } from './OperatorWorkbench';
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
      <header className="app-header app-header--workbench">
        <div className="app-header-workbench-row">
          <h1>Closer 運営</h1>
          <p className="operator-hub-lead">
            まずは制作ハブで<strong>目的</strong>を選び、<strong>LP と DM 文案のたたき台</strong>まで進めます。テンプレ管理などの作業は「運営ツール」から。
          </p>
        </div>
      </header>
      <main className="operator-main-shell">
        <OperatorWorkbench />
      </main>
    </div>
  );
}

export default App;
