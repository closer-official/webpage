// 本番（Vercel 等）では同じオリジンへ。開発時のみ VITE_API_URL（例: http://localhost:3001）を使用
const BASE =
  typeof window !== 'undefined' && !/localhost|127\.0\.0\.1/.test(window.location.origin)
    ? ''
    : (import.meta.env.VITE_API_URL || '');

export type GenerationOptions = {
  multiLanguage: boolean;
  contactForm: boolean;
  formActionUrl?: string;
  qrCodeTargetUrl?: string;
  instagramLine: boolean;
  presentedBy: boolean;
  qrCode: boolean;
};

export function isApiAvailable(): boolean {
  // 本番（Vercel 等）では同じオリジンに API があるので true
  if (typeof window !== 'undefined' && !/localhost|127\.0\.0\.1/.test(window.location.origin))
    return true;
  return !!BASE.trim();
}

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export type PriceResult = { amountYen: number; items: { name: string; yen: number }[] };

/** プラン・削除/追加オプション（料金算出・Stripe用） */
export type BillingSelection = {
  plan?: 'normal' | 'student' | 'studentReferral';
  contactFormRemoval?: boolean;
  snsFeedRemoval?: boolean;
  mapRemoval?: boolean;
  languageRemovalCount?: number;
  presentedByRemoval?: boolean;
  customQrCode?: boolean;
  webCoupon?: boolean;
  domainSetup?: boolean;
  cms?: boolean;
  onlinePayment?: boolean;
  fullCustom?: boolean;
  seoMeo?: boolean;
};

export type DesignTraits = {
  summary?: string;
  colors?: string[];
  fonts?: string;
  layout?: string;
};

export type ReferenceSite = {
  id: string;
  placeId: string;
  name: string;
  address?: string;
  websiteUrl: string;
  rankIndex: number | null;
  category: string;
  title: string | null;
  metaDescription: string | null;
  designTraits?: DesignTraits | null;
  createdAt: string;
};

export type DesignInsights = {
  summary: string;
  byIndustry: Record<string, string>;
  designSummary: string;
  byIndustryDesign: Record<string, string>;
  updatedAt: string | null;
};

export type PricePlans = {
  plans: { id: string; name: string; yen: number; target: string }[];
  removals: Record<string, { yen: number; name: string; note?: string; namePer?: string }>;
  addons: Record<string, { yen: number; name: string }>;
  other: Record<string, { yen: number; name: string; note?: string }>;
};

export const api = {
  getOptions: () => fetchApi<GenerationOptions>('/api/options'),
  setOptions: (o: Partial<GenerationOptions>) =>
    fetchApi<GenerationOptions>('/api/options', { method: 'POST', body: JSON.stringify(o) }),

  getBilling: () => fetchApi<BillingSelection>('/api/billing'),
  setBilling: (b: Partial<BillingSelection>) =>
    fetchApi<BillingSelection>('/api/billing', { method: 'POST', body: JSON.stringify(b) }),

  getPricePlans: () => fetchApi<PricePlans>('/api/price-plans'),
  getPrice: (billing?: BillingSelection) =>
    fetchApi<PriceResult>('/api/price', {
      method: 'POST',
      body: JSON.stringify(billing ?? {}),
    }),
  getStripeConfigured: () => fetchApi<{ configured: boolean }>('/api/stripe-configured'),
  createCheckoutSession: (
    billing: BillingSelection,
    successUrl: string,
    cancelUrl: string
  ) =>
    fetchApi<{ url: string }>('/api/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ billing, successUrl, cancelUrl }),
    }),

  getQueue: () => fetchApi<unknown[]>('/api/queue'),
  removeFromQueue: (id: string) =>
    fetch(`${BASE}/api/queue/${id}`, { method: 'DELETE' }).then((r) => { if (!r.ok) throw new Error(r.statusText); }),
  addToQueue: (body: unknown) =>
    fetchApi<unknown>('/api/queue', { method: 'POST', body: JSON.stringify(body) }),
  collect: (query: string, minReviews?: number, maxResults?: number, hasWebsite?: boolean) =>
    fetchApi<{ added: number; items: unknown[] }>('/api/collect', {
      method: 'POST',
      body: JSON.stringify({ query, minReviews, maxResults, hasWebsite: hasWebsite ?? false }),
    }),

  getReferenceSites: () => fetchApi<ReferenceSite[]>('/api/reference-sites'),
  deleteReferenceSites: () =>
    fetch(`${BASE}/api/reference-sites`, { method: 'DELETE' }).then((r) => { if (!r.ok) throw new Error(r.statusText); }),
  fetchReferenceMeta: () =>
    fetchApi<{ updated: number }>('/api/reference-sites/fetch-meta', { method: 'POST' }),
  analyzeReferenceSites: () =>
    fetchApi<DesignInsights>('/api/reference-sites/analyze', { method: 'POST' }),
  getDesignInsights: () => fetchApi<DesignInsights>('/api/design-insights'),

  processNext: () =>
    fetchApi<unknown>('/api/process-next', { method: 'POST' }),

  getDashboard: () => fetchApi<unknown[]>('/api/dashboard'),
  updateDashboardDm: (id: string, dmBody: string) =>
    fetchApi<unknown>(`/api/dashboard/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ dmBody }),
    }),
  approve: (id: string) =>
    fetchApi<unknown>(`/api/dashboard/${id}/approve`, { method: 'POST' }),
  reject: (id: string) =>
    fetchApi<unknown>(`/api/dashboard/${id}/reject`, { method: 'POST' }),
  markEmailSent: (id: string) =>
    fetchApi<unknown>(`/api/dashboard/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'email_sent' }) }),

  getLearningIndustries: () => fetchApi<string[]>('/api/learning/industries'),
  startLearning: (industry: string, maxResults?: number) =>
    fetchApi<{ status: string }>('/api/learning/start', { method: 'POST', body: JSON.stringify({ industry, maxResults: maxResults ?? 60 }) }),
  getLearningStatus: () => fetchApi<LearningJobStatus>('/api/learning/status'),
  getAutoProcessStatus: () => fetchApi<{ running: boolean }>('/api/auto-process/status'),
  startAutoProcess: () => fetchApi<{ running: boolean }>('/api/auto-process/start', { method: 'POST' }),
  stopAutoProcess: () => fetchApi<{ running: boolean }>('/api/auto-process/stop', { method: 'POST' }),

  getFullAutoStatus: () =>
    fetchApi<{
      status: string;
      phase: string;
      processed: number;
      total: number;
      error: string | null;
      lastNames: string[];
      startedAt: string | null;
      finishedAt: string | null;
    }>('/api/full-auto/status'),
  fullAutoStart: async (body: {
    region: string;
    category: string;
    count: number;
    minReviews: number;
  }) => {
    const res = await fetch(`${BASE}/api/full-auto/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data as { error?: string }).error || res.statusText);
    return data;
  },
};

export type LearningJobStatus = {
  status: 'idle' | 'running' | 'completed' | 'failed';
  industry: string | null;
  maxResults: number | null;
  phase: string;
  current: number;
  total: number;
  result: DesignInsights | null;
  error: string | null;
  startedAt: string | null;
  completedAt: string | null;
};
