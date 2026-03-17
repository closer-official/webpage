import type { AIBudgetSettings } from '../types';

const STORAGE_KEY = 'webpage-ai-budget';

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getAIBudgetSettings(): AIBudgetSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AIBudgetSettings;
      const monthKey = currentMonthKey();
      if (parsed.monthKey !== monthKey) {
        return { ...parsed, monthKey, spentThisMonth: 0 };
      }
      return parsed;
    }
  } catch {
    // ignore
  }
  return {
    monthlyLimitYen: 0,
    spentThisMonth: 0,
    monthKey: currentMonthKey(),
  };
}

export function setAIBudgetMonthlyLimit(yen: number): void {
  const monthKey = currentMonthKey();
  const current = getAIBudgetSettings();
  const next: AIBudgetSettings = {
    monthlyLimitYen: Math.max(0, Math.floor(yen)),
    spentThisMonth: current.monthKey === monthKey ? current.spentThisMonth : 0,
    monthKey,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

/**
 * 上限に達しているかチェック（将来AI呼び出し前に使用）
 * 現状は spentThisMonth が常に0のため、上限>0 で止まることはない
 */
export function isAIBudgetExceeded(): boolean {
  const s = getAIBudgetSettings();
  if (s.monthlyLimitYen <= 0) return false;
  return s.spentThisMonth >= s.monthlyLimitYen;
}
