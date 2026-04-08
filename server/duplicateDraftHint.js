/**
 * 店舗ドラフト保存前の「店名＋住所」重複ヒント用。
 * - 店名: 業種など汎用語を除いたうえで部分一致／どちらかに完全一致を含む
 * - 住所: 都道府県単独の一致は無効（東京都だけ等）。都道府県以降のコアで判定。
 */

const GENERIC_NAME_FRAGMENTS = [
  'ラーメン',
  'つけ麺',
  'まぜそば',
  'カレー',
  'カフェ',
  'コーヒー',
  '喫茶',
  '食堂',
  '定食',
  '居酒屋',
  'ダイニング',
  'ダイニングバー',
  'バー',
  'イタリアン',
  '焼肉',
  '焼き肉',
  '寿司',
  '鮨',
  'すし',
  '和食',
  '洋食',
  '中華',
  '中華料理',
  'うどん',
  'そば',
  '丼',
  'ハンバーガー',
  'ファミレス',
  'ファーストフード',
  'テイクアウト',
  'デリバリー',
  'スイーツ',
  'ケーキ',
  'パン',
  'ベーカリー',
  'レストラン',
  '大衆酒場',
  '酒場',
  '立ち飲み',
  '本店',
  '支店',
  '新店',
  'お店',
  'キッチン',
  'dining',
  'cafe',
  'bar',
  'kitchen',
];

const PREFECTURES = [
  '北海道',
  '青森県',
  '岩手県',
  '宮城県',
  '秋田県',
  '山形県',
  '福島県',
  '茨城県',
  '栃木県',
  '群馬県',
  '埼玉県',
  '千葉県',
  '東京都',
  '神奈川県',
  '新潟県',
  '富山県',
  '石川県',
  '福井県',
  '山梨県',
  '長野県',
  '岐阜県',
  '静岡県',
  '愛知県',
  '三重県',
  '滋賀県',
  '京都府',
  '大阪府',
  '兵庫県',
  '奈良県',
  '和歌山県',
  '鳥取県',
  '島根県',
  '岡山県',
  '広島県',
  '山口県',
  '徳島県',
  '香川県',
  '愛媛県',
  '高知県',
  '福岡県',
  '佐賀県',
  '長崎県',
  '熊本県',
  '大分県',
  '宮崎県',
  '鹿児島県',
  '沖縄県',
];

function normalizeWhitespace(s) {
  return String(s || '')
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/** @param {string} s normalized lowercase */
function isPrefectureOnlyToken(s) {
  if (!s) return false;
  const n = s.normalize('NFKC').trim().toLowerCase();
  return PREFECTURES.some((p) => p.normalize('NFKC').toLowerCase() === n);
}

export function stripGenericNameFragments(raw) {
  let out = normalizeWhitespace(raw);
  for (const frag of GENERIC_NAME_FRAGMENTS) {
    const f = frag.normalize('NFKC').toLowerCase();
    if (!f) continue;
    out = out.split(f).join(' ');
  }
  return out.replace(/\s+/g, ' ').trim();
}

/** 先頭の都道府県を除いた「以降の住所コア」（無ければ全体） */
export function addressCoreAfterPrefecture(raw) {
  const n = normalizeWhitespace(raw);
  if (!n) return '';
  for (const p of PREFECTURES) {
    const pl = p.normalize('NFKC').toLowerCase();
    if (n.startsWith(pl)) {
      return n.slice(pl.length).trim();
    }
  }
  return n;
}

/**
 * 店名ディメンション: 汎用語除去後 2 文字以上で、部分一致または完全一致
 */
export function nameDimensionMatches(aRaw, bRaw) {
  const a = stripGenericNameFragments(aRaw);
  const b = stripGenericNameFragments(bRaw);
  if (a.length < 2 || b.length < 2) return false;
  if (a === b) return true;
  return a.includes(b) || b.includes(a);
}

/**
 * 住所ディメンション: 都道府県「だけ」の一致は不可。
 * コア（都道府県以降）が両方 2 文字以上ならそこで部分/完全一致。
 * 片方にコアが無い場合は全体の包含だが、短い側が都道府県のみなら false。
 */
export function addressDimensionMatches(aRaw, bRaw) {
  const aFull = normalizeWhitespace(aRaw);
  const bFull = normalizeWhitespace(bRaw);
  if (aFull.length < 2 || bFull.length < 2) return false;

  const aCore = addressCoreAfterPrefecture(aRaw);
  const bCore = addressCoreAfterPrefecture(bRaw);

  if (aCore.length >= 2 && bCore.length >= 2) {
    if (aCore === bCore) return true;
    if (aCore.includes(bCore) || bCore.includes(aCore)) return true;
  }

  const shorter = aFull.length <= bFull.length ? aFull : bFull;
  const longer = aFull.length > bFull.length ? aFull : bFull;
  if (longer.includes(shorter)) {
    if (isPrefectureOnlyToken(shorter)) return false;
    return shorter.length >= 2;
  }

  return false;
}

export function duplicatePairMatches(siteNameA, footerAddrA, siteNameB, footerAddrB) {
  return (
    nameDimensionMatches(siteNameA, siteNameB) && addressDimensionMatches(footerAddrA, footerAddrB)
  );
}

/**
 * @param {object} opts
 * @param {string} opts.siteName
 * @param {string} opts.footerAddress
 * @param {string} [opts.excludeCustomizationId]
 * @param {Array<{ id: string, name?: string, override?: object }>} opts.customizations
 * @param {Array<object>} opts.dashboardItems
 */
export function findDuplicateDraftHints(opts) {
  const siteName = String(opts.siteName || '').trim();
  const footerAddress = String(opts.footerAddress || '').trim();
  const excludeId = String(opts.excludeCustomizationId || '').trim();
  const customizations = Array.isArray(opts.customizations) ? opts.customizations : [];
  const dashboardItems = Array.isArray(opts.dashboardItems) ? opts.dashboardItems : [];

  if (siteName.length < 2 && footerAddress.length < 2) return [];

  /** @type {Map<string, { source: string, id: string, draftName: string, siteName: string, footerAddress: string, linkedTemplateCustomizationId?: string }>} */
  const byKey = new Map();

  function addHit(hit) {
    const key = `${hit.source}:${hit.id}`;
    if (byKey.has(key)) return;
    byKey.set(key, hit);
  }

  for (const c of customizations) {
    const id = String(c.id || '').trim();
    if (!id || id === excludeId) continue;
    const ov = c.override && typeof c.override === 'object' ? c.override : {};
    const sn = String(ov.siteName || '').trim();
    const fa = String(ov.footerAddress || '').trim();
    if (!duplicatePairMatches(siteName, footerAddress, sn, fa)) continue;
    addHit({
      source: 'customization',
      id,
      draftName: String(c.name || '').trim() || id,
      siteName: sn,
      footerAddress: fa,
    });
  }

  for (const row of dashboardItems) {
    const did = String(row.id || '').trim();
    if (!did) continue;
    const r = row.researched && typeof row.researched === 'object' ? row.researched : {};
    const content = row.content && typeof row.content === 'object' ? row.content : {};
    const sn = String(content.siteName || r.name || '').trim();
    const fa = String(content.footerAddress || r.address || '').trim();
    const linked = String(row.linkedTemplateCustomizationId || '').trim();
    if (linked === excludeId) continue;
    if (!duplicatePairMatches(siteName, footerAddress, sn, fa)) continue;
    addHit({
      source: 'dashboard',
      id: did,
      draftName: String(r.name || content.siteName || did).trim() || did,
      siteName: sn,
      footerAddress: fa,
      linkedTemplateCustomizationId: linked || undefined,
    });
  }

  var hits = Array.from(byKey.values());
  var customIds = new Set(
    hits
      .filter(function (h) {
        return h.source === 'customization';
      })
      .map(function (h) {
        return h.id;
      }),
  );
  return hits.filter(function (h) {
    if (h.source !== 'dashboard') return true;
    var lid = h.linkedTemplateCustomizationId;
    return !(lid && customIds.has(lid));
  });
}
