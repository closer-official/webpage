/**
 * ビルトイン buildHtml テンプレの「正」: ID と表示名だけをここに集約する。
 * - API の getTemplateCandidates（templatePreview.js）
 * - 業種キュー順（conceptTemplates.js の TEMPLATE_IDS）
 * はこの定義から参照すること（二重管理を避ける）。
 *
 * 注意: 各テンプレの HTML/CSS の実体は依然として
 * - server/buildHtml.js（サーバー描画）
 * - src/lib/buildHtml.ts + src/lib/templates.ts（ブラウザプレビュー）
 * に分かれている。レガシーIDの分岐を1ファイルにまとめると数千行になり、
 * Node と Vite で共有するには別パッケージ化が必要になるため、現状は分割のまま。
 * 全体マップは docs/テンプレまわりの置き場とデプロイ.md を参照。
 */

/** @typedef {{ id: string, name: string }} BuiltinBuildHtmlTemplate */

/** @type {readonly BuiltinBuildHtmlTemplate[]} */
export const BUILTIN_BUILD_HTML_TEMPLATES = Object.freeze([
  Object.freeze({ id: 'cafe_1', name: 'テンプレ1（複数店舗・ミニマル）' }),
  Object.freeze({ id: 'gym_personal_neon', name: 'テンプレ2（CLOSER・ジム販売LP）' }),
  Object.freeze({ id: 'navy_cyan_consult', name: 'テンプレ3（ネイビー×シアン・Web/LP）' }),
  Object.freeze({ id: 'wiki_ensyuritsu', name: 'wiki円室律（オリジナル・ナレッジ）' }),
]);

/** @type {readonly string[]} */
export const BUILTIN_BUILD_HTML_TEMPLATE_IDS = Object.freeze(
  BUILTIN_BUILD_HTML_TEMPLATES.map((t) => t.id),
);
