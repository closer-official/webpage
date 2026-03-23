# gym-valx-intro

テンプレ **`gym_personal_neon`（テンプレ15）** 用の固定 HTML。

## 内容

- 参照モバイルLP（CLOSER GYM 系）の**静的再現**を目指した縦長1ページ。
- **Tailwind CSS（CDN）** ＋ 一部カスタム CSS（アウトライン見出し・桜ペタル風装飾・**テンプレ14相当の sticky「申し込む」バー**）。
- アクセントカラーは **赤ネオン**（`#ef4444` 系）。LINE 公式色の緑は LINE 誘導ボタン用に一部残しています。
- **動的挙動なし**（アコーディオン・ハンバーガー開閉・自動スライド等は未実装）。`href="#top"` のみ。
- 写真は **Unsplash** のジム系プレースホルダ。本番では差し替え・権利確認を行ってください。
- ブランド名・価格・キャンペーン条件は**デモ用**。実在のサービスとは一致しません。
- **単一スタジオ想定**：複数店舗・フロアマップ・店舗カード一覧は含みません。末尾の **アクセス** ブロックに住所を記載してください。

## プレビュー

`index.html` をブラウザで直接開くか、アプリ内でテンプレ **テンプレ15（パーソナルジム・ネオン／固定LP）** を選択してプレビューしてください。

## 店舗用 CMS・閲覧数

- **API**: `GET/PUT /api/lp-content/gym-valx-intro`（保存は `JP_HISTORY_LP_CMS_USER` / `PASSWORD` または `ADMIN_USERNAME` / `PASSWORD` が必要）
- **閲覧数**: `POST /api/lp-analytics/gym-valx-intro/view`（LP表示時に自動）／集計の確認は `GET /api/lp-analytics/gym-valx-intro`（ログイン時）
- **管理画面**: 本番では **`/admin/gym-lp.html`**（サブドメイン＝`siteKey` を自動解決。別ドメイン時は `?siteKey=`）
- **店舗発行**: 運営が `POST /api/admin/lp-cms-provision`（全体ADMIN）でユーザー作成 → Supabase `lpCmsAccounts` に保存（Vercel に店舗数のID/PWは不要）
- 初期JSONは `server/data/json/lpContent.json` の `gym-valx-intro` キー

## 公開URLの例（Vercel ビルド後）

- 店舗サイト: `https://（店舗名）.store-official.net/`
- 運営ツール: `https://（店舗名）.store-official.net/admin/`
- ジムLP編集: `https://（店舗名）.store-official.net/admin/gym-lp.html`
