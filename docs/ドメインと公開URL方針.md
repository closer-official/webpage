# ドメインと公開URL方針

## 顧客に渡す店舗HPのURL

店のホームページを公開する際のURLは、**必ず「店の名前」から始め、次の3つのいずれか**にします。

| 種別 | URL 形式 | 例 | 備考 |
|------|----------|-----|------|
| **無償** | 店名.xxx | `プラスワンカフェ.web.app` など | 無料提供時。Firebase Hosting（.web.app）や Vercel のデフォルトなど。 |
| **有償1** | 店名.closer-official.com | `プラスワンカフェ.closer-official.com` | 本家ドメインのサブドメイン。 |
| **有償2** | 店名.store-official.net | `プラスワンカフェ.store-official.net` | 中立ドメイン（store-official.net）のサブドメイン。お店主体のURLとして提供。 |

- 店名部分は、英数字・ハイフンなどURLに使える形にした「店の名前」とする。
- 新規でLPを作成・公開するときは、上記3パターンのどれか1つに統一して案内する。

## 全ページでの「Presented by Closer」

- **すべてのLP**のフッターに **「Presented by Closer」** を表示する。
- これをクリックすると **https://closer-official.com** に遷移する（別タブで開く）。
- 有料オプション「Presented by 削除」を選択した場合は表示しない。

## ドメイン一覧（運用メモ）

| ドメイン | 用途 |
|----------|------|
| **closer-official.com** | 本家サイト。Presented by のリンク先。有償1の店舗URL（店名.closer-official.com）の親ドメイン。 |
| **store-official.net** | 有償2用。店舗URL（店名.store-official.net）の親ドメイン。 |
| **event-view.net** | イベント用（学園祭・地方の祭りなど）無料サイト提供専用。 |
