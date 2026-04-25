import { randomBytes } from 'node:crypto';
import { makeWorkerDashboardId } from './dashboardFromWorkerDraft.js';

const EMPTY_SIGNALS = {
  placeId: null,
  mapsUrl: null,
  rating: null,
  userRatingsTotal: null,
  hasOpeningHours: false,
  hasPhoto: false,
  needsVerification: false,
};

/**
 * メモリード取込で「ウェブ強・制作不可」と判定した美容室を送付管理に載せるための最小ダッシュボード行。
 * status email_sent + no_outreach_channel は既存の seven フェーズ UI と整合。
 */
export function buildStrongWebSalonDashboardRow({ shopName, accessText, sourceSnippet }) {
  const name = String(shopName || '').trim().slice(0, 200) || '（無題）';
  const address = String(accessText || '').trim().slice(0, 500);
  const notes = `[HPB取込] ウェブあり（強）→SNSなし・ウェブページ制作不可\n${String(sourceSnippet || '').trim()}`.trim().slice(0, 5000);
  const id = makeWorkerDashboardId();
  const content = {
    siteName: name,
    title: name,
    headline: name,
    subheadline: 'ホットペッパー等から取込（LP未作成・手動登録）',
    sections: [],
    footerText: '',
  };
  const seo = {
    metaTitle: name.slice(0, 120),
    metaDescription: '',
    keywords: '',
    ogImageUrl: '',
    canonicalUrl: '',
  };
  return {
    id,
    researched: {
      queueId: `hpb-intake-${id}`,
      name,
      address,
      concept: 'ホットペッパー等から取込（ウェブ強・制作不可）',
      strengths: '',
      imageColorStyleId: 'modern',
      category: 'hair_salon',
      notes,
      signals: { ...EMPTY_SIGNALS },
    },
    content,
    seo,
    templateId: 'modern',
    dmBody: '',
    status: 'email_sent',
    outreachPhase: 'no_outreach_channel',
    createdAt: new Date().toISOString(),
    unsubscribeToken: randomBytes(24).toString('hex'),
  };
}

/**
 * メモリード（美容）1件を送付・フェーズ管理のダッシュボード行へ昇格する。
 * uiPhase はフロントの 7 フェーズキー（before_send / message_sent / … / lost）。
 */
export function buildBeautyMemoPromotedDashboardRow({ shopName, accessText, memoSnippet, uiPhase }) {
  const name = String(shopName || '').trim().slice(0, 200) || '（無題）';
  const address = String(accessText || '').trim().slice(0, 500);
  const snippet = String(memoSnippet || '').trim().slice(0, 11000);
  const notes = `[メモリード→送付管理] 初期フェーズ: ${String(uiPhase || '').trim()}\n${snippet}`.trim().slice(0, 5000);
  const id = makeWorkerDashboardId();
  const content = {
    siteName: name,
    title: name,
    headline: name,
    subheadline: 'メモリードから移行（LP未作成の場合は店舗ドラフトで作成）',
    sections: [],
    footerText: '',
  };
  const seo = {
    metaTitle: name.slice(0, 120),
    metaDescription: '',
    keywords: '',
    ogImageUrl: '',
    canonicalUrl: '',
  };

  let status = 'approved';
  let outreachPhase = 'pre_contact';
  /** @type {string | undefined} */
  let replyWaitStartedAt;

  if (uiPhase === 'before_send') {
    status = 'approved';
    outreachPhase = 'pre_contact';
  } else if (uiPhase === 'lost') {
    status = 'rejected';
    outreachPhase = undefined;
  } else {
    const postMap = {
      message_sent: 'message_sent',
      resend_wait: 'resend_wait',
      resend_sent: 'resend_sent',
      resend_unavailable: 'resend_unavailable',
      no_outreach_channel: 'no_outreach_channel',
      hearing: 'hearing',
      proposal: 'proposal',
      contracted: 'contracted',
    };
    const ph = postMap[uiPhase];
    if (!ph) {
      status = 'approved';
      outreachPhase = 'pre_contact';
    } else {
      status = 'email_sent';
      outreachPhase = ph;
      if (uiPhase === 'proposal') {
        replyWaitStartedAt = new Date().toISOString();
      }
    }
  }

  const row = {
    id,
    researched: {
      queueId: `memo-promote-${id}`,
      name,
      address,
      concept: 'メモリードからの移行案件',
      strengths: '',
      imageColorStyleId: 'modern',
      category: 'hair_salon',
      notes,
      signals: { ...EMPTY_SIGNALS },
    },
    content,
    seo,
    templateId: 'modern',
    dmBody: '',
    status,
    outreachPhase,
    outreachPhaseChangedAt: outreachPhase ? new Date().toISOString() : undefined,
    createdAt: new Date().toISOString(),
    unsubscribeToken: randomBytes(24).toString('hex'),
  };
  if (replyWaitStartedAt) row.replyWaitStartedAt = replyWaitStartedAt;
  return row;
}
