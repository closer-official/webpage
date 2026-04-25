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
  /**
   * beauty_salon_mellow: `<!--BSM:id-->` スロットの上書きテキスト（キー未指定・空はテンプレ既定のまま）
   */
  beautySalonMellowSlots?: Record<string, string>;
  /** beauty_salon_mellow: WEB予約ボタン等の遷移先（ホットペッパー店舗ページなど） */
  beautySalonReserveUrl?: string;
  /**
   * beauty_salon_mellow: Access の Google マップを iframe 全文で埋め込み（URL 単体より優先）。
   * 許可されるのは Google マップ系 iframe の src のみを抽出した安全なマークアップ。
   */
  mapEmbedHtml?: string;
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
  /**
   * cafe_1：テキストメニュー（MEO・クローラ向け）。画像のみのお品書きの代替・併用に。
   */
  cafeMenuTextRows?: { groupLabel?: string; name: string; price?: string; description?: string; badge?: string }[];
  /**
   * cafe_1：Restaurant JSON-LD 用（servesCuisine / priceRange / 営業時間 / 住所の分解）。
   * 未指定の住所項目は footerAddress を streetAddress として流用します。
   */
  cafeMeo?: {
    servesCuisine: string;
    priceRange: string;
    /** 例: ["Mo-Su 11:00-22:00"] または曜日ごと ["Mo 11:00-23:00", "Tu 11:00-23:00", …]（本文の営業時間と揃える） */
    openingHours?: string[];
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
  };
  /** cafe_1：フローティング「地図」ボタン優先URL（未指定時は先頭店舗の mapUrl） */
  cafeFloatingMapUrl?: string;
  /**
   * cafe_1：公開投稿の Instagram URL（blockquote 埋め込み用。プロフィールURLは不可）
   */
  cafeInstagramPermalink?: string;
  /** cafe_1：Googleクチコミ導線（固定バナー） */
  cafeReviewCtaText?: string;
  /** cafe_1：Googleクチコミ投稿URL */
  cafeReviewCtaUrl?: string;
  /** cafe_1：Googleビジネスプロフィール投稿/最新情報の埋め込みURL */
  cafeGbPostsEmbedUrl?: string;
  /** cafe_1：Instagram投稿グリッド（途中表示） */
  cafeInstagramFeedItems?: { imageUrl: string; postUrl: string }[];
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
  /** cafe_1：フッターに LINE アイコンリンクを出す場合 */
  footerLineUrl?: string;
  /** cafe_1：フッターに X（旧Twitter）アイコンリンクを出す場合 */
  footerTwitterUrl?: string;
  /** ramen_2 など：フッターに TikTok アイコンリンクを出す場合 */
  footerTiktokUrl?: string;
  /** ramen_2：クイック情報バー — 営業時間 */
  ramen2Hours?: string;
  /** ramen_2：クイック情報バー — 定休日 */
  ramen2Closed?: string;
  /** ramen_2：クイック情報バー — 最寄り駅・アクセス */
  ramen2Station?: string;
  /**
   * navy_cyan_consult のみ: 埋め込む LP のフォルダ名（public/deliverables/{slug}/）。
   * 未指定時は web-closer-intro（テンプレ14・自社紹介 LP）。納品デモは japanese-history-higashi 等を指定。
   */
  navyDeliverableSlug?: string;
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

/** テンプレートID（運用ビルトインは4種。旧IDは保存済みLP・buildHtml互換のため型に残す） */
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
  | 'ramen_2'            // 12b. ラーメン弐（クイック情報バー・SNS・buildHtml ビルトイン）
  | 'beauty_salon_mellow' // 12c. 美容室 mellow（マルチページ・docs 由来の生成 HTML + shared 差し替え）
  | 'beauty_salon_hpb' // 12d. 美容室 HPB編集用（mellow互換）
  | 'academy_lp'         // 13. 高CVセールスLP
  | 'navy_cyan_consult' // 14. ダークネイビー×シアン（既定LP: web-closer-intro）
  | 'gym_personal_neon' // 15. パーソナルジム・ネオンシアン（固定HTML: gym-valx-intro）
  | 'wiki_ensyuritsu' // 16. wiki円室律・オリジナル（embed 固定HTML）
  | 'wiki_sauna' // 17. wiki湯環・サウナWiki（embed 固定HTML）
  | 'studio_blush_editorial'; // 18. ブラッシュ・創作スタジオ（撮影・ポートフォリオ）

/** テンプレートあたりのバリアント数（現状 1） */
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

/** 新規選択UIに出すビルトイン（公開ギャラリー掲載の3種と一致。StyleId 型はレガシーJSON用に旧IDも残す） */
export const STYLES: { id: StyleId; name: string }[] = [
  { id: 'cafe_1', name: '複数店舗・ミニマル' },
  { id: 'gym_personal_neon', name: 'CLOSER・ジム販売LP（gym-valx）' },
  { id: 'navy_cyan_consult', name: 'ネイビー×シアン（Web/LP）' },
  { id: 'wiki_ensyuritsu', name: 'wiki円室律（オリジナル・ナレッジ）' },
  { id: 'wiki_sauna', name: 'wiki湯環（ウェルネス・サウナWiki）' },
  { id: 'beauty_salon_mellow', name: '美容室 mellow（マルチページ）' },
  { id: 'beauty_salon_hpb', name: '美容室 HPB編集用（取り込み対応）' },
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

/** 営業フェーズ（検閲ダッシュボード・送付管理） */
export type OutreachPhase =
  | 'pre_contact'
  | 'first_contact'
  /** 初回送信後（5日で再送待ちへ自動遷移） */
  | 'message_sent'
  /** 初回送信から5日経過後の待機フェーズ */
  | 'resend_wait'
  /** 再送を実施した状態（7日間変化なしで失注へ自動遷移） */
  | 'resend_sent'
  /** 再送対象から外す状態（SNS/連絡先不備など） */
  | 'resend_unavailable'
  | 'hearing'
  | 'proposal'
  | 'contracted'
  | 'payment_confirmed'
  | 'lost'
  | 'no_outreach_channel'
  /** @deprecated 保存値の互換。正規化後は pre_contact */
  | 'pending_send'
  /** @deprecated 保存値の互換。正規化後は proposal */
  | 'awaiting_reply'
  /** @deprecated 保存値の互換。正規化後は hearing */
  | 'appointment'
  /** @deprecated 保存値の互換。正規化後は contracted */
  | 'won'
  /** @deprecated 互換。正規化後は message_sent */
  | 'sent'
  /** @deprecated 保存値の互換。正規化後は no_outreach_channel */
  | 'sleep';

/** 検閲ダッシュボード用の1件（調査済み＋LP生成済み） */
export interface DashboardItem {
  id: string;
  researched: ResearchedShop;
  content: PageContent;
  seo: SEOData;
  templateId: string;
  /** DM文面（手動入力または後でAIで生成する用のプレースホルダ） */
  dmBody: string;
  /** 送付用 DM のテンプレパターン（1–5）。未指定時はクライアントで①扱い */
  outreachDmPattern?: '1' | '2' | '3' | '4' | '5' | '6';
  /** 美容送付DM: 本文の「【褒めポイント】」に差し込む短文（飲食側では先頭1行として使う場合あり） */
  outreachDmCustomFirstLine?: string;
  /** キュー経由時など、フッター用 Instagram URL のスナップショット（content.footerInstagramUrl と併用可） */
  footerInstagramUrl?: string;
  /** フッター用 X（Twitter）URL のスナップショット（content.footerTwitterUrl と併用可） */
  footerTwitterUrl?: string;
  status: 'pending' | 'approved' | 'rejected' | 'email_sent';
  createdAt: string;
  /**
   * ダッシュボード案件の送付フェーズ（UI では9種に集約表示）。
   */
  outreachPhase?: OutreachPhase;
  /** outreachPhase === proposal のときフォロー開始（この日時から3か月後に自動で message_sent） */
  replyWaitStartedAt?: string;
  /** 送付フェーズを最後に変更した日時（message_sent→再送待ち→再送済み等の自動遷移判定に利用） */
  outreachPhaseChangedAt?: string;
  /** 旧 sleep のときの再送目安（ISO）。no_outreach_channel 移行後は未使用になり得る */
  sleepUntil?: string;
  /** 配信停止ページ用の秘密トークン（URLに含める） */
  unsubscribeToken?: string;
  /** 店主が配信停止フォームで任意入力した一言 */
  optOutFeedback?: string;
  /** 配信停止が記録された日時（ISO） */
  optedOutAt?: string;
  /**
   * 失注（却下 or 送信済みかつ outreachPhase === lost）に入った日時（ISO）。
   * 未設定の旧データは phase-tick 初回で createdAt/updatedAt から補完され、3か月後に送信前へ戻る。
   */
  outreachLostAt?: string;
  /** 管理者画面用: プレビューURLの閲覧回数（サーバーで加算） */
  viewCount?: number;
  /** 検閲プレビュー編集で保存した追加CSS（data-pe セレクタ） */
  previewEditCss?: string;
  /** 3案LPのときの各テンプレHTML（保存時に再生成される） */
  contentVariants?: { templateId: string; html: string }[];
  /** 店舗ドラフト（template-customizations）と紐づくときのカスタム ID（作業者用保存で自動付与） */
  linkedTemplateCustomizationId?: string;
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
  /** navy_cyan_consult（納品LPクローン）フッター・CTA の TikTok リンク */
  tiktokUrl?: string;
  /** navy_cyan_consult: PageContent に無いときの deliverables フォルダ名（プレビュー用） */
  navyDeliverableSlug?: string;
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
