/**
 * ブループリント用のオリジナル文言・構成（参考サイトの文章は使用しない）
 */

const NAV_LABELS = ['トップ', '概要', '内容', '実績', 'FAQ', 'お問い合わせ'];

const SECTION_TITLES = [
  'このサービスについて',
  '選ばれる理由',
  'ご利用の流れ',
  '料金・プラン',
  'よくある質問',
  'お問い合わせ',
];

const SECTION_BODIES = [
  'ここに事業の概要や提供価値を、読み手に伝わるように記載します。参考サイトの雰囲気に合わせた余白・階層で表示しています。',
  '強みや差別化ポイントを箇条書きや短い段落で整理します。実際の原稿はヒアリング後に差し替えます。',
  'お申し込みから完了までのステップを分かりやすく示します。必要に応じて図解や番号付きリストを追加できます。',
  '料金体系やお支払い方法を明記します。税表記や注意事項もここにまとめられます。',
  'よくある疑問に簡潔に回答します。項目数はブループリントのセクション数に合わせて調整されます。',
  'フォーム・LINE・メールなど、希望の連絡手段を案内します。',
];

/**
 * ダーク系・グラデCTAの参考LPに近い静的レイアウト用（文章はプレースホルダ）
 * @param {object} blueprint
 */
function generateDarkLpPageModel(blueprint) {
  const layout = blueprint?.layout || {};
  const n = Math.min(12, Math.max(3, layout.sectionCount || 5));
  const navCount = Math.min(6, Math.max(2, layout.navApproxItems || 4));

  const navItems = NAV_LABELS.slice(0, navCount).map((label, i) => ({
    label,
    href: i === 0 ? '#top' : `#sec-${i}`,
  }));

  const sections = [];
  for (let i = 0; i < n; i++) {
    sections.push({
      id: `sec-${i + 1}`,
      title: SECTION_TITLES[i % SECTION_TITLES.length],
      content: SECTION_BODIES[i % SECTION_BODIES.length],
    });
  }

  const heroImage =
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1400&q=85';
  const sectionImage =
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80';

  return {
    variant: 'dark_lp',
    siteName: 'ブランド名（プレースホルダ）',
    title: 'プレースホルダ | 参考設計プレビュー',
    heroKicker: 'プロフェッショナル / サンプル肩書き',
    heroTitle: '山田 太郎',
    /** @type {{ text: string; mark?: boolean }[]} */
    heroLeadSegments: [
      { text: '成果は「情報の量」ではなく、' },
      { text: 'どう事業に落とし込めるか。', mark: true },
      { text: ' 意思決定に必要なのは「判断基準」です。参考URLから抽出した配色・余白・CTAの形状に近づけたプレビューです。' },
    ],
    heroWatermark: 'YAMADA TARO',
    navItems,
    sections,
    heroImage,
    sectionImage,
    ctaLabel: '個別説明会に参加する',
    ctaBadge: '無料',
    ctaHref: '#contact',
    footerText: `© ${new Date().getFullYear()} サンプル（プレビュー）`,
    moodTag: 'dark,business',
  };
}

/** @param {object} blueprint buildDesignBlueprintFromHtml の戻り値 */
export function generateBlueprintPageModel(blueprint) {
  const vs = blueprint?.visualStyle;
  if (vs === 'dark_gradient_lp' || vs === 'dark_hero') {
    return generateDarkLpPageModel(blueprint);
  }

  const layout = blueprint?.layout || {};
  const n = Math.min(12, Math.max(3, layout.sectionCount || 5));
  const navCount = Math.min(6, Math.max(2, layout.navApproxItems || 4));

  const navItems = NAV_LABELS.slice(0, navCount).map((label, i) => ({
    label,
    href: i === 0 ? '#top' : `#sec-${i}`,
  }));

  const sections = [];
  for (let i = 0; i < n; i++) {
    sections.push({
      id: `sec-${i + 1}`,
      title: SECTION_TITLES[i % SECTION_TITLES.length],
      content: SECTION_BODIES[i % SECTION_BODIES.length],
    });
  }

  const heroTitle = 'あなたの事業を、伝わる形に。';
  const heroSub =
    'このページは参考URLから抽出した設計数値（余白・タイポ・配色・セクション数）に基づく新規テンプレの叩き台です。文章・写真はすべて差し替え可能なオリジナル素材です。';

  /** 雰囲気に合わせたストック（Unsplash・商用利用に配慮した固定クエリ） */
  const mood = layout.contentDensity === 'compact' ? 'architecture,minimal' : 'abstract,texture';
  const heroImage = `https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1600&q=80`;
  const sectionImage = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80`;

  return {
    siteName: '新規設計テンプレ',
    title: '新規設計テンプレ | プレビュー',
    heroTitle,
    heroSub,
    navItems,
    sections,
    heroImage,
    sectionImage,
    ctaLabel: 'お問い合わせ',
    ctaHref: '#contact',
    footerText: `© ${new Date().getFullYear()} 新規設計テンプレ（プレビュー）`,
    moodTag: mood,
  };
}
