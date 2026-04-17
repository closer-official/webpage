/**
 * parser.js — ホットペッパー全文テキストからサロンデータを抽出
 */

import { createEmptySalon } from './schema.js';

// ---- ユーティリティ ----

function lines(text) {
  return text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
}

function cleanLine(line) {
  // 「サロン名の写真」「サロン名のサロンヘッダー」等を除去
  return line
    .replace(/^.{2,30}(のサロンヘッダー|のお店ロゴ|の写真|の口コミ|のクーポン|のサロンデータ|のPICK UPスタイリスト|のCHECKスタイル|のこだわり|の雰囲気|からの一言).*/g, '')
    .replace(/HOT PEPPER Beauty.*$/g, '')
    .replace(/空席確認・予約する.*/g, '')
    .replace(/ブックマークする.*/g, '')
    .trim();
}

function removeHotpepperNoise(text) {
  // ナビゲーション・フッター等の定型ノイズを除去
  const noisePatterns = [
    /HOT PEPPER Beauty.*/g,
    /国内最大級のヘアサロン.*/g,
    /総合トップ.*>/,
    /ヘアサロン\s*ヘアスタイル.*/g,
    /ネイル・まつげサロン.*/g,
    /リラクサロン.*/g,
    /エステサロン.*/g,
    /美容クリニック.*/g,
    /サロン情報クーポン.*/g,
    /メニューこだわりスタイリスト.*/g,
    /\(C\) Recruit.*/g,
    /スタッフ募集\s*https?.*/g,
    /おすすめクーポンをもっと見る.*/g,
    /このサロンのすべての.*/g,
    /メニューを追加して予約.*/g,
    /このクーポンで\s*空席確認.*/g,
    /ポイントが1%たまる.*/g,
    /ようこそ、ゲストさん.*/g,
    /ログインする\s*会員登録.*/g,
    /よくある問い合わせ.*/g,
    /スマート支払いについて.*/g,
    /近隣サロン.*/g,
    /利用規約.*/g,
    /プライバシーポリシー.*/g,
    /ご利用ガイド.*/g,
    /指名して予約する/g,
    /空席確認・予約する/g,
    /ブックマークする/g,
    /サロンPick Up/g,
    /投稿日\].*/g,
    /総合\d+★.*/g,
    /※.{0,120}/g,
  ];
  let cleaned = text;
  noisePatterns.forEach(p => { cleaned = cleaned.replace(p, ''); });
  return cleaned;
}

// ---- 個別抽出関数 ----

/** メニュー・価格・クーポン行など（先頭に来ても店名ではない） */
function isUnlikelySalonNameLine(l) {
  if (!l) return true;
  const s = String(l).trim();
  if (s.length < 2) return true;
  if (/HOT\s*PEPPER|検索|サイトトップ|国内最大級/.test(s)) return true;
  if (/(初来店|2回目以降|リピート|再来店|新規).{0,16}[¥￥,，\d]/.test(s)) return true;
  if (/[¥￥]\s*[\d,]+/.test(s)) return true;
  if (/[\d,]+\s*円/.test(s)) return true;
  if (/\t/.test(s) && /[¥￥\d]/.test(s)) return true;
  if (/対象\s*[：:]/.test(s) && s.length < 40) return true;
  if (/所要時間|施術時間/.test(s) && /\d+\s*分/.test(s)) return true;
  if (/空席確認|ブックマーク|会員登録|ログイン/.test(s)) return true;
  if (/クーポン|メニュー一覧|スタイリスト一覧/.test(s) && s.length < 30) return true;
  if (/^\d\.\d{1,2}$/.test(s)) return true;
  if (/^[（(]?\d+件[）)]$/.test(s)) return true;
  if (/^総合トップ|^\s*>\s*$|美容院・美容室・ヘアサロン検索トップ/.test(s)) return true;
  if (/^東京都|^大阪府|^神奈川県|^埼玉県|^千葉県|^愛知県|^福岡県|^北海道/.test(s) && s.length < 56) return true;
  return false;
}

/**
 * 全文コピーで先頭がパンくずでも、「…(F)\nHOT PEPPER Beauty」の直前行を店名に。
 * strip 前の raw に対して呼ぶ（strip 後だとナビの HOT PEPPER が無いことがある）。
 */
function extractNameBeforeHotPepperBanner(text) {
  const t = String(text || '').replace(/\r\n/g, '\n');
  const hp = /\nHOT\s*PEPPER\s*Beauty/i.exec(t);
  if (!hp || hp.index < 1) return '';
  const before = t.slice(0, hp.index);
  const line = (before.split('\n').pop() || '').trim();
  if (line.length < 2 || line.length > 52) return '';
  if (!/[\u30A0-\u30FF\u4E00-\u9FFF]/.test(line)) return '';
  if (isUnlikelySalonNameLine(line)) return '';
  const cleaned = line.replace(/\(.*?\)/g, '').replace(/（.*?）/g, '').trim();
  return cleaned || line;
}

function extractNameFromPatterns(text) {
  const t = String(text || '').replace(/\r\n/g, '\n');
  const labelRe = [
    /店\s*名\s*[：:･・\t]\s*([^\n\r]+)/,
    /サロン名\s*[：:･・\t]\s*([^\n\r]+)/,
    /お店の名前\s*[：:]\s*([^\n\r]+)/,
    /(?:^|\n)店名\s*[：:]\s*([^\n\r]+)/,
  ];
  for (const p of labelRe) {
    const m = t.match(p);
    if (m && m[1]) {
      const cand = m[1]
        .replace(/\s*[|｜].*$/, '')
        .replace(/HOT\s*PEPPER.*/i, '')
        .trim();
      if (cand.length >= 2 && cand.length <= 60 && !isUnlikelySalonNameLine(cand)) return cand.slice(0, 60);
    }
  }
  const pipe = t.match(/([\u3040-\u30FF\u4E00-\u9FFF\w][\u3040-\u30FF\u4E00-\u9FFF\w\s·．・]{1,40})\s*[|｜]\s*HOT\s*PEPPER/i);
  if (pipe && pipe[1]) {
    const cand = pipe[1].replace(/\s+/g, ' ').trim();
    if (!isUnlikelySalonNameLine(cand)) return cand.slice(0, 60);
  }
  return '';
}

/**
 * HP 先頭の「ブラウザ用の長いタイトル行」対策。
 * 例: `Hairsalon F …【ヘアサロン　エフ】` の次行 `ヘアサロンエフ` や【】内の屋号を店名にする。
 */
function extractNameHotpepperHead(rawLines) {
  if (!rawLines || !rawLines.length) return '';
  const line0 = String(rawLines[0] || '').trim();
  const line1 = rawLines.length > 1 ? String(rawLines[1] || '').trim() : '';

  const inBrackets = [];
  const re = /【([\u3040-\u30FF\u4E00-\u9FFF\w・　\s]{2,30})】/g;
  let m;
  while ((m = re.exec(line0)) !== null) {
    const inner = m[1].replace(/[ 　\t]+/g, '').trim();
    if (inner.length >= 2) inBrackets.push(inner);
  }
  if (inBrackets.length) {
    const serviceish = /^(ブリーチ|カラー|カット|メンズ|レディース|当日|空き|改善|韓国|渋谷|表参道)/;
    for (let i = inBrackets.length - 1; i >= 0; i--) {
      const c = inBrackets[i];
      if (!serviceish.test(c) && c.length <= 20) return c;
    }
    const last = inBrackets[inBrackets.length - 1];
    if (!serviceish.test(last)) return last.slice(0, 22);
  }

  if (line1 && !isUnlikelySalonNameLine(line1)) {
    const jpShort = /^[\u3040-\u30FF\u4E00-\u9FFF・\s]{2,22}$/.test(line1);
    const longTitle0 =
      line0.length > 24 && (/[/／]/.test(line0) || /【/.test(line0) || /[A-Za-z]{4,}/.test(line0));
    if (jpShort && longTitle0) return line1.replace(/\s+/g, '');
  }
  return '';
}

/** 本文全体から、ノイズでない短い日本語行を店名候補に */
function extractNameLoose(rawLines) {
  for (let i = 0; i < Math.min(160, rawLines.length); i++) {
    const l = rawLines[i];
    if (!l || isUnlikelySalonNameLine(l)) continue;
    if (!/[\u30A0-\u30FF\u4E00-\u9FFF]/.test(l)) continue;
    if (l.length < 2 || l.length > 52) continue;
    if (/^https?:\/\//i.test(l)) continue;
    return l.replace(/\(.*?\)/g, '').replace(/（.*?）/g, '').trim().slice(0, 52);
  }
  return '';
}

/** ブラウザタブ用の長い英日混じりタイトル（店名ではない） */
function isBrowserTitleNoiseLine(l) {
  const s = String(l || '').trim();
  if (s.length < 32) return false;
  if (/【.+】/.test(s) && /[A-Za-z]/.test(s) && (/[/／]/.test(s) || s.length > 45)) return true;
  return false;
}

function extractName(rawLines) {
  // 先頭〜中盤まで走査（全文コピーでナビが数十行続く場合がある）
  for (let i = 0; i < Math.min(120, rawLines.length); i++) {
    const l = rawLines[i];
    if (!l || isUnlikelySalonNameLine(l)) continue;
    if (isBrowserTitleNoiseLine(l)) continue;
    // 「（英語名）」パターン or 単純な店名（長い説明文は除外しつつ少し緩める）
    if (/[\u30A0-\u30FF\u4E00-\u9FFF]/.test(l) && l.length < 40 && !l.includes('HOT PEPPER') && !l.includes('検索') && !l.includes('サイト') && !l.includes('トップ')) {
      return l.replace(/\(.*?\)/g, '').replace(/（.*?）/g, '').trim();
    }
  }
  for (let i = 0; i < Math.min(160, rawLines.length); i++) {
    const l = rawLines[i];
    if (!l || isUnlikelySalonNameLine(l)) continue;
    if (isBrowserTitleNoiseLine(l)) continue;
    if (/[\u30A0-\u30FF\u4E00-\u9FFF]/.test(l) && l.length >= 2 && l.length <= 58 && !l.includes('HOT PEPPER') && !l.includes('検索') && !l.includes('サイト') && !l.includes('トップ')) {
      return l.replace(/\(.*?\)/g, '').replace(/（.*?）/g, '').trim();
    }
  }
  return '';
}

function extractTitle(rawLines) {
  // 英語混じりのキャッチタイトル（「HAVANA 渋谷 髪質改善...」など）
  for (let i = 0; i < Math.min(30, rawLines.length); i++) {
    const l = rawLines[i];
    if (!l) continue;
    if (/[A-Za-z]/.test(l) && /[\u30A0-\u30FF\u4E00-\u9FFF]/.test(l) && l.length > 10 && l.length < 80 && !l.includes('HOT PEPPER') && !l.includes('PRODUCED') && !l.includes('https://')) {
      return l;
    }
  }
  return '';
}

function extractRatingAndReviews(text) {
  // 「4.84」「（438件）」
  const ratingMatch = text.match(/(\d\.\d{1,2})\s*[\n\r（(]/);
  const reviewMatch = text.match(/[（(](\d+)件[）)]/);
  return {
    rating: ratingMatch ? parseFloat(ratingMatch[1]) : null,
    reviewCount: reviewMatch ? parseInt(reviewMatch[1]) : null
  };
}

function extractAddress(rawLines) {
  for (const l of rawLines) {
    if (/東京都|大阪府|神奈川県|埼玉県|千葉県|京都府|兵庫県|愛知県|福岡県|北海道|[都道府県]/.test(l) && l.length < 60) {
      return l.trim();
    }
  }
  return '';
}

function extractAccessShort(rawLines) {
  for (const l of rawLines) {
    if ((l.includes('徒歩') || l.includes('駅')) && l.length < 80 && !l.includes('アクセス・道案内')) {
      return l.trim();
    }
  }
  return '';
}

function extractAccessFull(text) {
  const m = text.match(/アクセス・道案内[\t\s]+([\s\S]+?)(?=\n営業時間|\n定休日|\n支払い)/);
  if (m) {
    return m[1].replace(/髪質改善.*$/, '').trim();
  }
  return '';
}

function extractHeroCatch(rawLines) {
  for (const l of rawLines) {
    if ((l.includes('当日予約') || l.includes('当日◎') || l.includes('人気サロン') || l.includes('注目サロン')) && l.length < 100) {
      return l.trim();
    }
  }
  // フォールバック: 「当日」を含む行
  for (const l of rawLines) {
    if (l.includes('当日') && l.length < 100) return l.trim();
  }
  return '';
}

function extractIntroText(text) {
  // 「＜＞」または半角「<>」〜次の「空席確認」まで
  let m = text.match(/＜＞\s*([\s\S]+?)(?=\s*空席確認)/);
  if (!m) m = text.match(/<>\s*([\s\S]+?)(?=\s*空席確認)/);
  if (m) return m[1].trim().slice(0, 12000);
  // フォールバック: 最初の長い段落
  const paras = text.split(/\n{2,}/);
  for (const p of paras) {
    const t = p.trim();
    if (t.length > 60 && t.length < 12000 && !t.includes('HOT PEPPER') && !t.includes('検索') && /[\u4E00-\u9FFF]/.test(t)) {
      return t;
    }
  }
  return '';
}

function extractKodawari(text) {
  // 「のこだわり」以降から特徴を抽出
  const features = [];
  const section = text.match(/のこだわり\s*([\s\S]+?)(?=からの一言|の雰囲気|のPICK UP)/);
  if (!section) return features;

  const blocks = section[1].split(/詳細を見る/);
  for (const block of blocks) {
    const blockLines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (blockLines.length < 2) continue;
    const title = blockLines[0];
    // タイトルの重複行をスキップ
    const textLines = blockLines.slice(1).filter(l => l !== title && l.length > 10);
    if (title && textLines.length > 0) {
      features.push({ title, text: textLines.join(' ').substring(0, 200) });
    }
  }
  return features;
}

function extractMessage(text) {
  const section = text.match(/からの一言\s*([\s\S]+?)(?=の雰囲気|のPICK UP|のCHECK|のサロンデータ)/);
  if (!section) return { title: '', text: '' };

  const blockLines = section[1].split('\n').map(l => l.trim()).filter(Boolean);
  // 最初の行がタイトル（ハッシュタグを含む可能性）
  let titleIdx = -1;
  let mainText = '';

  for (let i = 0; i < blockLines.length; i++) {
    if (blockLines[i].startsWith('#')) continue;
    if (blockLines[i].length > 30 && !blockLines[i].startsWith('空席')) {
      if (mainText === '') {
        mainText = blockLines[i];
      }
    }
  }

  const hashLine = blockLines.find(l => l.startsWith('#'));
  const title = hashLine ? hashLine.replace(/#/g, '').trim().split('　')[0] : '';

  return { title, text: mainText.substring(0, 300) };
}

function extractAtmosphere(text) {
  const section = text.match(/の雰囲気\s*([\s\S]+?)(?=サロンの利用傾向|のPICK UP|のCHECK)/);
  if (!section) return [];

  const atmoLines = section[1].split('\n').map(l => l.trim()).filter(l => l.length > 5 && l.length < 60);
  // 「サロン名の雰囲気（...）」形式から括弧内テキストを抽出 or 短い説明文
  const results = [];
  for (const l of atmoLines) {
    const m = l.match(/）\s*(.+)$/) || l.match(/^([^（(]+)$/);
    if (m && m[1] && m[1].length > 4 && !m[1].includes('の雰囲気')) {
      results.push(m[1].trim());
    }
  }
  return [...new Set(results)].slice(0, 6);
}

function extractCoupons(text) {
  const coupons = [];
  // クーポンセクションを探す
  const couponSection = text.match(/のクーポン\s*([\s\S]+?)(?=の口コミ|よくある問い合わせ|$)/);
  const src = couponSection ? couponSection[1] : text;

  // 新規/再来/全員ブロックを分割
  const typeMap = { '新': '新規', '再': '再来', '全': '全員' };
  const blocks = src.split(/\n(?=新\n規|再\n来|全\n員)/);

  for (const block of blocks) {
    const bLines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (bLines.length < 3) continue;

    let type = '';
    if (bLines[0] === '新' && bLines[1] === '規') type = '新規';
    else if (bLines[0] === '再' && bLines[1] === '来') type = '再来';
    else if (bLines[0] === '全' && bLines[1] === '員') type = '全員';
    if (!type) continue;

    // カテゴリ（カット、カラー等）
    const categories = [];
    let priceStr = '';
    let title = '';
    let i = 2;

    while (i < bLines.length) {
      const l = bLines[i];
      if (/^[¥￥][\d,]+$/.test(l) || /^\d{1,2}:\d{2}/.test(l) || l.includes('限定') || l.includes('指定')) {
        if (/^[¥￥][\d,]+$/.test(l)) priceStr = l;
        i++;
        continue;
      }
      if (['カット', 'カラー', 'トリートメント', 'パーマ', 'スタイリスト指定', 'ヘアセット', 'ブリーチ'].includes(l)) {
        categories.push(l);
        i++;
        continue;
      }
      if (l.length > 8 && !l.startsWith('来店日') && !l.startsWith('対象') && !l.startsWith('その他') && !l.startsWith('平日') && !l.startsWith('土') && !l.startsWith('日') && title === '') {
        title = l;
      }
      i++;
    }

    if (title && priceStr) {
      const price = priceStr.replace(/[¥￥,]/g, '');
      coupons.push({ type, categories, price: parseInt(price) || 0, priceStr, title });
    }
  }

  return coupons.slice(0, 8);
}

function extractStaff(text) {
  const staff = [];
  const section = text.match(/のPICK UPスタイリスト\s*([\s\S]+?)(?=のCHECKスタイル|のサロンデータ)/);
  if (!section) return staff;

  const sLines = section[1].split('\n').map(l => l.trim()).filter(Boolean);
  let i = 0;
  while (i < sLines.length) {
    const l = sLines[i];
    // スタイリスト名行: 日本語またはローマ字で短め、ふりがな行が続く
    if (l.length < 30 && l.length > 1 && !l.includes('歴') && !l.includes('◎') && !l.includes('♪')) {
      const name = l;
      const specialty = sLines[i + 2] || '';
      const experience = (sLines[i + 3] || '').match(/（歴\d+年）/)?.[0] || '';
      const catchLine = (sLines[i + 4] || '');
      staff.push({ name, specialty, experience, catch: catchLine, avatarUrl: '', avatarText: '' });
      i += 5;
      continue;
    }
    i++;
  }
  return staff.slice(0, 5);
}

function extractSalonData(text) {
  const get = (key) => {
    const m = text.match(new RegExp(key + '[\\t　]+([^\\n]+)'));
    return m ? m[1].trim() : '';
  };

  const openingHoursRaw = get('営業時間');
  const closedDaysRaw = get('定休日');
  const paymentRaw = get('支払い方法');
  const seatsRaw = get('席数');
  const staffRaw = get('スタッフ数');
  const parkingRaw = get('駐車場');
  const cutPriceRaw = get('カット価格');
  const homepageRaw = get('お店のホームページ');

  // キーワードノイズ除去（メニュー名・地名タグ等）
  const cleanData = (val) => val.replace(/\/(髪質改善|縮毛矯正|レイヤーカット|渋谷|表参道|学割U24|ボブ|韓国風|海外風|メンズカット|ヘアセット|前髪カット|ダブルカラー|インナーカラー|ケアブリーチ|シールエクステ|ベージュカラー|カット価格|髪質改善カラー|ザクザクレイヤー|ウルフレイヤー|レイヤーボブ|前髪レイヤーボブ|顔周りレイヤーボブ|ハイライト|ダブルカラー|パーマ|透明感カラー)[^\n]*/g, '').trim();

  return {
    openingHours: cleanData(openingHoursRaw),
    closedDays: cleanData(closedDaysRaw),
    paymentMethods: cleanData(paymentRaw).replace(/\/[A-Za-z].*/g, '').trim(),
    seatCount: seatsRaw.match(/セット面(\d+席)/)?.[1] || seatsRaw.match(/(\d+席)/)?.[1] || '',
    staffCount: staffRaw.match(/スタイリスト.+アシスタント.+/)?.[0] || staffRaw,
    parking: cleanData(parkingRaw),
    cutPrice: cutPriceRaw.match(/[¥￥][\d,]+/)?.[0] || '',
    homepageUrl: homepageRaw.match(/https?:\/\/[^\s]+/)?.[0] || ''
  };
}

function extractStats(text) {
  const firstM = text.match(/初来店[\t　]+([¥￥][^\n]+)/);
  const repeatM = text.match(/2回目以降来店[\t　]+([¥￥][^\n]+)/);

  const femaleM = text.match(/女性\s*\n(\d+)%/);
  const maleM = text.match(/男性\s*\n(\d+)%/);

  const ageRatio = [];
  const agePattern = /[〜～]?(\d+代|10代以下|50代〜|〜10代)\s*\n(\d+)%/g;
  let am;
  while ((am = agePattern.exec(text)) !== null) {
    ageRatio.push({ label: am[1], value: parseInt(am[2]) });
  }

  return {
    firstVisitPrice: firstM ? firstM[1].trim() : '',
    repeatVisitPrice: repeatM ? repeatM[1].trim() : '',
    genderRatio: {
      female: femaleM ? parseInt(femaleM[1]) : null,
      male: maleM ? parseInt(maleM[1]) : null
    },
    ageRatio
  };
}

// ---- メインパーサー ----

/** 本文に十分な情報があるが店名だけ取れないときの仮名（②で差し替え前提） */
export const SALON_NAME_PLACEHOLDER = '（店名を自動判定できませんでした）';

/**
 * ブラウザで「全選択」したときのパンくず・グローバルナビ等を削り、本編に近づける。
 * （元テキストは壊さず、解析用のコピーだけ短くする）
 */
export function stripHpFullPageNoise(text) {
  let t = String(text || '')
    .replace(/^\uFEFF/, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
  if (t.length > 220000) t = t.slice(0, 220000);
  if (t.length < 800) return t;

  // タイトル行（ページ中盤の目印）。先頭に無いケースもあるので ^ も許容
  const idxH = t.search(/\nHairsalon F[^\n]{6,240}\n/);
  if (idxH !== -1) return t.slice(idxH + 1);
  if (/^Hairsalon F[^\n]{6,240}\n/m.test(t)) return t;

  // ＜＞ の「直後だけ」に切ると店名・評価ブロックを捨てて名前抽出が壊れる。
  // ＜＞の少し手前まで残す（全文コピーでナビだけ落とす用途）
  const idxA = t.search(/\n＜＞\s*\n/);
  if (idxA > 600) {
    const back = Math.max(0, idxA - 4500);
    return t.slice(back);
  }

  const mR = t.match(/\n(\d\.\d{1,2})\s*\n\s*[（(](\d+)件[）)]\s*\n\s*(東京都[^\n]{8,})/);
  if (mR && mR.index != null && mR.index > 120 && mR.index < 200000) {
    const cut = t.lastIndexOf('\n\n', mR.index);
    if (cut > 0) return t.slice(cut + 2);
    return t.slice(Math.max(0, mR.index - 3500));
  }

  return t;
}

export function parseHotpepper(rawTextIn) {
  const salon = createEmptySalon();
  const rawText = stripHpFullPageNoise(rawTextIn);
  const rawLines = rawText.split(/\r?\n/).map(l => l.trim());
  const cleanedLines = rawLines.map(cleanLine).filter(Boolean);
  const cleanedText = removeHotpepperNoise(rawText);

  let nameGuess =
    extractNameHotpepperHead(rawLines) ||
    extractNameBeforeHotPepperBanner(rawTextIn) ||
    extractNameFromPatterns(rawText) ||
    extractName(rawLines) ||
    extractNameLoose(rawLines) ||
    '';
  if (nameGuess && isUnlikelySalonNameLine(nameGuess)) nameGuess = '';
  salon.name = nameGuess.trim();
  salon.title = extractTitle(rawLines);

  const { rating, reviewCount } = extractRatingAndReviews(rawText);
  salon.rating = rating;
  salon.reviewCount = reviewCount;

  salon.address = extractAddress(rawLines);
  salon.accessShort = extractAccessShort(rawLines);
  salon.accessFull = extractAccessFull(rawText);
  salon.heroCatch = extractHeroCatch(cleanedLines);
  salon.introText = extractIntroText(rawText);

  const { title: msgTitle, text: msgText } = extractMessage(rawText);
  salon.messageTitle = msgTitle;
  salon.messageText = msgText;

  salon.features = extractKodawari(rawText);
  salon.atmosphere = extractAtmosphere(rawText);
  salon.coupons = extractCoupons(rawText);
  salon.staff = extractStaff(rawText);

  const salonData = extractSalonData(rawText);
  salon.openingHours = salonData.openingHours;
  salon.closedDays = salonData.closedDays;
  salon.paymentMethods = salonData.paymentMethods;
  salon.seatCount = salonData.seatCount;
  salon.staffCount = salonData.staffCount;
  salon.parking = salonData.parking;
  salon.cutPrice = salonData.cutPrice;
  salon.homepageUrl = salonData.homepageUrl;
  const hp = String(salon.homepageUrl || '').trim();
  if (hp && /^https?:\/\//i.test(hp)) {
    if (!String(salon.reserveUrl || '').trim()) salon.reserveUrl = hp;
    if (!String(salon.staffListUrl || '').trim()) salon.staffListUrl = hp;
  }

  salon.stats = extractStats(rawText);

  if (String(salon.name || '').trim() && isUnlikelySalonNameLine(salon.name)) {
    salon.name = '';
  }
  if (!String(salon.name || '').trim()) {
    const rawCompact = String(rawText || '').replace(/\s/g, '');
    const hasJp = /[\u30A0-\u30FF\u4E00-\u9FFF]/.test(rawText);
    const hasBody =
      (String(salon.introText || '').replace(/\s/g, '').length > 50) ||
      (Array.isArray(salon.coupons) && salon.coupons.length > 0) ||
      (Array.isArray(salon.features) && salon.features.length > 0) ||
      (Array.isArray(salon.staff) && salon.staff.length > 0) ||
      rawCompact.length > 100 ||
      (hasJp && rawCompact.length > 15);
    if (hasBody) salon.name = SALON_NAME_PLACEHOLDER;
  }

  return salon;
}
