-- キーバリュー型のストア（queue, dashboard, options 等を JSON で保存）
create table if not exists app_store (
  key text primary key,
  value jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- 初期データ（value は jsonb）
insert into app_store (key, value) values
  ('queue', '[]'::jsonb),
  ('dashboard', '[]'::jsonb),
  ('options', '{"multiLanguage":false,"contactForm":false,"instagramLine":true,"presentedBy":true,"qrCode":false}'::jsonb),
  ('billing', '{"plan":"normal"}'::jsonb),
  ('referenceSites', '[]'::jsonb),
  ('designInsights', '{"summary":"","byIndustry":{},"designSummary":"","byIndustryDesign":{},"updatedAt":null}'::jsonb),
  ('learningJob', '{"status":"idle","industry":null,"maxResults":null,"phase":"","current":0,"total":0,"result":null,"error":null,"startedAt":null,"completedAt":null}'::jsonb),
  ('autoProcessEnabled', 'false'::jsonb)
on conflict (key) do nothing;
