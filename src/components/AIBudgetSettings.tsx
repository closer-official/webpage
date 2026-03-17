import { useState, useEffect } from 'react';
import { getAIBudgetSettings, setAIBudgetMonthlyLimit } from '../lib/aiBudget';

export function AIBudgetSettings() {
  const [limit, setLimit] = useState('');
  const [saved, setSaved] = useState(false);
  const settings = getAIBudgetSettings();

  useEffect(() => {
    setLimit(settings.monthlyLimitYen > 0 ? String(settings.monthlyLimitYen) : '');
  }, [settings.monthlyLimitYen]);

  const handleSave = () => {
    const n = parseInt(limit, 10);
    if (!Number.isNaN(n) && n >= 0) {
      setAIBudgetMonthlyLimit(n);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="panel ai-budget-settings">
      <h2>AI 利用上限（円/月）</h2>
      <p className="hint">
        将来 AI（例: Gemini）を組み込んだ際、今月の利用額がここで設定した金額に達すると、AI の呼び出しを自動で止めます。
        現在は AI を使用していないため、利用額は 0 円です。
      </p>
      <div className="budget-row">
        <label>
          月額上限（円）
          <input
            type="number"
            min={0}
            step={500}
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            placeholder="0 = 上限なし"
          />
        </label>
        <button type="button" className="primary" onClick={handleSave}>
          {saved ? '保存しました' : '保存'}
        </button>
      </div>
      <p className="budget-status">
        今月の利用額: <strong>{settings.spentThisMonth} 円</strong>
        {settings.monthlyLimitYen > 0 && (
          <> ／ 上限 {settings.monthlyLimitYen} 円</>
        )}
      </p>
    </div>
  );
}
