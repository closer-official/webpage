import { useState, useEffect, useCallback } from 'react';
import { isApiAvailable, api, type GenerationOptions } from '../lib/api';

const DEFAULT_OPTIONS: GenerationOptions = {
  multiLanguage: false,
  contactForm: false,
  instagramLine: true,
  presentedBy: true,
  qrCode: false,
};

export function GenerationOptions() {
  const [opts, setOpts] = useState<GenerationOptions>(DEFAULT_OPTIONS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!isApiAvailable()) {
      setLoading(false);
      return;
    }
    try {
      const data = await api.getOptions();
      setOpts({ ...DEFAULT_OPTIONS, ...data });
    } catch {
      setOpts(DEFAULT_OPTIONS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = useCallback(
    (key: keyof GenerationOptions, value: boolean) => {
      const next = { ...opts, [key]: value };
      setOpts(next);
      if (!isApiAvailable()) return;
      setSaving(true);
      api
        .setOptions(next)
        .then(() => setSaving(false))
        .catch(() => setSaving(false));
    },
    [opts]
  );

  if (!isApiAvailable()) {
    return (
      <div className="panel generation-options">
        <h2>生成オプション（フルオート用）</h2>
        <p className="hint">
          サーバーを起動し、<code>VITE_API_URL=http://localhost:3001</code> を設定すると、ここでオプションのオンオフができます。
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="panel generation-options">
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="panel generation-options">
      <h2>生成オプション（フルオート用）</h2>
      <p className="hint">
        LP・DM 生成時に適用されます。スイッチでオンオフを切り替えてください。
      </p>
      {saving && <p className="saving">保存中...</p>}
      <ul className="option-list">
        <li className="option-item">
          <span className="option-label">多言語対応</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={opts.multiLanguage}
              onChange={(e) => toggle('multiLanguage', e.target.checked)}
            />
            <span className="slider" />
          </label>
        </li>
        <li className="option-item">
          <span className="option-label">問い合わせフォームを設置</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={opts.contactForm}
              onChange={(e) => toggle('contactForm', e.target.checked)}
            />
            <span className="slider" />
          </label>
          {opts.contactForm && (
            <input
              type="url"
              className="option-url"
              placeholder="フォーム送信先URL（未入力は #）"
              value={opts.formActionUrl ?? ''}
              onChange={(e) => {
                const next = { ...opts, formActionUrl: e.target.value };
                setOpts(next);
                if (isApiAvailable()) {
                  setSaving(true);
                  api.setOptions(next).then(() => setSaving(false)).catch(() => setSaving(false));
                }
              }}
            />
          )}
        </li>
        <li className="option-item">
          <span className="option-label">Instagram・LINE などのリンクを埋め込む</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={opts.instagramLine}
              onChange={(e) => toggle('instagramLine', e.target.checked)}
            />
            <span className="slider" />
          </label>
        </li>
        <li className="option-item">
          <span className="option-label">「Presented by」表記を表示</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={opts.presentedBy}
              onChange={(e) => toggle('presentedBy', e.target.checked)}
            />
            <span className="slider" />
          </label>
        </li>
        <li className="option-item">
          <span className="option-label">QRコードを発行して掲載</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={opts.qrCode}
              onChange={(e) => toggle('qrCode', e.target.checked)}
            />
            <span className="slider" />
          </label>
          {opts.qrCode && (
            <input
              type="url"
              className="option-url"
              placeholder="QRに載せるURL（未入力なら非表示）"
              value={opts.qrCodeTargetUrl ?? ''}
              onChange={(e) => {
                const next = { ...opts, qrCodeTargetUrl: e.target.value };
                setOpts(next);
                if (isApiAvailable()) {
                  setSaving(true);
                  api.setOptions(next).then(() => setSaving(false)).catch(() => setSaving(false));
                }
              }}
            />
          )}
        </li>
      </ul>
    </div>
  );
}
