# テンプレ4（Warm Organic）刷新メモ

参照サイトの方針を **1テンプレにいいとこどり** で反映（2025-03-16）。

## 取り込んだパターン

| 参照の意図 | 実装 |
|------------|------|
| [44APARTMENT](https://www.44apartment.com/) ほか | ヒーロー複数枚・世界観ファースト |
| [みずたまの木 予約](https://www.mizutama-cafe.com/reservation) | 営業時間など **背景帯**（`hours` セクション） |
| [Dans Dix ans](https://dansdixans.net/) | 先頭ブロックで **見出し強調＋本文リズム**（`wo-lede`） |
| [SAWAMURA 店舗例](https://b-sawamura.com/shop/128/) | **ドット表示のカルーセル**、**固定ハンバーガー**、**左ストライプ＋フッター同色帯** |

## 技術仕様

- **ヒーロー**: デフォルト3枚（OG画像＋補助2枚）。`PageContent.heroSlides` に2枚以上で差し替え可。約4.5秒自動＋**スワイプ**＋ドット操作。`prefers-reduced-motion` では自動のみ停止。
- **ナビ**: 従来ヘッダーなし。**右上固定FAB** → 全画面ドロワー（チェックボックス＋ラベル、リンクタップで閉じる）。
- **セクション**: 1本目 `wo-lede`（ベージュ地＋ブランド色見出し）、`id === 'hours'` で **営業時間帯**、それ以外は左 **ブランド色ライン**＋交互グリッド（画像あり時）。
- **フッター**: `--tp-brand`（森緑）一色帯＋白文字＋ **PAGE TOP**。

## 増やしていないテンプレ

パン屋の「単色背景＋透過商品画像グリッド」（ダンディゾン型）はレイアウトが別系統のため、**別テンプレ `warm_organic_bakery` 等は未追加**。必要になったら分離可能。

## 関連ファイル

- `src/lib/templates.ts` / `server/conceptTemplates.js` — CSS
- `src/lib/buildHtml.ts` / `server/buildHtml.js` — HTML・カルーセルJS
