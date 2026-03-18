import { collectPlaces } from './collect.js';
import { processOne } from './process.js';
import { store } from './data/store.js';

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
  };
}

/** @type {{ status: string, phase: string, processed: number, total: number, error: string | null, lastNames: string[], startedAt: string | null, finishedAt: string | null }} */
let job = {
  status: 'idle',
  phase: '',
  processed: 0,
  total: 0,
  error: null,
  lastNames: [],
  startedAt: null,
  finishedAt: null,
};

export function getFullAutoStatus() {
  return { ...job, lastNames: [...job.lastNames] };
}

/**
 * 地域＋カテゴリで検索 → 上位N件を口コミ分析 → LP3案＋DM をダッシュボードへ（キュー不要・手離れ）
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
  };

  (async () => {
    try {
      // 指定件数ぶん出すため、検索では多めに候補を集める（サイト未掲載フィルタで落ちるため）
      const fetchCap = Math.min(Math.max(count * 12, 24), 60);
      const places = await collectPlaces(query, {
        minReviews,
        maxResults: fetchCap,
        hasWebsite: false,
      });
      const batch = places.slice(0, count);
      job.total = batch.length;

      if (batch.length === 0) {
        job.phase =
          '条件に合う店が見つかりませんでした。地域・カテゴリの表記を変えるか、最低レビュー数を下げてください。';
        job.status = 'done';
        job.finishedAt = new Date().toISOString();
        return;
      }

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
    } catch (e) {
      console.error('full-auto error', e);
      job.status = 'error';
      job.error = e?.message || String(e);
      job.phase = 'エラーで停止しました';
    }
    job.finishedAt = new Date().toISOString();
  })();

  return { ok: true, query };
}
