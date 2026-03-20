// 本番: 同じオリジン。ローカル開発: VITE_API_URL があれば直叩き、なければ Vite の /api プロキシ（127.0.0.1:3001）
function getApiBase(): string {
  if (typeof window === 'undefined') return '';
  if (!/localhost|127\.0\.0\.1/.test(window.location.origin)) return '';
  const u = (import.meta.env.VITE_API_URL || '').trim();
  return u || '';
}
const BASE = getApiBase();

export type GenerationOptions = {
  multiLanguage: boolean;
  contactForm: boolean;
  formActionUrl?: string;
  qrCodeTargetUrl?: string;
  instagramLine: boolean;
  presentedBy: boolean;
  qrCode: boolean;
};

export type AdminAuthStatus = {
  enabled: boolean;
  authenticated: boolean;
};

export type DesignBlueprint = {
  version: 1;
  tokens?: {
    space?: Record<string, number>;
    colors?: {
      bg?: string;
      text?: string;
      accent?: string;
      muted?: string;
      surface?: string;
      border?: string;
    };
    type?: Record<string, string | number>;
    radius?: Record<string, number>;
    topColors?: string[];
  };
  layout?: Record<string, unknown>;
  typography?: Record<string, string>;
  composition?: Record<string, string>;
  meta?: { sourceUrl?: string; extractedAt?: string; note?: string };
};

export type TemplateCandidate = {
  id: string;
  name: string;
  baseTemplateId: string;
  isCustom: boolean;
  /** 参考URLから数値化した新規設計（既存業種テンプレではない） */
  kind?: 'blueprint' | 'skin';
  /** 下書きは一般のヒアリング候補に出ない */
  status?: 'draft' | 'published';
  customization?: {
    id: string;
    name: string;
    baseTemplateId: string;
    status?: 'draft' | 'published';
    sourceUrl?: string;
    blueprint?: DesignBlueprint;
    override?: {
      headline?: string;
      subheadline?: string;
      navLabels?: string;
      theme?: { bg?: string; text?: string; accent?: string };
    };
  };
};

export type StyleFingerprint = {
  topColors?: string[];
  sampleFonts?: string[];
  extractedAt?: string;
  sourceUrl?: string;
};

export type TemplateCustomization = {
  id: string;
  name: string;
  baseTemplateId: string;
  /** baseTemplateId === 'blueprint' のとき参考設計の数値ブループリント */
  blueprint?: DesignBlueprint;
  status?: 'draft' | 'published';
  sourceUrl?: string;
  sourceIntakeId?: string;
  fingerprint?: StyleFingerprint;
  override?: {
    headline?: string;
    subheadline?: string;
    navLabels?: string;
    theme?: { bg?: string; text?: string; accent?: string };
  };
  createdAt: string;
  updatedAt: string;
};

export type CustomerIntakeItem = {
  id: string;
  storeName: string;
  contactName: string;
  contactMethod: string;
  contactValue: string;
  status?: 'draft' | 'submitted' | string;
  plan: string;
  websiteGoal?: string;
  targetAudience?: string;
  designTastes?: string[];
  mainColor?: string;
  chosenTemplateId: string;
  styleDetail?: string;
  favoriteSiteUrl?: string;
  currentActivityUrl?: string;
  requestSummary?: string;
  mustHaveContent?: string;
  createdAt: string;
  updatedAt?: string;
  previewUrl: string;
  /** 参考URLから自動生成したカスタムテンプレ下書きID */
  styleDraftTemplateId?: string;
  extractStyleToDraft?: boolean;
};

export function isApiAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  // 本番（Vercel 等）
  if (!/localhost|127\.0\.0\.1/.test(window.location.origin)) return true;
  // ローカル: プロキシ or VITE_API_URL のどちらかで API に届く
  return import.meta.env.DEV || !!BASE.trim();
}

/** 案件のLPを表示する共有用URL（本番ではスマホ等でも開ける） */
export function getPreviewPublicUrl(id: string): string {
  if (typeof window === 'undefined') return '';
  const origin = BASE && BASE.startsWith('http') ? new URL(BASE).origin : window.location.origin;
  return `${origin}/api/preview/${encodeURIComponent(id)}`;
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

export type PriceResult = {
  amountYen: number;
  items: { name: string; yen: number }[];
  /** 紹介コードで通常/学割の基本料金が0円になったとき true */
  referralBaseWaived?: boolean;
};

/** プラン・削除/追加オプション（料金算出・Stripe用） */
export type BillingSelection = {
  /** `studentReferral` は旧保存データ用（UIでは学割に正規化） */
  plan?: 'normal' | 'student' | 'studentReferral';
  /** 発行済み紹介コード。サーバーで照合し、有効なら通常/学割の基本料金のみ0円（オプションは別途） */
  referralCode?: string;
  contactFormRemoval?: boolean;
  snsFeedRemoval?: boolean;
  mapRemoval?: boolean;
  languageRemovalCount?: number;
  presentedByRemoval?: boolean;
  customQrCode?: boolean;
  webCoupon?: boolean;
  storeOfficialSubdomain?: boolean;
  /** 独自ドメインの契約年数（1年あたり5,000円） */
  customDomainYears?: number;
  /** @deprecated 旧データ互換。storeOfficialSubdomain と同義 */
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

/** その他サービス: 定額チェック or 年数×単価 */
export type PriceOtherOption =
  | { yen: number; name: string; note?: string }
  | { yenPerYear: number; maxYears?: number; name: string; note?: string };

export type PricePlans = {
  plans: { id: string; name: string; yen: number; target: string }[];
  removals: Record<string, { yen: number; name: string; note?: string; namePer?: string }>;
  addons: Record<string, { yen: number; name: string }>;
  other: Record<string, PriceOtherOption>;
};

export const api = {
  getAdminAuthStatus: () => fetchApi<AdminAuthStatus>('/api/admin-auth/status'),
  loginAdmin: (username: string, password: string) =>
    fetchApi<{ ok: boolean; enabled?: boolean }>('/api/admin-auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  logoutAdmin: () => fetchApi<{ ok: boolean }>('/api/admin-auth/logout', { method: 'POST' }),
  getTemplateCandidates: () => fetchApi<TemplateCandidate[]>('/api/template-candidates'),
  getTemplateCustomizations: () => fetchApi<TemplateCustomization[]>('/api/template-customizations'),
  saveTemplateCustomization: (body: {
    mode: 'create' | 'update';
    id?: string;
    name?: string;
    baseTemplateId?: string;
    blueprint?: DesignBlueprint;
    status?: 'draft' | 'published';
    sourceUrl?: string;
    sourceIntakeId?: string;
    fingerprint?: StyleFingerprint;
    override?: TemplateCustomization['override'];
  }) =>
    fetchApi<{ ok: boolean; item: TemplateCustomization }>('/api/template-customizations/save', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  publishTemplateCustomization: (id: string) =>
    fetchApi<{ ok: boolean; item: TemplateCustomization }>('/api/template-customizations/publish', {
      method: 'POST',
      body: JSON.stringify({ id }),
    }),
  extractStyleFromUrl: (url: string) =>
    fetchApi<{
      ok: boolean;
      blueprint: DesignBlueprint;
      fingerprint: StyleFingerprint & { sourceUrl?: string };
      suggestedOverride: { theme?: { bg?: string; text?: string; accent?: string } };
    }>('/api/style-reference/extract', { method: 'POST', body: JSON.stringify({ url }) }),
  /** 参考設計ブループリントのHTMLプレビュー（管理者Cookie必須） */
  previewDesignBlueprint: async (body: {
    blueprint: DesignBlueprint;
    override?: TemplateCustomization['override'];
  }) => {
    const res = await fetch(`${BASE}/api/design-blueprint/preview`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error || res.statusText);
    }
    return res.text();
  },
  getCustomerIntakeList: () => fetchApi<CustomerIntakeItem[]>('/api/customer-intake-list'),

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
    fetchApi<{
      url: string | null;
      free?: boolean;
      amountYen?: number;
      message?: string;
    }>('/api/create-checkout-session', {
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

  /** 管理者画面用: コンテンツ・SEO を更新 */
  updateDashboardContent: (id: string, content: unknown, seo?: unknown) =>
    fetchApi<unknown>(`/api/dashboard/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(seo !== undefined ? { content, seo } : { content }),
    }),

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
    const text = await res.text();
    let data: { error?: string } = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { error: text.slice(0, 200) || res.statusText };
    }
    if (!res.ok) {
      const msg =
        (data as { error?: string }).error ||
        (res.status === 502 || res.status === 503
          ? 'APIサーバーに接続できません。ターミナルで npm run server（ポート3001）を起動してください。'
          : text.slice(0, 300) || res.statusText);
      throw new Error(msg);
    }
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
