/** 標準セクションID（フォームを埋める枠の順序） */
export const STANDARD_SECTION_IDS = [
  'concept',
  'menu',
  'hours',
  'access',
  'price',
  'staff',
  'faq',
  'gallery',
  'contact',
] as const;

export type StandardSectionId = (typeof STANDARD_SECTION_IDS)[number];

/** ページコンテンツ（見出し・本文ブロックの配列） */
export interface PageSection {
  id: string;
  title: string;
  content: string;
  /** セクション用画像（未指定時はテンプレートのデフォルト or 非表示） */
  imageUrl?: string;
}

/** ナビ項目（オプション） */
export interface NavItem {
  label: string;
  href: string;
}

/** ページ全体のデータ */
export interface PageContent {
  siteName: string;
  title: string;
  headline: string;
  subheadline: string;
  sections: PageSection[];
  footerText: string;
  /** 引用ブロック用（A-1 等） */
  quote?: string;
  /** 数字ブロック用（A-3: 実績、B-3: 成果など） */
  stats?: { value: string; label: string }[];
  /** ナビ項目（未指定時はテンプレートのデフォルト表示） */
  navItems?: NavItem[];
  /** プライマリCTA */
  ctaLabel?: string;
  ctaHref?: string;
  /** フッター用 */
  footerAddress?: string;
  footerPhone?: string;
  footerEmail?: string;
  /** ヒーロー複数画像（2枚以上でスライドショー、1枚なら Ken Burns） */
  heroSlides?: string[];
}

/** SEO用データ */
export interface SEOData {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImageUrl: string;
  canonicalUrl: string;
}

/** 業界カテゴリ */
export type IndustryId = 'general' | 'restaurant' | 'medical' | 'salon' | 'tech' | 'realestate' | 'education' | 'retail';

/** 6パターンテンプレートID（絶対ルール準拠） */
export type StyleId =
  | 'minimal_luxury'   // A-1
  | 'dark_edge'        // A-2
  | 'corporate_trust'  // A-3
  | 'warm_organic'     // B-1
  | 'pop_friendly'     // B-2
  | 'high_energy';     // B-3

/** テンプレート定義 */
export interface TemplateOption {
  id: string;
  industryId: IndustryId;
  styleId: StyleId;
  name: string;
  description: string;
  css: string;
}

export const INDUSTRIES: { id: IndustryId; name: string }[] = [
  { id: 'general', name: '一般・その他' },
  { id: 'restaurant', name: '飲食店' },
  { id: 'medical', name: '医療・クリニック' },
  { id: 'salon', name: 'サロン・美容' },
  { id: 'tech', name: 'IT・テック' },
  { id: 'realestate', name: '不動産' },
  { id: 'education', name: '教育' },
  { id: 'retail', name: '小売・EC' },
];

export const STYLES: { id: StyleId; name: string }[] = [
  { id: 'minimal_luxury', name: 'Minimal Luxury' },
  { id: 'dark_edge', name: 'Dark Edge' },
  { id: 'corporate_trust', name: 'Corporate Trust' },
  { id: 'warm_organic', name: 'Warm Organic' },
  { id: 'pop_friendly', name: 'Pop & Friendly' },
  { id: 'high_energy', name: 'High Energy' },
];

// --- ターゲット収集・キュー・検閲用 ---

export type TargetSource = 'google_maps' | 'manual';

/** 実在確認用シグナル（Google Maps 由来の項目） */
export interface VerificationSignals {
  placeId: string | null;
  mapsUrl: string | null;
  rating: number | null;
  userRatingsTotal: number | null;
  hasOpeningHours: boolean;
  hasPhoto: boolean;
  /** 信頼度の目安: レビュー数などから「要確認」を出す */
  needsVerification: boolean;
}

/** キューに入っているターゲット（Webサイトなしの店舗候補） */
export interface QueueTarget {
  id: string;
  source: TargetSource;
  name: string;
  address: string;
  /** Google Place ID（手動の場合は null） */
  placeId: string | null;
  /** 手動追加時のメモ（Instagram URL など） */
  notes: string;
  /** 収集時のシグナル（手動の場合は空に近い） */
  signals: VerificationSignals;
  /** 業種・カテゴリ（Maps の types や手動入力） */
  category: string;
  createdAt: string; // ISO
}

/** 調査済みデータ（AIは使わず、Maps取得＋手動入力） */
export interface ResearchedShop {
  queueId: string;
  name: string;
  address: string;
  concept: string;
  strengths: string;
  /** テンプレートの styleId をそのままイメージカラーとして使用 */
  imageColorStyleId: StyleId;
  category: string;
  notes: string;
  signals: VerificationSignals;
}

/** 検閲ダッシュボード用の1件（調査済み＋LP生成済み） */
export interface DashboardItem {
  id: string;
  researched: ResearchedShop;
  content: PageContent;
  seo: SEOData;
  templateId: string;
  /** DM文面（手動入力または後でAIで生成する用のプレースホルダ） */
  dmBody: string;
  status: 'pending' | 'approved' | 'rejected' | 'email_sent';
  createdAt: string;
}

/** AI利用上限（将来AI組み込み時に、上限に達したら処理を止める用） */
export interface AIBudgetSettings {
  /** 月額上限（円）。0 は「上限なし」 */
  monthlyLimitYen: number;
  /** 今月の利用額（円）。現状AI未使用のため常に0。将来サーバー側で集計する想定 */
  spentThisMonth: number;
  /** 集計対象の月 YYYY-MM */
  monthKey: string;
}

/** 生成オプション（フルオート用・スイッチでオンオフ） */
export interface GenerationOptions {
  /** 多言語対応 */
  multiLanguage: boolean;
  /** 問い合わせフォームを設置 */
  contactForm: boolean;
  /** フォーム送信先URL */
  formActionUrl?: string;
  /** Instagram・LINE などのリンクを埋め込む */
  instagramLine: boolean;
  /** 「Presented by」表記を表示 */
  presentedBy: boolean;
  /** QRコードを発行して掲載 */
  qrCode: boolean;
  /** QRコードでエンコードするURL */
  qrCodeTargetUrl?: string;
}

/** buildHtml に渡すオプション用（SNS URL・QR画像など） */
export interface BuildHtmlGenOptions {
  contactForm?: boolean;
  formActionUrl?: string;
  instagramLine?: boolean;
  instagramUrl?: string;
  lineUrl?: string;
  qrCode?: boolean;
  qrCodeDataUrl?: string;
  qrCodeTargetUrl?: string;
  presentedBy?: boolean;
}

/** ダッシュボード1件（API返却・3案入り） */
export interface DashboardItemWithVariants extends Omit<DashboardItem, 'content' | 'seo' | 'templateId'> {
  content: PageContent;
  seo: SEOData;
  templateId: string;
  /** 上位3テンプレの完成HTML */
  contentVariants?: { templateId: string; html: string }[];
}
