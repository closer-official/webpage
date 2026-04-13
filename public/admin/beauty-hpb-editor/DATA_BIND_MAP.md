# 美容室 mellow テンプレ — サンプル文言洗い出し & `data-bind` 対応表

`server/beautySalonMellow/generated-body.html` を基準に、**BSM 外の固定文言**と **スロット内サンプル**を列挙し、本ツールの `data-bind` パスと対応づけた。

---

## 1. ブランド・ロゴ周り（BSM 外・要手動 or 将来バインド）

| 出現箇所 | サンプル文言 |
|---------|-------------|
| ヘッダーロゴ | `mellow by luce` + `OMOTESANDO HAIR SALON` |
| フッターロゴ（各ページ） | 同上 |
| フッター著作権 | `© 2025 mellow by luce. All rights reserved. \| Web production by Closer by divizero` |
| 予約バナー電話 | `tel:03-0000-1842` / 表示「お電話はこちら」 |
| メニュー詳細ページ | カテゴリ別の固定行（カット ¥7,150 等）多数 — BSM 外 |

本ツールのプレビューでは、ロゴ行に `data-bind="salon.name"` / `data-bind="salon.brandSubtitle"` を割り当て、未取得時は **空のまま非表示**。

---

## 2. BSM スロット内のサンプル（mellow デモ用）

| BSM id | サンプル要約 |
|--------|----------------|
| hero.label | OMOTESANDO HAIR SALON |
| hero.headline | やわらかく、上品に。… |
| hero.subtitle | ショート・ボブ・ミディアムを中心に… |
| home.concept.title / body | 光の中で… / 表参道の静かな通り… mellow by luceでは… |
| home.style.title / lede | 得意なスタイル / ショート・ボブ… |
| home.salon.title / lede | 木のぬくもりと… / 明るくやわらかな光… |
| home.staff.title | スタッフ紹介 |
| home.staff1/2 role,name,desc | DIRECTOR/STYLIST, Kaito Nagase, … / STYLIST, Mizuki Arai, … |
| home.pickup.* | 店内の雰囲気、受付・カウンター、セット面 等 |
| home.menu.1–6 jp/price/desc | カット ¥7,150〜 … 等 |
| home.reserve.title / lede | ご予約はこちら / 24時間WEB… |
| footer.tagline | やわらかい光の中で… |
| footer.info | 〒150-0001 東京都渋谷区神宮前… TEL… OPEN… |
| page.concept.* / page.policy.1–4 | Concept 本文・4つのこだわり |
| page.staff.* | 担当スタッフ、各 desc/quote |
| page.salon.* | Salon 見出し・本文 |
| access.* | 住所・経路・TEL・時間・支払い 等 |

---

## 3. `data-bind` 対応表（本ツール JSON → DOM）

| data-bind パス | 説明 | 備考 |
|----------------|------|------|
| `salon.name` | 店名（ロゴ左） | テキスト |
| `salon.brandSubtitle` | ロゴ下サブ（例: エリア名） | |
| `salon.heroLabel` | ヒーロー上ラベル | |
| `salon.heroCatch` | ヒーロー見出し | `\n` → `<br>` |
| `salon.heroSubtitle` | ヒーローリード | 同上 |
| `salon.shopTitle` | 店舗キャッチ・タイトル系 | HP 見出し用。`[data-section="shopTitle"]` |
| `salon.rating` | 評価（数値文字列） | |
| `salon.reviewCount` | 口コミ件数表示用 | |
| `salon.introduction` | 店舗紹介（長文） | |
| `salon.conceptTitle` | Concept 見出し | |
| `salon.conceptBody` | Concept 本文 | |
| `salon.policySectionTitle` | こだわりブロック見出し | |
| `salon.salonMessage` | サロンからの一言 | |
| `salon.address` | 住所 | |
| `salon.access` | アクセス（複数行可） | |
| `salon.avgReservation` | 平均予約金額 | |
| `salon.genderRatio` | 性別比率 | |
| `salon.ageRatio` | 年代比率 | |
| `salon.footerTagline` | フッタータグライン | |
| `salon.reserveNote` | 予約案内文 | `[data-section="reserve"]` |
| **リスト** `salon.policies` | `{ title, body }` | こだわりカード |
| **リスト** `salon.coupons` | `{ title, price, body }` | クーポン |
| **リスト** `salon.atmosphere` | `{ title, body }` | 雰囲気 |
| **リスト** `salon.staff` | `{ role, name, desc, quote }` | スタッフ |
| **リスト** `salon.faq` | `{ q, a }` | FAQ |
| **リスト** `salon.gallery` | `{ caption, imageUrl }` | ギャラリー（URL 空なら img 非表示） |

---

## 4. 運用メモ

- 値が空のオブジェクト配列 → セクション `hidden`。
- ダミー文は入れない（要件）。
- 本番 `generated-body.html` への取り込みは、別途 BSM マーカーへマッピングするか、`data-bind` 版 HTML に置換してビルドパイプラインへ組み込む。
