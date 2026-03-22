-- ギャラリー下書きビルトイン ID（公開カタログ・ヒアリングから除外する一覧）
-- アプリは storeSupabase のキー galleryDraftBuiltins を読む。未設定時はコード側で { draftBuiltinIds: [] } と同じ。
insert into app_store (key, value) values
  ('galleryDraftBuiltins', '{"draftBuiltinIds":[]}'::jsonb)
on conflict (key) do nothing;
