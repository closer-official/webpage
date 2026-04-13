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
