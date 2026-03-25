# SPEC · wiki_ensyuritsu

| 項目 | 内容 |
|------|------|
| 内部 ID | `wiki_ensyuritsu` |
| スラッグ | `wiki-ensyuritsu` |
| ブランド | 円室律 / ENSYRITSU（架空・オリジナル） |
| 本体 | `embed/index.html`（固定 HTML 埋め込み） |
| スタイル | embed 内 `<style>`（`.wes-deliverable` 配下） |

## 変更時の注意

- `embed/index.html` は完全な HTML ドキュメントとして保持し、`<body>` 内にスタイルとマークアップを置く。
- ルートの `server/buildHtml.js` / `src/lib/buildHtml.ts` はテンプレ ID で埋め込み分岐しているため、ID を変える場合はそちらも更新する。
