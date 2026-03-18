import { useState, useCallback, useEffect } from 'react';
import type { QueueTarget, ResearchedShop, StyleId } from '../types';
import { STYLES } from '../types';
import { TEMPLATES } from '../lib/templates';
import { researchToShowcasePageContent, researchToShowcaseSeo } from '../lib/researchToPage';
import { inferStyleIdFromQueueTarget } from '../lib/inferTemplateFromSearch';
import { addToDashboard, removeFromQueue } from '../lib/queueStorage';

interface ResearchFormProps {
  target: QueueTarget;
  onClose: () => void;
  onDone: () => void;
}

export function ResearchForm({ target, onClose, onDone }: ResearchFormProps) {
  const [concept, setConcept] = useState('');
  const [strengths, setStrengths] = useState('');
  const [imageColorStyleId, setImageColorStyleId] = useState<StyleId>(() =>
    inferStyleIdFromQueueTarget(target)
  );

  useEffect(() => {
    setImageColorStyleId(inferStyleIdFromQueueTarget(target));
  }, [target.id, target.searchQuery, target.category]);

  const inferredLabel = STYLES.find((s) => s.id === inferStyleIdFromQueueTarget(target))?.name ?? '';

  const handleCreate = useCallback(() => {
    const researched: ResearchedShop = {
      queueId: target.id,
      name: target.name,
      address: target.address,
      concept: concept.trim(),
      strengths: strengths.trim(),
      imageColorStyleId,
      category: target.category,
      notes: target.notes,
      signals: target.signals,
    };
    const content = researchToShowcasePageContent(researched);
    const seo = researchToShowcaseSeo(researched, content);
    const template = TEMPLATES.find((t) => t.styleId === imageColorStyleId) ?? TEMPLATES[0];
    addToDashboard({
      researched,
      content,
      seo,
      templateId: template.id,
      dmBody: '',
      status: 'pending',
    });
    removeFromQueue(target.id);
    onDone();
    onClose();
  }, [target, concept, strengths, imageColorStyleId, onDone, onClose]);

  return (
    <div className="research-overlay" role="dialog" aria-modal="true">
      <div className="research-modal">
        <div className="research-header">
          <h2>調査：{target.name}</h2>
          <button type="button" className="close-btn" onClick={onClose} aria-label="閉じる">
            ×
          </button>
        </div>
        <div className="research-body">
          <div className="research-place">
            <h3>店舗情報（実在確認用）</h3>
            <p><strong>{target.name}</strong></p>
            {target.address && <p className="address">{target.address}</p>}
            {target.signals.mapsUrl && (
              <a href={target.signals.mapsUrl} target="_blank" rel="noopener noreferrer" className="link-maps">
                Google Maps で確認
              </a>
            )}
            {target.signals.userRatingsTotal != null && (
              <p className="signals">
                レビュー {target.signals.userRatingsTotal} 件
                {target.signals.rating != null && ` · ${target.signals.rating}★`}
                {target.signals.needsVerification && (
                  <span className="badge-warn">要確認</span>
                )}
              </p>
            )}
            {target.source === 'manual' && (
              <p className="hint">手動追加のため、実在はダッシュボードでご確認ください。</p>
            )}
          </div>
          <div className="research-fields">
            <h3>LP用の内容（AIは使わず、ここで入力）</h3>
            <div className="field">
              <label>コンセプト</label>
              <textarea
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="店のコンセプトや雰囲気"
                rows={3}
              />
            </div>
            <div className="field">
              <label>強み</label>
              <textarea
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                placeholder="強み・おすすめポイント"
                rows={3}
              />
            </div>
            <div className="field">
              <label>テンプレート（検索条件で自動選択・変更可）</label>
              <p className="hint" style={{ margin: '0 0 8px' }}>
                検索・業種からの推奨: <strong>{inferredLabel}</strong>
                {target.searchQuery ? `（検索: 「${target.searchQuery}」）` : ''}
              </p>
              <select
                value={imageColorStyleId}
                onChange={(e) => setImageColorStyleId(e.target.value as StyleId)}
              >
                {STYLES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <p className="hint" style={{ marginTop: 8 }}>
                LP は選択中テンプレの完成例レイアウトのまま、店名・コンセプト・強み・アクセスだけ差し替わります。
              </p>
            </div>
          </div>
        </div>
        <div className="research-footer">
          <button type="button" className="secondary" onClick={onClose}>
            キャンセル
          </button>
          <button type="button" className="primary" onClick={handleCreate}>
            LP作成してダッシュボードへ
          </button>
        </div>
      </div>
    </div>
  );
}
