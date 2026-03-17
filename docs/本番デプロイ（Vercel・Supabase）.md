# 本番デプロイ（Vercel + Supabase）

自分用のみで公開しない場合でも、本番環境（Vercel + Supabase）にデプロイして利用できます。

---

## 1. Supabase の準備

### 1-1. プロジェクト作成

1. [Supabase](https://supabase.com) にログインし、**New Project** でプロジェクトを作成する（名前・パスワードを設定して作成完了まで待つ）。

### 1-2. SUPABASE_URL と API キーを取る

1. 左サイドバー一番下の **⚙ Project Settings**（歯車）をクリック。
2. 左メニューで **API** をクリック。
3. 表示される内容のうち:
   - **Project URL**（「Project URL」または「API URL」と書いてある欄）  
     → これが **SUPABASE_URL**。例: `https://abcdefghijk.supabase.co`
   - 下の方の **Project API keys** のうち:
     - **anon public** … これが **SUPABASE_ANON_KEY**
     - **service_role**（「Reveal」で表示）… これが **SUPABASE_SERVICE_ROLE_KEY**（自分だけ使うならこちらでよい）

### 1-3. テーブルを作る

1. 左サイドバー **SQL Editor** を開く。
2. **New query** で新規クエリを開き、プロジェクト内の `supabase/migrations/20250116000000_app_store.sql` の内容をすべてコピーして貼り付け、**Run** で実行する。

---

## 2. Vercel の準備

**Vercel に出す方法は2通りあります。Git がなくても CLI でデプロイできます。**

### 方法A: Git を使ってデプロイ（おすすめ）

1. このプロジェクトを **Git で管理**する: フォルダで `git init` して、GitHub などにリポジトリを作り、コードをプッシュする。
2. [Vercel](https://vercel.com) にログイン → **Add New…** → **Project**。
3. **Import Git Repository** で、作ったリポジトリを選ぶ。
4. そのまま **Deploy** で一度デプロイしてもよい（後で環境変数を足す）。

### 方法B: Git なしで CLI でデプロイ

1. [Vercel CLI](https://vercel.com/docs/cli) を入れる: `npm i -g vercel`
2. プロジェクトのフォルダで `vercel` を実行し、表示に従ってログイン・プロジェクト名などを決める。
3. 初回は「Set up and deploy?」で **Y** を選ぶとデプロイされる。

### 2-2. 環境変数を設定する

1. Vercel のダッシュボードで、作ったプロジェクトを開く。
2. **Settings** → **Environment Variables** を開く。
3. 次の変数を **1つずつ追加**する（Name と Value を入力して Save）:

   | 変数名 | 説明 | どこで取るか |
   |--------|------|----------------|
   | `SUPABASE_URL` | プロジェクトの URL | Supabase: **Project Settings → API** の「Project URL」 |
   | `SUPABASE_SERVICE_ROLE_KEY` | API キー（本番用） | 同じ画面の「Project API keys」の **service_role**（Reveal で表示） |
   | `GOOGLE_MAPS_API_KEY` | Maps / Places 用 | 既に持っている Google Cloud の API キー |
   | `GEMINI_API_KEY` | 口コミ分析・DM・学習用 | [AI Studio](https://aistudio.google.com/apikey) で発行 |
   | `VITE_GOOGLE_MAPS_API_KEY` | フロントの地図用 | 上と同じキーでよい |
   | `VITE_API_URL` | 本番では **空** のままでよい（同じサイトから API を呼ぶため） | 未設定 or 空 |
   | `CRON_SECRET` | （任意）Cron 保護用 | 自分で決めた英数字 |
   | `STRIPE_SECRET_KEY` | （任意）Stripe 決済用 | Stripe ダッシュボード |

- **VITE_*** は「ビルド時」に使われるので、環境変数を追加・変更したあとは **Deployments** から **Redeploy** すると反映されます。**

---

## 3. いまからやること（コードをアップしてデプロイ）

プロジェクトと環境変数が用意できたら、**このフォルダのコードを Vercel に送ってデプロイ**します。

### パターン1: GitHub と連携している場合

1. このプロジェクトを GitHub のリポジトリにプッシュする（まだなら下記を実行）。
2. Vercel で **Add New → Project** を開き、**Import** でその GitHub リポジトリを選ぶ。
3. リポジトリを選んだあと、**Deploy** を押す（環境変数はすでに入れているのでそのままでよい）。
4. デプロイが終わったら、表示された **URL**（例: `https://webpage-xxx.vercel.app`）でアプリにアクセスできる。

**いまから Git を始める場合（ターミナルで実行）:**

```bash
cd c:\Users\tduka\webpage
git init
git add .
git commit -m "Initial commit"
```

その後、[GitHub](https://github.com/new) で新しいリポジトリを作り、表示されるコマンドのとおりに `git remote add origin ...` と `git push -u origin main` を実行する。  
Vercel では **Import Git Repository** でそのリポジトリを選んで **Deploy** する。

### パターン2: Git を使わず CLI でアップする場合

1. ターミナルでプロジェクトのフォルダに移動する。
2. 次を実行する:

```bash
cd c:\Users\tduka\webpage
npm i -g vercel
vercel
```

3. 初回はログインやプロジェクト名の入力が求められるので、表示に従う。
4. **Set up and deploy?** と出たら **Y** を押すと、その場でデプロイされる。
5. 完了すると **Production URL** が表示される。その URL が本番のアプリのアドレス。

### 一発デプロイ（Git 連携時）

Git と Vercel を連携済みなら、次のコマンドで **変更をコミット・プッシュし、Vercel の自動デプロイまで一括**で行えます。

```bash
npm run deploy
```

**初回だけ:** まだリモートを追加していない場合は、先に次を実行してください（GitHub などでリポジトリを作成したあと）。

```bash
git remote add origin https://github.com/あなたのID/リポジトリ名.git
```

その後、`npm run deploy` でプッシュできます。

- 変更がある場合: `git add .` → `git commit -m "Deploy"` → `git push` を実行します。
- 変更がない場合: そのまま `git push` のみ実行します（既存のコミットをプッシュ）。
- コミットメッセージを指定する場合: `npm run deploy -- メッセージ` のように `--` の後に続けて書きます。

プッシュ後、Vercel がリポジトリの変更を検知して本番デプロイを開始します。

---

## 4. デプロイ後の動き

- **Vercel** にデプロイされると、`vercel.json` に従い:
  - フロントは `npm run build` → `dist` が配信される。
  - `/api/*` は `api/index.js`（Express アプリ）にルーティングされる。
- 初回デプロイ後、**URL**（例: `https://webpage-xxx.vercel.app`）を控える。
- フロントから API を呼ぶため、**VITE_API_URL** を `https://あなたのドメイン.vercel.app` にし、再デプロイする（同じオリジンなら空のままでよい）。

---

## 5. 自動処理（キュー全件）について

- **ローカル**: 「キューを自動で全件処理（開始）」で、サーバー内のタイマーが約20秒ごとに1件処理する。
- **本番（Supabase 利用時）**: タイマーは動かない。代わりに **Vercel Cron** が毎分 `/api/auto-process/tick` を呼ぶ。  
  「開始」を押すと「自動処理が有効」な状態が Supabase に保存され、Cron が 1 分ごとに 1 件ずつ処理する。  
  `CRON_SECRET` を設定している場合は、Vercel Cron の設定で同じ値を `x-cron-secret` として送る必要がある（Vercel が自動で付与する場合を除く）。

---

## 6. 注意点

- **学習ジョブ**は 1 リクエストで長時間動くため、Vercel の **maxDuration: 300**（5 分）にしている。業種・件数が大きいとタイムアウトする場合があるので、そのときは業種を分けて実行する。
- **Stripe** の Webhook は、本番の URL（例: `https://xxx.vercel.app/api/...`）を Stripe ダッシュボードに登録する。
- 自分だけ使う想定でも、**API キーや CRON_SECRET は環境変数で渡し、リポジトリに含めない。**
