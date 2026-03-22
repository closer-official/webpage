/**
 * 納品用 LP テンプレ（deliverables + lpContent）の正。
 * 新規納品・購入者ウィザード・営業プレビューはここを参照する。
 *
 * 環境変数 PRODUCT_LP_TEMPLATE_SLUGS（カンマ区切り）で上書き可。
 * 既定から省く・順序変更したい場合に使用。
 */

/** コード上まだ存在しうるが「新規納品の選択肢に出さない」例（納品済み専用など） */
export const LP_CMS_ALL_KNOWN_SLUGS = ['gym-valx-intro', 'web-closer-intro', 'japanese-history-higashi'];

const META = {
  'gym-valx-intro': {
    name: 'ジム・フィットネス LP（ネオン）',
    description: '縦長1ページ。キャンペーン・料金・FAQ・アクセスを CMS で編集します。',
    purchaserEditorPath: '/admin/gym-lp.html',
    /** 同一オリジンでの編集画面クエリ例（本番はサブドメイン推奨） */
    purchaserEditorQuery: 'site',
    liveDemoPath: '/deliverables/gym-valx-intro/index.html',
  },
  'web-closer-intro': {
    name: 'コーポレート／制作紹介 LP',
    description: 'ヒーロー・フッターを CMS で編集。申込URLも設定できます。',
    purchaserEditorPath: '/deliverables/web-closer-intro/admin.html',
    purchaserEditorQuery: 'site',
    liveDemoPath: '/deliverables/web-closer-intro/index.html',
  },
  'japanese-history-higashi': {
    name: '（レガシー）日本史 LP',
    description: '既存納品向け。新規の標準選択肢には含めません。',
    purchaserEditorPath: '/deliverables/japanese-history-higashi/admin.html',
    purchaserEditorQuery: 'site',
    liveDemoPath: '/deliverables/japanese-history-higashi/index.html',
  },
};

/**
 * 新規納品・ウィザードで選べる slug の配列
 */
export function getProductLpTemplateSlugs() {
  const raw = String(process.env.PRODUCT_LP_TEMPLATE_SLUGS || '').trim();
  if (raw) {
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return ['gym-valx-intro', 'web-closer-intro'];
}

/**
 * API 用の一覧（メタ付き）。japanese-history は既定リストに含めない。
 */
export function getProductLpTemplatesList() {
  const slugs = getProductLpTemplateSlugs();
  return slugs
    .map((slug) => {
      const m = META[slug];
      if (!m) return null;
      return {
        slug,
        name: m.name,
        description: m.description,
        purchaserEditorPath: m.purchaserEditorPath,
        purchaserEditorQuery: m.purchaserEditorQuery || 'site',
        liveDemoPath: m.liveDemoPath,
      };
    })
    .filter(Boolean);
}

export function isProductLpTemplateSlug(slug) {
  return getProductLpTemplateSlugs().includes(String(slug || '').trim());
}

export function getProductLpTemplateSlugSet() {
  return new Set(getProductLpTemplateSlugs());
}
