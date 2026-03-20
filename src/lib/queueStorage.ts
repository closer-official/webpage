import type { QueueTarget, DashboardItem } from '../types';

const QUEUE_KEY = 'webpage-queue';
const DASHBOARD_KEY = 'webpage-dashboard';

export function getQueue(): QueueTarget[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setQueue(items: QueueTarget[]): void {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
}

export function addToQueue(item: Omit<QueueTarget, 'id' | 'createdAt'>): QueueTarget {
  const queue = getQueue();
  const newItem: QueueTarget = {
    ...item,
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  queue.push(newItem);
  setQueue(queue);
  return newItem;
}

export function removeFromQueue(id: string): void {
  setQueue(getQueue().filter((x) => x.id !== id));
}

export function getDashboard(): DashboardItem[] {
  try {
    const raw = localStorage.getItem(DASHBOARD_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setDashboard(items: DashboardItem[]): void {
  localStorage.setItem(DASHBOARD_KEY, JSON.stringify(items));
}

export function addToDashboard(item: Omit<DashboardItem, 'id' | 'createdAt'>): DashboardItem {
  const list = getDashboard();
  const newItem: DashboardItem = {
    ...item,
    id: `d-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  list.unshift(newItem);
  setDashboard(list);
  return newItem;
}

export function updateDashboardStatus(id: string, status: DashboardItem['status']): void {
  const list = getDashboard().map((x) => (x.id === id ? { ...x, status } : x));
  setDashboard(list);
}

export function updateDashboardItem(
  id: string,
  patch: Partial<
    Pick<DashboardItem, 'dmBody' | 'content' | 'seo' | 'previewEditCss' | 'contentVariants'>
  >
): void {
  const list = getDashboard().map((x) => (x.id === id ? { ...x, ...patch } : x));
  setDashboard(list);
}

/** 同じLP内容を複製し、個別向け調整用の別案件として先頭に追加する */
export function duplicateDashboardItem(id: string, personalizationLabel?: string): DashboardItem | null {
  const list = getDashboard();
  const src = list.find((x) => x.id === id);
  if (!src) return null;
  const newItem: DashboardItem = JSON.parse(JSON.stringify(src));
  newItem.id = `d-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  newItem.createdAt = new Date().toISOString();
  newItem.status = 'pending';
  newItem.personalizationLabel = personalizationLabel?.trim() || undefined;
  newItem.viewCount = 0;
  list.unshift(newItem);
  setDashboard(list);
  return newItem;
}
