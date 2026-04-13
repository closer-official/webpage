/**
 * プレビュー領域への JSON 反映（binder の薄いラッパー）
 */
(function (g) {
  g.BeautyHpbEditor = g.BeautyHpbEditor || {};
  g.BeautyHpbEditor.refreshPreview = function (root, data) {
    g.BeautyHpbEditor.bindDataToDom(root, data);
  };
})(typeof window !== 'undefined' ? window : globalThis);
