import type { QueueTarget, DashboardItem, OutreachPhase } from '../types';

const QUEUE_KEY = 'webpage-queue';
const DASHBOARD_KEY = 'webpage-dashboard';

function makeUnsubscribeToken(): string {
  const a = new Uint8Array(24);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, '0')).join('');
}

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
    unsubscribeToken: item.unsubscribeToken ?? makeUnsubscribeToken(),
  };
  list.unshift(newItem);
  setDashboard(list);
  return newItem;
}

export function updateDashboardStatus(id: string, status: DashboardItem['status']): void {
  const list = getDashboard().map((x) => {
    if (x.id !== id) return x;
    const next: DashboardItem = { ...x, status };
    if (status === 'approved' && !next.unsubscribeToken) {
      next.unsubscribeToken = makeUnsubscribeToken();
    }
    if (status === 'approved' && !next.outreachPhase) {
      next.outreachPhase = 'first_contact';
    }
    if (status === 'email_sent') {
      const ph = next.outreachPhase;
      const bumpToProposal =
        !ph ||
        ph === 'sent' ||
        ph === 'pending_send' ||
        ph === 'first_contact' ||
        ph === 'hearing' ||
        ph === 'no_outreach_channel' ||
        ph === 'appointment';
      if (bumpToProposal) {
        next.outreachPhase = 'proposal';
        next.replyWaitStartedAt = new Date().toISOString();
      } else if ((ph === 'proposal' || ph === 'awaiting_reply') && !next.replyWaitStartedAt) {
        next.replyWaitStartedAt = new Date().toISOString();
      }
      if (!next.unsubscribeToken) next.unsubscribeToken = makeUnsubscribeToken();
    }
    return next;
  });
  setDashboard(list);
}

export function updateDashboardItem(
  id: string,
  patch: Partial<
    Pick<
      DashboardItem,
      | 'dmBody'
      | 'content'
      | 'seo'
      | 'previewEditCss'
      | 'contentVariants'
      | 'outreachPhase'
      | 'sleepUntil'
      | 'unsubscribeToken'
    >
  >
): void {
  const list = getDashboard().map((x) => (x.id === id ? { ...x, ...patch } : x));
  setDashboard(list);
}

export function updateDashboardOutreachPhase(id: string, outreachPhase: OutreachPhase): void {
  const list = getDashboard().map((x) => {
    if (x.id !== id) return x;
    const next: DashboardItem = { ...x, outreachPhase };
    if (outreachPhase === 'proposal' || outreachPhase === 'awaiting_reply') {
      if (!next.replyWaitStartedAt) next.replyWaitStartedAt = new Date().toISOString();
    } else {
      next.replyWaitStartedAt = undefined;
    }
    if (outreachPhase === 'sleep') {
      const u = new Date();
      u.setMonth(u.getMonth() + 3);
      next.sleepUntil = u.toISOString();
    } else {
      next.sleepUntil = undefined;
    }
    return next;
  });
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
  newItem.unsubscribeToken = makeUnsubscribeToken();
  newItem.outreachPhase = undefined;
  newItem.sleepUntil = undefined;
  newItem.optOutFeedback = undefined;
  newItem.optedOutAt = undefined;
  list.unshift(newItem);
  setDashboard(list);
  return newItem;
}
