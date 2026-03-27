import { Component, type ErrorInfo, type ReactNode, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import KodoApp from './wikiSauna/KodoApp';
import 'lenis/dist/lenis.css';
import './wikiSauna/kodo-app.css';

type EBProps = { children: ReactNode };
type EBState = { err: Error | null };

class WikiSaunaErrorBoundary extends Component<EBProps, EBState> {
  state: EBState = { err: null };

  static getDerivedStateFromError(err: Error): EBState {
    return { err };
  }

  componentDidCatch(err: Error, info: ErrorInfo) {
    console.error('[wiki-sauna]', err, info.componentStack);
  }

  render() {
    if (this.state.err) {
      return (
        <div
          className="wss-kodo-mount"
          style={{
            padding: 24,
            color: '#7f1d1d',
            background: '#fef2f2',
            fontFamily: 'system-ui, sans-serif',
            minHeight: '40vh',
          }}
        >
          <p style={{ fontWeight: 700, margin: '0 0 12px' }}>KODŌ プレビューでエラーが発生しました</p>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 13 }}>{this.state.err.message}</pre>
          <p style={{ marginTop: 16, fontSize: 12, opacity: 0.85 }}>
            ブラウザの開発者ツール（Console）も確認してください。
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

const el = document.getElementById('wss-kodo-root');
if (el) {
  createRoot(el).render(
    <StrictMode>
      <WikiSaunaErrorBoundary>
        <KodoApp />
      </WikiSaunaErrorBoundary>
    </StrictMode>,
  );
}
