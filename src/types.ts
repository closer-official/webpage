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
  /** よくある質問（アコーディオン用・cafe等） */
  faqItems?: { q: string; a: string }[];
  /** 料金表（メニュー表用・cafe等） */
  priceRows?: { name: string; price: string }[];
  /** ヘアカタログ等の複数画像（美容室テンプレ用） */
  catalogImages?: string[];
  /** アクセス用マップURL（iframe埋め込み用・任意） */
  mapEmbedUrl?: string;
  /** 整骨院テンプレ用：悩み・症状リスト（ファーストビュー直下） */
  symptomItems?: string[];
  /** 整骨院テンプレ用：選ばれる理由（ナンバリング＋タイトル＋本文） */
  reasonItems?: { num: string; title: string; body: string }[];
  /** 整骨院テンプレ用：図解ラベル（例: 心・身体・自律神経＝3円） */
  conceptDiagramLabels?: string[];
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

/** 10種類テンプレートID（業種別・2025方針） */
export type StyleId =
  | 'salon_barber'       // 1. 個人美容室・理容室（最優先）
  | 'cafe_tea'           // 2. 隠れ家カフェ・喫茶店（旧 warm_organic）
  | 'bakery'             // 3. 街のパン屋・ケーキ屋
  | 'clinic_chiropractic'// 4. 自費診療の整骨院・整体・鍼灸
  | 'gym_yoga'           // 5. パーソナルジム・ヨガスタジオ
  | 'builder'            // 6. 街の工務店・リノベーション業者
  | 'professional'       // 7. 士業（行政書士・税理士・社労士）
  | 'cram_school'        // 8. 個別指導塾・習い事教室
  | 'izakaya'            // 9. こだわり居酒屋・ダイニングバー
  | 'pet_salon';         // 10. ペットサロン・ドッグトレーニング

/** テンプレートあたりのバリアント数（10×5 = 50 スロット） */
export const SHOWCASE_VARIANT_COUNT = 5;

/** バリアント番号 0 ～ (SHOWCASE_VARIANT_COUNT - 1) */
export type VariantIndex = 0 | 1 | 2 | 3 | 4;

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
  { id: 'salon_barber', name: '個人美容室・理容室' },
  { id: 'cafe_tea', name: '隠れ家カフェ・喫茶店' },
  { id: 'bakery', name: '街のパン屋・ケーキ屋' },
  { id: 'clinic_chiropractic', name: '整骨院・整体・鍼灸' },
  { id: 'gym_yoga', name: 'パーソナルジム・ヨガ' },
  { id: 'builder', name: '工務店・リノベ' },
  { id: 'professional', name: '士業' },
  { id: 'cram_school', name: '塾・習い事教室' },
  { id: 'izakaya', name: 'こだわり居酒屋・バー' },
  { id: 'pet_salon', name: 'ペットサロン・ドッグ' },
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
  /** Maps 検索時のクエリ（例: 港区 ホテル）。テンプレ自動選択に使用 */
  searchQuery?: string;
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
