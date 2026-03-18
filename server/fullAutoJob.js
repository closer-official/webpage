import { collectPlaces } from './collect.js';
import { processOne } from './process.js';
import { store } from './data/store.js';
import { isSupabaseConfigured } from './data/storeSupabase.js';

function makeQueueId() {
  return `q-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function placeToQueueItem(place, searchQuery) {
  return {
    id: makeQueueId(),
    source: 'google_maps',
    name: place.name,
    address: place.address,
    placeId: place.placeId,
    notes: '',
    signals: {
      placeId: place.placeId,
      mapsUrl: `https://www.google.com/maps/place/?q=place_id:${place.placeId}`,
      rating: place.rating,
      userRatingsTotal: place.userRatingsTotal,
      hasOpeningHours: place.hasOpeningHours,
      hasPhoto: place.hasPhoto,
      needsVerification: (place.userRatingsTotal ?? 0) < 3,
    },
    category: place.category,
    searchQuery: searchQuery || '',
    createdAt: new Date().toISOString(),
    reviews: place.reviews || [],
    rating: place.rating,
    userRatingsTotal: place.userRatingsTotal,
    hasOpeningHours: place.hasOpeningHours,
    hasPhoto: place.hasPhoto,
    instagramUrl: '',
    lineUrl: '',
    openingHoursText: place.openingHoursText || '',
  };
}

/** @type {{ status: string, phase: string, processed: number, total: number, error: string | null, lastNames: string[], startedAt: string | null, finishedAt: string | null, noMatches: boolean }} */
let job = {
  status: 'idle',
  phase: '',
  processed: 0,
  total: 0,
  error: null,
  lastNames: [],
  startedAt: null,
  finishedAt: null,
  noMatches: false,
};

export function getFullAutoStatus() {
  return { ...job, lastNames: [...job.lastNames] };
}

async function runFullAutoPipeline(query, count, minReviews) {
  if (process.env.VERCEL && !isSupabaseConfigured()) {
    throw new Error(
      'Vercel 本番では結果を保存するために Supabase が必要です。SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY（または ANON）を環境変数に設定してください。'
    );
  }

  const fetchCap = Math.min(Math.max(count * 12, 24), 60);
  const places = await collectPlaces(query, {
    minReviews,
    maxResults: fetchCap,
    hasWebsite: false,
  });
  const batch = places.slice(0, count);
  job.total = batch.length;

  if (batch.length === 0) {
    job.noMatches = true;
    job.phase =
      '【理由】フルオートは Google Maps に「ウェブサイトURLが未登録」の店だけを対象にしています。東京都港区のカフェのように、都心・人気エリアでは掲載済みがほとんどのため、カフェがたくさんあっても 0 件になります。地方・郊外・商店街寄りのエリアに変えるか、最低レビュー数を下げて再検索してください。';
    job.status = 'done';
    job.finishedAt = new Date().toISOString();
    return;
  }
  job.noMatches = false;

  const options = await store.getOptions();
  for (let i = 0; i < batch.length; i++) {
    const p = batch[i];
    job.phase = `分析・LP作成中（${i + 1} / ${batch.length}）${p.name}`;
    const item = placeToQueueItem(p, query);
    const dashboardItem = await processOne(item, options);
    const dashboard = await store.getDashboard();
    dashboard.unshift(dashboardItem);
    await store.setDashboard(dashboard);
    job.processed = i + 1;
    job.lastNames.unshift(p.name);
    job.lastNames = job.lastNames.slice(0, 8);
  }
  job.phase =
    batch.length >= count
      ? `${batch.length} 件をダッシュボードに追加しました（希望 ${count} 件）。メール文面も入っています。`
      : `${batch.length} 件をダッシュボードに追加しました（希望 ${count} 件に足りませんでした）。メール文面も入っています。`;
  job.status = 'done';
  job.finishedAt = new Date().toISOString();
}

/**
 * 地域＋カテゴリで検索 → 上位N件を口コミ分析 → LP3案＋DM をダッシュボードへ
 * - ローカル: バックグラウンド実行（すぐ 200）
 * - Vercel: 同一リクエスト内で完了まで await（関数終了後に処理が消えないようにする）
 */
export async function startFullAutoRun(body) {
  if (job.status === 'running') {
    throw new Error('すでにフルオートが実行中です。完了を待つか、しばらくしてから再度お試しください。');
  }
  const region = String(body?.region ?? '').trim();
  const category = String(body?.category ?? '').trim();
  const count = Math.min(Math.max(Number(body?.count) || 3, 1), 25);
  const minReviews = Math.min(Math.max(Number(body?.minReviews) ?? 3, 0), 50);

  if (!region || !category) {
    throw new Error('地域とカテゴリを入力してください。');
  }

  const query = `${region} ${category}`;
  job = {
    status: 'running',
    phase: 'Google で店舗を検索しています…',
    processed: 0,
    total: 0,
    error: null,
    lastNames: [],
    startedAt: new Date().toISOString(),
    finishedAt: null,
    noMatches: false,
  };

  const onVercel = !!process.env.VERCEL;

  if (onVercel) {
    try {
      await runFullAutoPipeline(query, count, minReviews);
      return { ok: true, query, completedOnServer: true };
    } catch (e) {
      console.error('full-auto error', e);
      job.status = 'error';
      job.error = e?.message || String(e);
      job.phase = 'エラーで停止しました';
      job.finishedAt = new Date().toISOString();
      return { ok: false, error: job.error, query };
    }
  }

  (async () => {
    try {
      await runFullAutoPipeline(query, count, minReviews);
    } catch (e) {
      console.error('full-auto error', e);
      job.status = 'error';
      job.error = e?.message || String(e);
      job.phase = 'エラーで停止しました';
      job.finishedAt = new Date().toISOString();
    }
  })();

  return { ok: true, query };
}
