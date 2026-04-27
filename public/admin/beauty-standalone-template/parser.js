/**
 * parser.js — ホットペッパー全文テキストからサロンデータを抽出
 */

import { createEmptySalon } from './schema.js';

// ---- ユーティリティ ----

/** ABOUT 用：ホットペッパーの「空席確認・予約する」CTA より手前だけ残す */
export function truncateSalonIntroBeforeReserveCta(text) {
  const s = String(text || '');
  const needle = '空席確認・予約する';
  const i = s.indexOf(needle);
  if (i < 0) return s.trim();
  return s.slice(0, i).trim();
}

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
  let best = '';
  for (const l of rawLines) {
    const t = l.trim();
    if (!t) continue;
    if (!/(東京都|大阪府|神奈川県|埼玉県|千葉県|京都府|兵庫県|愛知県|福岡県|北海道|都道府県)/.test(t)) continue;
    if (t.length > 130) continue;
    if (t.length > best.length) best = t;
  }
  return best;
}

function extractAccessShort(rawLines) {
  for (const l of rawLines) {
    const t = l.trim();
    if (!t || t.includes('アクセス・道案内')) continue;
    if (t.length > 130) continue;
    if (
      (t.includes('徒歩') || t.includes('駅') || /\d+\s*分/.test(t)) &&
      (t.includes('注目') || t.includes('当日') || t.includes('人気') || t.includes('徒歩') || t.includes('駅'))
    ) {
      return t;
    }
  }
  for (const l of rawLines) {
    const t = l.trim();
    if (t.includes('徒歩') && t.length < 130 && !t.includes('アクセス・道案内')) return t;
  }
  return '';
}

function extractAccessFull(text) {
  const m = text.match(/アクセス・道案内[\t\s]+([\s\S]+?)(?=\n営業時間|\n定休日|\n支払い|\n席数|\nスタッフ数)/);
  if (m) {
    return m[1].replace(/髪質改善.*$/, '').trim().slice(0, 2500);
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
  // 「＜＞」または半角「<>」〜次の「空席確認・予約する」まで（CTA 文言は含めない）
  let m = text.match(/＜＞\s*([\s\S]+?)(?=\s*空席確認・予約する)/);
  if (!m) m = text.match(/<>\s*([\s\S]+?)(?=\s*空席確認・予約する)/);
  if (m) return truncateSalonIntroBeforeReserveCta(m[1].trim()).slice(0, 12000);
  // フォールバック: 最初の長い段落
  const paras = text.split(/\n{2,}/);
  for (const p of paras) {
    const t = p.trim();
    if (t.length > 60 && t.length < 12000 && !t.includes('HOT PEPPER') && !t.includes('検索') && /[\u4E00-\u9FFF]/.test(t)) {
      return truncateSalonIntroBeforeReserveCta(t).slice(0, 12000);
    }
  }
  return '';
}

function extractKodawari(text) {
  const features = [];
  // 見出しが「サロン名のこだわり」のように前に付く場合がある
  const section = text.match(/[^\n]{0,120}のこだわり\s*([\s\S]+?)(?=[^\n]{0,100}からの一言|の雰囲気|のPICK UP)/);
  if (!section) return features;

  const blocks = section[1].split(/詳細を見る/);
  for (const block of blocks) {
    const blockLines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (blockLines.length < 2) continue;
    let title = blockLines[0].replace(/のこだわり\s*$/, '').trim();
    if (/の写真|HOT PEPPER|空席確認/.test(title)) continue;
    const textLines = blockLines.slice(1).filter(l => l !== title && l.length > 10 && !/の写真/.test(l));
    if (title && textLines.length > 0) {
      features.push({ title: title.slice(0, 120), text: textLines.join(' ').substring(0, 500) });
    }
  }
  return features;
}

function extractMessage(text) {
  const section = text.match(/[^\n]{0,120}からの一言\s*([\s\S]+?)(?=の雰囲気|のPICK UP|のCHECK|のサロンデータ)/);
  if (!section) return { title: '', text: '' };

  let chunk = String(section[1] || '');
  const ctaIdx = chunk.indexOf('空席確認・予約する');
  if (ctaIdx >= 0) chunk = chunk.slice(0, ctaIdx);
  chunk = chunk.trim();

  const blockLines = chunk.split('\n').map(l => l.trim()).filter(Boolean);
  const firstHashIdx = blockLines.findIndex((l) => l.startsWith('#'));

  if (firstHashIdx >= 0) {
    let i = firstHashIdx;
    const hashLines = [];
    while (i < blockLines.length && blockLines[i].startsWith('#')) {
      hashLines.push(blockLines[i]);
      i += 1;
    }
    const title = hashLines
      .join(' ')
      .replace(/#/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 80);
    const bodyLines = blockLines
      .slice(i)
      .filter((l) => l && !/^空席確認/.test(l) && !/の写真|^https?:\/\//i.test(l));
    const mainText = bodyLines.join('\n').trim().slice(0, 2000);
    return { title, text: mainText };
  }

  let mainText = '';
  for (let j = 0; j < blockLines.length; j++) {
    const l = blockLines[j];
    if (!l || l.startsWith('#') || l.startsWith('空席')) continue;
    if (/の写真|^https?:\/\//i.test(l)) continue;
    if (l.length > 40) {
      mainText = l;
      break;
    }
  }
  if (!mainText) {
    for (let j = 0; j < blockLines.length; j++) {
      const l = blockLines[j];
      if (l && l.length > 25 && !l.startsWith('空席') && !/の写真/.test(l)) {
        mainText = l;
        break;
      }
    }
  }
  return { title: '', text: mainText.substring(0, 2000) };
}

function extractAtmosphere(text) {
  const section = text.match(/[^\n]{0,120}の雰囲気\s*([\s\S]+?)(?=サロンの利用傾向|のPICK UP|のCHECK|人気のクーポン)/);
  if (!section) return [];

  const atmoLines = section[1].split('\n').map(l => l.trim()).filter(l => l.length > 5 && l.length < 120);
  const results = [];
  for (const l of atmoLines) {
    if (/の写真|HOT PEPPER/.test(l)) continue;
    const m = l.match(/の雰囲気（([^）]+)）/) || l.match(/）\s*(.+)$/) || l.match(/^([^（(]+)$/);
    if (m && m[1] && m[1].length > 4 && !m[1].includes('の雰囲気')) {
      results.push(m[1].trim());
    }
  }
  return [...new Set(results)].slice(0, 6);
}

function extractCoupons(text) {
  const coupons = [];
  let couponSection = text.match(/のクーポン\s*([\s\S]+?)(?=の口コミ|よくある問い合わせ|ピックアップ|$)/);
  if (!couponSection) {
    couponSection = text.match(/人気のクーポン\s*([\s\S]+?)(?=人気のスタイル|サロンの利用傾向|予約比率|$)/);
  }
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

function cleanStaffNameFromLine(line) {
  const l = String(line || '').trim();
  if (!l || /の写真|空席確認|指名して/.test(l)) return '';
  const m = l.match(/(?:^|\)\s*)([\u3040-\u30FF\u4E00-\u9FFF\w・\s]{2,36})\s*(【渋谷】|【表参道】|メンズ渋谷|【原宿】|【新宿】)\s*$/);
  if (m) return `${m[1].trim()} ${m[2]}`.replace(/\s+/g, ' ').trim();
  const mGen = l.match(/^([\u3040-\u30FF\u4E00-\u9FFF\w・\s]{2,36})\s*【[^】\n]{1,22}】\s*$/);
  if (mGen && !/（歴|Instagram|Stylist/i.test(l)) {
    const br = l.match(/【[^】]+】/);
    return `${mGen[1].trim()}${br ? ' ' + br[0] : ''}`.replace(/\s+/g, ' ').trim();
  }
  if (l.length < 36 && /【|メンズ渋谷/.test(l) && !l.includes('（歴')) return l;
  return '';
}

/** ホットペッパー本文中の「名前 【駅】」＋読み仮名＋【Stylist】Instagram…＋専門行 ブロック */
function parseInlineStylistNameLine(line) {
  const l = String(line || '').trim();
  if (!l || l.length > 52) return '';
  if (/の写真|空席確認|指名して|Instagram|【Stylist】|（歴\d+年）/.test(l)) return '';
  const m = l.match(/^([\u4E00-\u9FFF\u3040-\u30FF](?:[\u4E00-\u9FFF\u3040-\u30FF0-9A-Za-z・\s])*)\s*【[^】\n]{1,24}】\s*$/);
  if (!m) return '';
  return m[1].replace(/\s+/g, ' ').trim().slice(0, 40);
}

function isLikelyStylistReadingLine(line, nameCore) {
  const l = String(line || '').trim();
  if (!l || l.length > 32) return false;
  if (l === nameCore) return false;
  if (/【|Instagram|Stylist|（歴/.test(l)) return false;
  if (/[／/]/.test(l) && l.length > 14) return false;
  if (/^[\u30A0-\u30FF゠-ヿ\s・ー-]+$/.test(l)) return true;
  if (l.length <= 18 && /[\u30A0-\u30FF]/.test(l)) return true;
  return false;
}

function isStylistExperienceLine(line) {
  const l = String(line || '').trim();
  return /【Stylist】|Instagram\s*:|（歴\d+年）/.test(l);
}

function isStylistSpecialtyLine(line) {
  const l = String(line || '').trim();
  if (!l || l.length < 6 || l.length > 220) return false;
  if (isStylistExperienceLine(l)) return false;
  if (/指名して予約|空席確認|ブックマーク|Instagram|【Stylist】/.test(l)) return false;
  if (/^メニュー|^クーポン|^スタイリスト一覧|^サロン|^HOT\s*PEPPER/i.test(l)) return false;
  return true;
}

const STAFF_CATCH_RESERVE = '指名して予約する';

function extractStaffFromInlineStylistBlocks(text) {
  const raw = String(text || '').replace(/\r/g, '\n');
  const lines = raw.split('\n').map((l) => l.trim());
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const nameCore = parseInlineStylistNameLine(lines[i]);
    if (!nameCore) {
      i += 1;
      continue;
    }
    let j = i + 1;
    while (j < lines.length && lines[j] === '') j += 1;
    while (j < lines.length && isLikelyStylistReadingLine(lines[j], nameCore)) j += 1;
    while (j < lines.length && lines[j] === '') j += 1;
    const expLine = lines[j] || '';
    if (!isStylistExperienceLine(expLine)) {
      i += 1;
      continue;
    }
    j += 1;
    while (j < lines.length && lines[j] === '') j += 1;
    const specLine = lines[j] || '';
    if (!isStylistSpecialtyLine(specLine)) {
      i += 1;
      continue;
    }
    j += 1;
    out.push({
      name: nameCore,
      specialty: specLine,
      experience: expLine,
      catch: STAFF_CATCH_RESERVE,
      reserveUrl: '',
      avatarUrl: '',
      avatarText: '',
    });
    i = j;
  }
  return out;
}

function extractStaffFromPickUpSection(text) {
  const staff = [];
  const section = text.match(/[^\n]{0,120}のPICK UPスタイリスト\s*([\s\S]+?)(?=のCHECKスタイル|のサロンデータ)/);
  if (!section) return staff;

  const lines = section[1].split('\n').map((l) => l.trim()).filter(Boolean);
  let i = 0;
  while (i < lines.length) {
    const name = cleanStaffNameFromLine(lines[i]);
    if (!name) {
      i += 1;
      continue;
    }
    let j = i + 1;
    while (j < lines.length && /^[\u30A0-\u30FF\u3000\s・]+$/.test(lines[j])) j += 1;

    const specRaw = String(lines[j] || '');
    const expInLine = specRaw.match(/（歴\d+年）/);
    let experience = expInLine ? expInLine[0] : '';
    const specialty = specRaw.replace(/（歴\d+年）/g, '').trim();
    j += 1;

    if (!experience && lines[j] && /（歴\d+年）/.test(lines[j])) {
      const em = lines[j].match(/（歴\d+年）/);
      experience = em ? em[0] : '';
      j += 1;
    }

    const catchLine = String(lines[j] || '').trim();
    j += 1;

    staff.push({
      name,
      specialty,
      experience,
      catch: catchLine || STAFF_CATCH_RESERVE,
      avatarUrl: '',
      avatarText: '',
      reserveUrl: '',
    });
    i = j;
  }
  return staff;
}

function extractStaff(text) {
  const pickUp = extractStaffFromPickUpSection(text);
  const inline = extractStaffFromInlineStylistBlocks(text);
  const seen = new Set(pickUp.map((s) => String(s.name || '').trim()));
  const out = [...pickUp];
  for (const s of inline) {
    const n = String(s.name || '').trim();
    if (n && !seen.has(n)) {
      seen.add(n);
      out.push(s);
    }
  }
  return out.slice(0, 8);
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

/** 住所のみから Google マップ検索 URL（api=1） */
export function buildGoogleMapsSearchUrl(address) {
  const q = String(address || '').trim();
  if (!q || q.length > 400) return '';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

/** 貼り付け本文から地図短縮 URL / Google Maps を拾う（募集 URL 等は除外） */
function extractEmbeddedMapsUrl(text) {
  const t = String(text || '');
  const candidates = [];
  const reList = [
    /https?:\/\/maps\.app\.goo\.gl\/[a-zA-Z0-9_-]+/gi,
    /https?:\/\/goo\.gl\/maps\/[a-zA-Z0-9_-]+/gi,
    /https?:\/\/www\.google\.(?:com|co\.jp)\/maps[^\s"'<>)]{0,900}/gi,
  ];
  for (const re of reList) {
    let m;
    while ((m = re.exec(t)) !== null) {
      if (m[0]) candidates.push(m[0]);
    }
  }
  if (!candidates.length) return '';
  const pick = candidates.sort((a, b) => b.length - a.length)[0];
  return String(pick).replace(/[),.;]+$/, '');
}

/** ホットペッパー「スタッフ募集」行の URL */
function extractStaffRecruit(text) {
  const t = String(text || '');
  const m =
    t.match(/スタッフ募集\s*(?:\n|\t)+\s*(https?:\/\/\S+)/i) ||
    t.match(/スタッフ募集[^\S\n]*\n[^\S\n]*(https?:\/\/\S+)/i) ||
    t.match(/スタッフ募集[^\n]*?(https?:\/\/\S+)/i);
  if (!m) return { url: '', label: '' };
  let url = String(m[1] || '').trim().replace(/[）)。\],.;]+$/u, '');
  if (!/^https?:\/\//i.test(url)) return { url: '', label: '' };
  return { url, label: 'スタッフ募集' };
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
  const recruit = extractStaffRecruit(rawTextIn);
  if (recruit.url) {
    salon.staffRecruitUrl = recruit.url;
    salon.staffRecruitLabel = recruit.label || 'スタッフ募集';
  }

  const embeddedMap = extractEmbeddedMapsUrl(rawTextIn) || extractEmbeddedMapsUrl(rawText);
  salon.addressMapUrl = embeddedMap || '';
  if (!String(salon.addressMapUrl || '').trim() && salon.address) {
    salon.addressMapUrl = buildGoogleMapsSearchUrl(salon.address);
  }

  salon.accessShort = extractAccessShort(rawLines);
  salon.accessFull = extractAccessFull(rawText);
  salon.heroCatch = extractHeroCatch(cleanedLines);
  salon.introText = truncateSalonIntroBeforeReserveCta(extractIntroText(rawText));

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

  /** 店名だけは必ず埋める（呼び出し側で紹介文を上書きする場合もある） */
  const rawInTrim = String(rawTextIn || '').trim();
  if (!String(salon.name || '').trim() && rawInTrim.length > 2) {
    salon.name = SALON_NAME_PLACEHOLDER;
  }

  return salon;
}

/** ①のテキストを必ず②・③に載せるための統合（美容室テンプレ管理画面用） */
function pickDefaultImportName(raw) {
  const lines = String(raw).split('\n');
  for (let i = 0; i < Math.min(lines.length, 400); i++) {
    const L = lines[i].trim();
    if (L.length > 0) return L.slice(0, 80);
  }
  return '';
}

/**
 * 「...【紹介文】」のように末尾ラベル付きで貼られた場合、
 * ラベル直前の本文を該当フィールド値として切り出す。
 */
function extractBodyBeforeBracketLabel(text, label) {
  const s = String(text || '');
  const m = s.match(new RegExp(`([\\s\\S]*?)【\\s*${label}\\s*】`));
  if (!m) return null;
  const v = String(m[1] || '').trim();
  return v || null;
}

export function buildSalonForAdminImport(rawTextIn) {
  try {
    const norm = String(rawTextIn == null ? '' : rawTextIn)
      .replace(/^\uFEFF/, '')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .trim();
    const body = truncateSalonIntroBeforeReserveCta(norm.slice(0, 50000));

    let parsed;
    try {
      parsed = parseHotpepper(rawTextIn);
    } catch {
      parsed = createEmptySalon();
    }
    let salon;
    try {
      salon = JSON.parse(JSON.stringify(parsed));
    } catch {
      salon = createEmptySalon();
    }
    const introFromLabel = extractBodyBeforeBracketLabel(body, '紹介文');
    salon.introText = introFromLabel != null ? introFromLabel : body;

    const pn = String(parsed.name || '').trim();
    const fallback = pickDefaultImportName(norm);
    if (pn && pn !== SALON_NAME_PLACEHOLDER) {
      salon.name = pn.slice(0, 80);
    } else if (fallback) {
      salon.name = fallback;
    } else {
      salon.name = SALON_NAME_PLACEHOLDER;
    }
    if (!String(salon.name || '').trim()) salon.name = SALON_NAME_PLACEHOLDER;

    return salon;
  } catch (e) {
    console.error('buildSalonForAdminImport', e);
    const s = createEmptySalon();
    const t = truncateSalonIntroBeforeReserveCta(
      String(rawTextIn == null ? '' : rawTextIn)
        .replace(/^\uFEFF/, '')
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .trim()
        .slice(0, 50000),
    );
    s.introText = t;
    s.name = pickDefaultImportName(t) || SALON_NAME_PLACEHOLDER;
    return s;
  }
}
