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
  /** 整骨院・ジムテンプレ用：選ばれる理由（ナンバリング＋タイトル＋本文） */
  reasonItems?: { num: string; title: string; body: string }[];
  /** 整骨院テンプレ用：図解ラベル（例: 心・身体・自律神経＝3円） */
  conceptDiagramLabels?: string[];
  /** 塾・習い事テンプレ用：学年・年齢別セグメントナビ（幼児・小学生・中学生など） */
  segmentItems?: { label: string; href: string }[];
  /** 塾テンプレ用：固定フッターの第二CTA（例: 資料請求） */
  ctaSecondaryLabel?: string;
  ctaSecondaryHref?: string;
  /** ペットサロンテンプレ：サービス（絵文字等アイコン・見出し・本文・視覚的わかりやすさ） */
  petServiceItems?: { icon: string; title: string; body: string }[];
  /** ペットサロンテンプレ：注意・規約（アコーディオンで畳んで表示） */
  petPolicyItems?: { title: string; body: string }[];
  /** 士業テンプレ：ヒーロー直下の強みチップ（例: 初回相談無料） */
  proTrustBullets?: string[];
  /** 士業テンプレ：ご相談からの流れ（ステップ番号・見出し・本文） */
  proStepItems?: { step: string; title: string; body: string }[];
  /** 士業テンプレ：業務内容・サービス一覧（アイコン・見出し・本文） */
  proServiceItems?: { icon: string; title: string; body: string }[];
  /** パーソナルジムテンプレ：ヒーローに表示する資格バッジ（例: NSCA-CPT保持） */
  gymHeroBadge?: string;
  /** パーソナルジムテンプレ：メニュー比較カード（パーソナル対面 / オンラインコーチングなど） */
  gymMenuCards?: { title: string; body: string; price?: string }[];
  /** パーソナルジムテンプレ：トレーナーの決めゼリフ（吹き出し用・例: バルク足りすぎてんだろー！） */
  gymTrainerQuote?: string;
  /** パーソナルジムテンプレ：クライアントの生の声（実績写真の下などに表示） */
  gymClientVoices?: string[];
  /** パーソナルジムテンプレ：トレーナー紹介Q&A（好きな種目は？など） */
  gymTrainerQa?: { q: string; a: string }[];
  /** パーソナルジムテンプレ：予約ボタン近くに大きく表示する支払い案内（例: お支払いは当日現地にて・キャッシュレス対応） */
  gymPaymentNote?: string;
  /** パーソナルジムテンプレ：選ばれる理由のアイコン（絵文字またはキー: badge / phone / muscle など） */
  gymReasonIcons?: string[];
  /** パーソナルジムテンプレ：フッターSNSリンク（Instagram, TikTok など） */
  gymFooterSns?: { label: string; href: string }[];
  /** パーソナルジム：「こんな方へ」ブロック直下のリード（任意） */
  gymAudienceIntro?: string;
  /** パーソナルジム：訴求セグメント（例: 体になりたい／フォーム・モチベ／ファン） */
  gymAudienceHooks?: { tag: string; title: string; body: string }[];
  /** パーソナルジム：メニュー見出し直下のリード文（未指定時はデフォルト） */
  gymMenuLede?: string;
  /** パーソナルジム：対面 vs オンライン比較表の行 */
  gymMenuCompareRows?: { feature: string; onsite: string; online: string }[];
  /** パーソナルジム：1セッションの流れ（ステップ） */
  gymProgramSteps?: { title: string; body: string }[];
  /**
   * パーソナルジム：実績数値のカウントアップ（stats と同じ並びのインデックスに対応。未指定インデックスは通常表示）
   */
  gymStatAnimations?: { end: number; suffix: string }[];
  /** cafe_1：複数店舗のメニュー画像・PDF 等（別タブで開く） */
  cafeBranchMenuItems?: { groupLabel?: string; label: string; menuUrl: string }[];
  /** cafe_1：店舗一覧（SHOP）。指定時は access セクションでカード表示 */
  cafeShopLocations?: {
    name: string;
    /** 営業時間・電話・住所など（改行で段落分け） */
    detail: string;
    mapUrl?: string;
    reserveLabel?: string;
    reserveUrl?: string;
    imageUrl?: string;
  }[];
  /** cafe_1：フッターに Instagram アイコンリンクを出す場合 */
  footerInstagramUrl?: string;
}

/** SEO用データ */
export interface SEOData {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImageUrl: string;
  canonicalUrl: string;
  /**
   * canonicalUrl が空のとき `https://{スラッグ}.{親ドメイン}/` を自動で使う。
   * 例: `closer-official.com` / `store-official.net`（https://は不要）
   * event テンプレは未指定でも `event-view.net` が既定（buildHtml 側）。
   */
  autoCanonicalHost?: string;
}

/** 業界カテゴリ */
export type IndustryId = 'general' | 'restaurant' | 'medical' | 'salon' | 'tech' | 'realestate' | 'education' | 'retail';

/** 15種類テンプレートID（業種別+LP） */
export type StyleId =
  | 'salon_barber'       // 1. 個人美容室・理容室
  | 'cafe_tea'           // 2. カフェ・喫茶・パン・スイーツ
  | 'cafe_1'             // 2b. カフェ（複数店舗・ミニマル）
  | 'clinic_chiropractic'// 3. 整骨院・整体・鍼灸
  | 'gym_yoga'           // 4. パーソナルジム・ヨガ
  | 'builder'            // 5. 工務店・リノベ
  | 'professional'       // 6. 士業
  | 'cram_school'        // 7. 塾・習い事教室
  | 'izakaya'            // 8. こだわり居酒屋・バー
  | 'pet_salon'          // 9. ペットサロン・ドッグ
  | 'apparel'            // 10. アパレル
  | 'event'              // 11. イベント
  | 'ramen'              // 12. ラーメン
  | 'academy_lp'         // 13. 高CVセールスLP
  | 'navy_cyan_consult'; // 14. ダークネイビー×シアン（講座・コンサルLP）

/** テンプレートあたりのバリアント数（11×1 = 11 スロットでスタート） */
export const SHOWCASE_VARIANT_COUNT = 1;

/** バリアント番号 0 ～ (SHOWCASE_VARIANT_COUNT - 1) */
export type VariantIndex = 0;

/** テンプレート定義 */
export interface TemplateOption {
  id: string;
  industryId: IndustryId;
  styleId: StyleId;
  name: string;
  description: string;
  css: string;
}

/** 雰囲気・フォント・ナビなどテンプレートの見た目だけを上書き（業種はそのまま） */
export interface StyleOverrides {
  /** フォントファミリ（例: "Noto Sans JP" / "Yu Mincho"） */
  fontFamily?: string;
  /** ナビの出し方: sticky=固定ヘッダー, drawer=ハンバーガーで開く */
  navStyle?: 'sticky' | 'drawer';
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
  { id: 'cafe_tea', name: 'カフェ・喫茶・パン・スイーツ' },
  { id: 'cafe_1', name: 'カフェ（複数店舗・ミニマル）' },
  { id: 'clinic_chiropractic', name: '整骨院・整体・鍼灸' },
  { id: 'gym_yoga', name: 'パーソナルジム・ヨガ' },
  { id: 'builder', name: '工務店・リノベ' },
  { id: 'professional', name: '士業' },
  { id: 'cram_school', name: '塾・習い事教室' },
  { id: 'izakaya', name: 'こだわり居酒屋・バー' },
  { id: 'pet_salon', name: 'ペットサロン・ドッグ' },
  { id: 'apparel', name: 'アパレル' },
  { id: 'event', name: 'イベント' },
  { id: 'ramen', name: 'ラーメン' },
  { id: 'academy_lp', name: 'ハイコンバージョンLP' },
  { id: 'navy_cyan_consult', name: 'ネイビー×シアン（講座・コンサル）' },
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
  /** テンプレートの styleId（雰囲気・業種に合わせて選択） */
  imageColorStyleId: StyleId;
  /** フォント・ナビなど見た目だけの上書き（業種は imageColorStyleId のまま） */
  styleOverrides?: StyleOverrides;
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
  /** 管理者画面用: プレビューURLの閲覧回数（サーバーで加算） */
  viewCount?: number;
  /** 検閲プレビュー編集で保存した追加CSS（data-pe セレクタ） */
  previewEditCss?: string;
  /** 3案LPのときの各テンプレHTML（保存時に再生成される） */
  contentVariants?: { templateId: string; html: string }[];
  /** マスターから「個別用に複製」したときのメモ（例: A社向け） */
  personalizationLabel?: string;
  /** 予約システムで確定済みの枠キー `YYYY-MM-DD_HH:mm` */
  bookingSlots?: string[];
  /** 予約通知を送るメール（未指定時は content.footerEmail） */
  bookingNotifyEmail?: string;
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

/** buildHtml に渡すオプション用（SNS URL・QR画像・スタイル上書きなど） */
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
  /** フォント・ナビなど見た目だけの上書き（テンプレートはそのまま） */
  styleOverrides?: StyleOverrides;
  /** LP埋め込み用「料金・お支払い」フォームの取得元URL（未指定時は同一オリジン /api/lp-payment-form） */
  paymentFormBaseUrl?: string;
  /** 予約オプション契約時: 全テンプレで画面下に予約UIを出す */
  bookingEnabled?: boolean;
  /** ダッシュボード案件ID（/api/preview/:id と予約APIの紐付け） */
  bookingItemId?: string;
  /** 予約APIのオリジン（blobプレビュー時などに埋め込む） */
  bookingApiOrigin?: string;
}

/** ダッシュボード1件（API返却・3案入り） */
export interface DashboardItemWithVariants extends Omit<DashboardItem, 'content' | 'seo' | 'templateId'> {
  content: PageContent;
  seo: SEOData;
  templateId: string;
  /** 上位3テンプレの完成HTML */
  contentVariants?: { templateId: string; html: string }[];
}
