/**
 * 公開テンプレギャラリー用メタ（カテゴリ・人気度・タグ）。
 * 実アクセスログと連動していない popularity は運営が調整する静的スコア。
 */

/** @type {Record<string, { category: string, categories: string[], popularity: number, tags: string[] }>} */
export const BUILTIN_CATALOG_META = Object.freeze({
  cafe_1: Object.freeze({
    category: '飲食・複数店舗',
    categories: ['飲食', '店舗', 'ミニマル'],
    popularity: 94,
    tags: ['カフェ', 'レストラン', 'シンプル', '複数店舗'],
  }),
  gym_personal_neon: Object.freeze({
    category: 'ジム・フィットネス（Valx）',
    categories: ['ジム', 'パーソナル', 'LP', 'Valx'],
    popularity: 91,
    tags: ['無料体験', 'LINE', 'ネオン', '販売LP', 'gym-valx-intro'],
  }),
  /** 旧ビルトイン（一覧には出ない） */
  gym_yoga: Object.freeze({
    category: 'ジム・フィットネス（レガシー）',
    categories: ['ジム', 'フィットネス', 'LP'],
    popularity: 68,
    tags: ['パーソナル', 'ヨガ', 'トレーニング', 'レガシー'],
  }),
  /** 旧ビルトイン（カスタムの base や過去ヒアリング用。ギャラリーには出ない） */
  academy_lp: Object.freeze({
    category: 'セールス・教室（レガシー）',
    categories: ['セールス', '教育', 'LP'],
    popularity: 70,
    tags: ['ランディングページ', '講座', '集客', '高CV', 'レガシー'],
  }),
  navy_cyan_consult: Object.freeze({
    category: '法人・相談',
    categories: ['ビジネス', '士業', 'Web'],
    popularity: 88,
    tags: ['コーポレート', '信頼感', 'コンサル'],
  }),
});

function simpleHash(str) {
  let h = 2166136261;
  const s = String(str || '');
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** @returns {number} ISO week 1–53 */
export function getISOWeek(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
}

/** 週次シャッフル用シード（年×100+週） */
export function weekSeedFromDate(d = new Date()) {
  return d.getFullYear() * 100 + getISOWeek(d);
}

export function formatWeekPickupLabel(d = new Date()) {
  const y = d.getFullYear();
  const w = getISOWeek(d);
  return `${y}年 第${w}週のピックアップ`;
}

/**
 * Mulberry32
 * @param {number} seed
 */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * @param {string[]} ids
 * @param {number} seed
 * @param {number} count
 */
export function pickWeeklyShowcase(ids, seed, count = 4) {
  const list = [...new Set(ids)];
  if (!list.length) return [];
  const rnd = mulberry32(seed);
  const shuffled = [...list];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * @param {{ id: string, baseTemplateId?: string, isCustom?: boolean, kind?: string }} c
 */
export function getMetaForCandidate(c) {
  const id = c.id;
  const base = c.baseTemplateId || id;
  if (!c.isCustom && BUILTIN_CATALOG_META[id]) {
    return { ...BUILTIN_CATALOG_META[id] };
  }
  if (c.isCustom && BUILTIN_CATALOG_META[base]) {
    const b = BUILTIN_CATALOG_META[base];
    const bump = simpleHash(id) % 9;
    return {
      category: `${b.category}（カスタム）`,
      categories: [...b.categories, 'カスタム'],
      popularity: Math.min(99, b.popularity - 3 + bump),
      tags: [...b.tags, 'オリジナル'],
    };
  }
  if (c.kind === 'blueprint') {
    return {
      category: '参考デザイン',
      categories: ['カスタム', 'ブループリント'],
      popularity: 82,
      tags: ['オーダーメイド', '参考URL'],
    };
  }
  if (c.isCustom) {
    return {
      category: 'カスタムテンプレート',
      categories: ['カスタム'],
      popularity: 72 + (simpleHash(id) % 15),
      tags: ['オリジナル'],
    };
  }
  return {
    category: 'その他',
    categories: ['その他'],
    popularity: 70,
    tags: [],
  };
}
