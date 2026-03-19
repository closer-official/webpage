# ドメインと公開URL方針

## 所有ドメイン（3つ）

| ドメイン | 用途の位置づけ |
|----------|----------------|
| **closer-official.com** | **このプロダクト本体（Closer / 管理・本家サイト）** のメインドメイン。 |
| **event-view.net** | **イベント系LPは毎回ここに固定**（学園祭・地方の祭り等）。 |
| **store-official.net** | 店舗向けURLの**親ドメイン候補**（`店名.store-official.net`）。※レジストラ上は **.net**（`.com` との取り違えに注意）。 |

---

## 決定した運用ルール

1. **このサイト自体（Closer本体）**  
   → **`https://closer-official.com`**（および必要なら `www` などはDNS/Vercelで設定）。

2. **イベントテンプレート（`event` 等・イベント向けサイト）**  
   → **常に `event-view.net` 側で公開**する（サブドメイン例: `イベント名.event-view.net`）。  
   → イベント用は **closer-official.com や store には載せない**方針。

3. **それ以外の11業種テンプレ（店舗LPなど）**  
   次のいずれかで運用する（案件ごとに選択可）:
   - **`店名.closer-official.com`** … 本家ドメインのサブドメイン（有償・ブランド一体型）
   - **`店名.web.app`**（または Vercel の `*.vercel.app`）… 無料・検証・Firebase 等
   - **`店名.store-official.net`** … 中立ドメインのサブドメイン（店舗主体のURLとして提供）

---

## 顧客に渡す店舗HPのURL（従来の3パターン表）

店のホームページを公開する際のURLは、**必ず「店の名前」から始め、次の3つのいずれか**にします。

| 種別 | URL 形式 | 例 | 備考 |
|------|----------|-----|------|
| **無償** | 店名.xxx | `プラスワンカフェ.web.app` など | 無料提供時。Firebase Hosting（.web.app）や Vercel のデフォルトなど。 |
| **有償1** | 店名.closer-official.com | `プラスワンカフェ.closer-official.com` | 本家ドメインのサブドメイン。 |
| **有償2** | 店名.store-official.net | `プラスワンカフェ.store-official.net` | 中立ドメインのサブドメイン。お店主体のURLとして提供。 |

- 店名部分は、英数字・ハイフンなどURLに使える形にした「店の名前」とする。
- 新規でLPを作成・公開するときは、上記3パターンのどれか1つに統一して案内する。
- **イベントのみ**は上表の対象外とし、**event-view.net 固定**とする。

---

## 全ページでの「Presented by Closer」

- **すべてのLP**のフッターに **「Presented by Closer」** を表示する。
- これをクリックすると **https://closer-official.com** に遷移する（別タブで開く）。
- 有料オプション「Presented by 削除」を選択した場合は表示しない。

---

## 実装・デプロイ時のメモ

- カスタムドメインの紐づけ: **Vercel（または利用中のホスティング）の Domains** ＋ **DNS**。
- 各LPの **canonicalUrl / og:url** は、実際に公開した **フルURL** に合わせて設定する（`docs/本番デプロイ（Vercel・Supabase）.md` 参照）。
- LP を別ドメインに出してAPIだけ本家の場合は **`paymentFormBaseUrl`** 等の指定が必要になることがある（`docs/仕様と制限・Stripe決済.md` 参照）。

---

## 自動正規URL（店名サブドメイン）

`canonicalUrl` が**空**のとき、次の優先で **`https://{店名スラッグ}.{親ドメイン}/`** をメタ・JSON-LD に使います。

1. **`seo.autoCanonicalHost`**（CMS「自動用親ドメイン」）— 例: `closer-official.com`（`https://` は不要）
2. **テンプレが `event` のとき** … 未設定でも **`event-view.net`** を既定
3. **環境変数** … フロント: **`VITE_AUTO_CANONICAL_HOST`**／サーバー・キュー: **`AUTO_CANONICAL_HOST`**（または `VITE_AUTO_CANONICAL_HOST`）

手入力の **`canonicalUrl`** が1文字でも入っている場合は、そちらが常に優先されます。  
DNS で `店名.親ドメイン` を実際に向ける作業は、引き続きインフラ側で必要です。
