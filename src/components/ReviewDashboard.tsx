import { useCallback, useState } from 'react';
import type { DashboardItem } from '../types';
import { TEMPLATES } from '../lib/templates';
import { buildHtml } from '../lib/buildHtml';
import { updateDashboardStatus, updateDashboardItem } from '../lib/queueStorage';
import { api, isApiAvailable, getPreviewPublicUrl } from '../lib/api';
import type { DashboardItem as DItem } from '../types';

type DashboardItemAny = DashboardItem & { contentVariants?: { templateId: string; html: string }[] };

interface ReviewDashboardProps {
  items: DashboardItemAny[];
  onRefresh: () => void;
  useApi?: boolean;
}

export function ReviewDashboard({ items, onRefresh, useApi }: ReviewDashboardProps) {
  const [variantIndex, setVariantIndex] = useState<Record<string, number>>({});

  const handleStatus = useCallback(
    (id: string, status: DashboardItem['status']) => {
      if (useApi && isApiAvailable()) {
        if (status === 'approved') api.approve(id).then(() => onRefresh());
        else api.reject(id).then(() => onRefresh());
      } else {
        updateDashboardStatus(id, status);
        onRefresh();
      }
    },
    [onRefresh, useApi]
  );

  const handleDmChange = useCallback(
    (id: string, dmBody: string) => {
      if (useApi && isApiAvailable()) {
        api.updateDashboardDm(id, dmBody).then(() => onRefresh());
      } else {
        updateDashboardItem(id, { dmBody });
        onRefresh();
      }
    },
    [onRefresh, useApi]
  );

  const handleCopyDm = useCallback((text: string) => {
    if (!text.trim()) return;
    navigator.clipboard.writeText(text);
  }, []);

  const handleMarkEmailSent = useCallback(
    (id: string) => {
      if (useApi && isApiAvailable()) {
        api.markEmailSent(id).then(() => onRefresh());
      } else {
        updateDashboardStatus(id, 'email_sent' as DItem['status']);
        onRefresh();
      }
    },
    [onRefresh, useApi]
  );

  const handleMailto = useCallback((dmBody: string, shopName: string) => {
    const subject = encodeURIComponent(`${shopName} 様へ — ウェブページのご提案`);
    const body = encodeURIComponent(dmBody);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  }, []);

  /** 生成されたLPのHTMLを別タブで開く（確認用） */
  const handleOpenPreviewInNewTab = useCallback((html: string) => {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }, []);

  const pending = items.filter((i) => i.status === 'pending');
  const approved = items.filter((i) => i.status === 'approved');
  const emailSent = items.filter((i) => i.status === 'email_sent');

  const renderCard = (item: DashboardItemAny, showApproveActions: boolean, showEmailActions: boolean) => {
    const variants = item.contentVariants && item.contentVariants.length > 0 ? item.contentVariants : null;
    const currentVariant = variantIndex[item.id] ?? 0;
    const html = variants
      ? variants[currentVariant]?.html ?? variants[0].html
      : (() => {
          const template = TEMPLATES.find((t) => t.id === item.templateId) ?? TEMPLATES[0];
          return buildHtml(item.content, item.seo, template);
        })();
    const s = item.researched.signals;
    return (
      <div key={item.id} className="review-card">
                <div className="review-col review-left">
                  <h4>店舗情報（実在確認用）</h4>
                  <p className="shop-name">{item.researched.name}</p>
                  <p className="shop-address">{item.researched.address}</p>
                  {s.mapsUrl && (
                    <a href={s.mapsUrl} target="_blank" rel="noopener noreferrer" className="link-maps">
                      Google Maps で確認
                    </a>
                  )}
                  <div className="signals">
                    {s.userRatingsTotal != null && (
                      <span>レビュー {s.userRatingsTotal} 件</span>
                    )}
                    {s.rating != null && <span>{s.rating}★</span>}
                    {s.hasOpeningHours && <span>営業時間あり</span>}
                    {s.hasPhoto && <span>写真あり</span>}
                    {s.needsVerification && <span className="badge-warn">要確認</span>}
                  </div>
                </div>
                <div className="review-col review-center">
                  <h4>LPプレビュー</h4>
                  {variants && variants.length > 1 && (
                    <select
                      className="variant-select"
                      value={currentVariant}
                      onChange={(e) =>
                        setVariantIndex((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))
                      }
                    >
                      {variants.map((v, idx) => (
                        <option key={v.templateId} value={idx}>
                          案{idx + 1}（{v.templateId}）
                        </option>
                      ))}
                    </select>
                  )}
                  <button
                    type="button"
                    className="small"
                    onClick={() => handleOpenPreviewInNewTab(html)}
                    style={{ marginBottom: 8 }}
                  >
                    このページを別タブで開く
                  </button>
                  {useApi && isApiAvailable() && (
                    <div className="review-share-url" style={{ marginBottom: 12 }}>
                      <label className="label-text" style={{ display: 'block', marginBottom: 4 }}>
                        共有用URL（スマホ・他端末で開けます）
                      </label>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <input
                          type="text"
                          readOnly
                          value={getPreviewPublicUrl(item.id)}
                          className="small"
                          style={{ flex: '1 1 200px', minWidth: 0, fontSize: '0.8rem' }}
                        />
                        <button
                          type="button"
                          className="small"
                          onClick={() => {
                            navigator.clipboard.writeText(getPreviewPublicUrl(item.id));
                          }}
                        >
                          コピー
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="review-preview-wrap">
                    <iframe
                      title={`Preview ${item.researched.name}`}
                      srcDoc={html}
                      className="review-preview-iframe"
                      sandbox="allow-same-origin"
                    />
                  </div>
                </div>
                <div className="review-col review-right">
                  <h4>DM文面</h4>
                  <textarea
                    className="dm-textarea"
                    value={item.dmBody}
                    onChange={(e) => handleDmChange(item.id, e.target.value)}
                    placeholder="DM文面を入力（手動で追記するか、別途生成してください）"
                    rows={8}
                  />
                  <button
                    type="button"
                    className="small"
                    onClick={() => handleCopyDm(item.dmBody)}
                    disabled={!item.dmBody.trim()}
                  >
                    コピー
                  </button>
                  {showEmailActions && (
                    <>
                      <button
                        type="button"
                        className="small primary"
                        onClick={() => handleMailto(item.dmBody, item.researched.name)}
                        disabled={!item.dmBody.trim()}
                      >
                        メール送信（mailto）
                      </button>
                      <button type="button" className="small" onClick={() => handleMarkEmailSent(item.id)}>
                        送信済み
                      </button>
                    </>
                  )}
                  {showApproveActions && (
                    <div className="review-actions">
                      <button type="button" className="primary" onClick={() => handleStatus(item.id, 'approved')}>
                        OK
                      </button>
                      <button type="button" className="danger" onClick={() => handleStatus(item.id, 'rejected')}>
                        NG
                      </button>
                    </div>
                  )}
                </div>
              </div>
    );
  };

  return (
    <div className="panel review-dashboard">
      <h2>検閲ダッシュボード</h2>
      <p className="hint">
        左で店舗を実在確認し、中央でLPを確認（3案の場合は切り替え可）、右でDM文面を確認してください。OK → メール送信 → 送信済み の順で操作します。
        <strong>実在確認のため、必ず Google Maps のリンクから店舗をご確認ください。</strong>
      </p>
      {pending.length === 0 && approved.length === 0 && emailSent.length === 0 ? (
        <p className="empty">レビュー待ちの案件はありません。</p>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="review-list">
              <h3>レビュー待ち</h3>
              {pending.map((item) => renderCard(item, true, false))}
            </div>
          )}
          {approved.length > 0 && (
            <div className="review-list">
              <h3>OK済み — メール送信と確認</h3>
              {approved.map((item) => renderCard(item, false, true))}
            </div>
          )}
          {emailSent.length > 0 && (
            <div className="review-list review-list-sent">
              <h3>送信済み</h3>
              {emailSent.map((item) => renderCard(item, false, false))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
