-- 紹介コード（紹介者ごとに手動発行・1コード1行）
-- 有効かつ active=true のとき、料金計算で「通常プラン」「学割プラン」の基本料金のみ 0 円になる（オプションは別途課金）。
create table if not exists referral_codes (
  code text primary key,
  active boolean not null default true,
  note text,
  created_at timestamptz not null default now()
);

comment on table referral_codes is '紹介コード。Supabase Table Editor または SQL で code を追加。';

alter table referral_codes enable row level security;

-- anon は参照不可（サーバーは service_role で RLS バイパス）
