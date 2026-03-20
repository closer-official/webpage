import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PageContent, SEOData, StyleOverrides } from '../types';
import { TEMPLATES } from '../lib/templates';
import { buildHtml } from '../lib/buildHtml';
import { api, isApiAvailable } from '../lib/api';
import { updateDashboardItem, duplicateDashboardItem } from '../lib/queueStorage';
import {
  injectPreviewEditCss,
  injectEditModeOutline,
  markPreviewElements,
  peLabelJa,
  parseRgb,
  buildPeCssRule,
  upsertPeCssRule,
} from '../lib/previewEditMarkers';
import {
  applyTextPe,
  applyImagePe,
  applyHeroBgUrl,
  getTextFromPe,
  getImageUrlFromPe,
  getHeroBgUrl,
  isTextPe,
  isImagePe,
  isHeroPe,
} from '../lib/previewContentBridge';

type HistorySnap = { content: PageContent; seo: SEOData; css: string };

function findPeElement(doc: Document, pe: string): HTMLElement | null {
  const nodes = doc.querySelectorAll('[data-pe]');
  for (let i = 0; i < nodes.length; i++) {
    const el = nodes[i];
    if (el.getAttribute('data-pe') === pe) return el as HTMLElement;
  }
  return null;
}

interface ReviewPreviewEditorProps {
  itemId: string;
  content: PageContent;
  seo: SEOData;
  templateId: string;
  previewEditCss?: string;
  contentVariants?: { templateId: string; html: string }[];
  variantIndex: number;
  useApi?: boolean;
  styleOverrides?: StyleOverrides;
  onSaved: () => void;
}

export function ReviewPreviewEditor({
  itemId,
  content: initialContent,
  seo: initialSeo,
  templateId: baseTemplateId,
  previewEditCss: initialCss,
  contentVariants,
  variantIndex,
  useApi,
  styleOverrides,
  onSaved,
}: ReviewPreviewEditorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [editing, setEditing] = useState(false);
  const [draftContent, setDraftContent] = useState<PageContent>(initialContent);
  const [draftSeo, setDraftSeo] = useState<SEOData>(initialSeo);
  const [draftCss, setDraftCss] = useState(initialCss || '');
  const [selectedPe, setSelectedPe] = useState<string | null>(null);
  const [textDraft, setTextDraft] = useState('');
  const [urlDraft, setUrlDraft] = useState('');
  const [rgb, setRgb] = useState({ r: 30, g: 41, b: 59 });
  const [fontSizePx, setFontSizePx] = useState(32);
  const [historyCount, setHistoryCount] = useState(0);
  const historyRef = useRef<HistorySnap[]>([]);
  const baselineRef = useRef<HistorySnap | null>(null);
  const clickCleanupRef = useRef<(() => void) | null>(null);

  const effectiveTemplateId = contentVariants?.length
    ? contentVariants[variantIndex]?.templateId || baseTemplateId
    : baseTemplateId;

  const template = useMemo(
    () => TEMPLATES.find((t) => t.id === effectiveTemplateId) ?? TEMPLATES[0],
    [effectiveTemplateId]
  );

  const genOpts = useMemo(
    () => ({ genOptions: { styleOverrides } }),
    [styleOverrides]
  );

  const builtHtml = useMemo(
    () => buildHtml(draftContent, draftSeo, template, genOpts),
    [draftContent, draftSeo, template, genOpts]
  );

  const srcDoc = useMemo(() => {
    let h = builtHtml;
    h = injectPreviewEditCss(h, draftCss);
    h = injectEditModeOutline(h, editing);
    return h;
  }, [builtHtml, draftCss, editing]);

  const pushHistory = useCallback(() => {
    const snap: HistorySnap = {
      content: JSON.parse(JSON.stringify(draftContent)),
      seo: JSON.parse(JSON.stringify(draftSeo)),
      css: draftCss,
    };
    historyRef.current.push(snap);
    if (historyRef.current.length > 40) historyRef.current.shift();
    setHistoryCount(historyRef.current.length);
  }, [draftContent, draftSeo, draftCss]);

  const syncIframeMarkers = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument || !editing) return;
    const doc = iframe.contentDocument;
    doc.body.classList.add('pe-edit-mode');
    markPreviewElements(doc);
  }, [editing]);

  const attachIframeClick = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument || !editing) return;
    const doc = iframe.contentDocument;
    const handler = (e: Event) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const el = t.closest('[data-pe]') as HTMLElement | null;
      if (!el) return;
      e.preventDefault();
      e.stopPropagation();
      doc.querySelectorAll('[data-pe-selected]').forEach((n) => n.removeAttribute('data-pe-selected'));
      el.setAttribute('data-pe-selected', '1');
      const pe = el.getAttribute('data-pe');
      if (pe) setSelectedPe(pe);
    };
    doc.body.addEventListener('click', handler, true);
    clickCleanupRef.current = () => doc.body.removeEventListener('click', handler, true);
  }, [editing]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    iframe.srcdoc = srcDoc;
  }, [srcDoc]);

  useEffect(() => {
    const onLoad = () => {
      if (!editing) {
        clickCleanupRef.current?.();
        clickCleanupRef.current = null;
        return;
      }
      syncIframeMarkers();
      attachIframeClick();
    };
    const iframe = iframeRef.current;
    iframe?.addEventListener('load', onLoad);
    return () => iframe?.removeEventListener('load', onLoad);
  }, [srcDoc, editing, syncIframeMarkers, attachIframeClick]);

  useEffect(() => {
    return () => {
      clickCleanupRef.current?.();
    };
  }, []);

  useEffect(() => {
    if (!editing) {
      setDraftContent(initialContent);
      setDraftSeo(initialSeo);
      setDraftCss(initialCss || '');
    }
  }, [initialContent, initialSeo, initialCss, editing]);

  useEffect(() => {
    if (!selectedPe || !iframeRef.current?.contentDocument) return;
    const doc = iframeRef.current.contentDocument;
    const el = findPeElement(doc, selectedPe);
    if (!el) return;
    if (isTextPe(selectedPe)) {
      const cs = doc.defaultView?.getComputedStyle(el);
      if (cs?.color) setRgb(parseRgb(cs.color));
      const fs = parseFloat(cs?.fontSize || '16');
      if (!Number.isNaN(fs)) setFontSizePx(Math.round(fs));
      setTextDraft(getTextFromPe(draftContent, selectedPe));
    }
    if (isImagePe(selectedPe)) {
      setUrlDraft(getImageUrlFromPe(draftContent, selectedPe));
    }
    if (isHeroPe(selectedPe)) {
      setUrlDraft(getHeroBgUrl(draftContent));
    }
  }, [selectedPe, draftContent]);

  const duplicateForPersonal = useCallback(async () => {
    const label = window.prompt(
      '個別案用のメモ（例: A社向け・〇〇様向け）。空のままでも複製できます。',
      ''
    );
    if (label === null) return;
    try {
      if (useApi && isApiAvailable()) {
        await api.duplicateDashboardItem(itemId, { personalizationLabel: label.trim() });
      } else {
        duplicateDashboardItem(itemId, label.trim());
      }
      onSaved();
      window.alert(
        '一覧の先頭に「個別用の複製」を追加しました。元の案件はそのままです。「プレビューを編集」で本文・色を調整してください。'
      );
    } catch (e) {
      window.alert(e instanceof Error ? e.message : '複製に失敗しました');
    }
  }, [itemId, useApi, onSaved]);

  const startEdit = useCallback(() => {
    setDraftContent(JSON.parse(JSON.stringify(initialContent)));
    setDraftSeo(JSON.parse(JSON.stringify(initialSeo)));
    setDraftCss(initialCss || '');
    baselineRef.current = {
      content: JSON.parse(JSON.stringify(initialContent)),
      seo: JSON.parse(JSON.stringify(initialSeo)),
      css: initialCss || '',
    };
    historyRef.current = [];
    setHistoryCount(0);
    setSelectedPe(null);
    setEditing(true);
  }, [initialContent, initialSeo, initialCss]);

  const cancelEdit = useCallback(() => {
    const b = baselineRef.current;
    if (b) {
      setDraftContent(b.content);
      setDraftSeo(b.seo);
      setDraftCss(b.css);
    }
    setSelectedPe(null);
    setEditing(false);
    historyRef.current = [];
    setHistoryCount(0);
    baselineRef.current = null;
  }, []);

  const undo = useCallback(() => {
    const prev = historyRef.current.pop();
    if (!prev) return;
    setDraftContent(prev.content);
    setDraftSeo(prev.seo);
    setDraftCss(prev.css);
    setHistoryCount(historyRef.current.length);
  }, []);

  const applyColor = useCallback(
    (nextRgb: { r: number; g: number; b: number }) => {
      if (!selectedPe || !isTextPe(selectedPe)) return;
      pushHistory();
      setRgb(nextRgb);
      const color = `rgb(${nextRgb.r}, ${nextRgb.g}, ${nextRgb.b})`;
      const rule = buildPeCssRule(selectedPe, { color, fontSizePx });
      setDraftCss((prev) => upsertPeCssRule(prev, selectedPe, rule.trim()));
    },
    [selectedPe, pushHistory, fontSizePx]
  );

  const applyFontSize = useCallback(
    (px: number) => {
      if (!selectedPe || !isTextPe(selectedPe)) return;
      pushHistory();
      setFontSizePx(px);
      const color = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      const rule = buildPeCssRule(selectedPe, { color, fontSizePx: px });
      setDraftCss((prev) => upsertPeCssRule(prev, selectedPe, rule.trim()));
    },
    [selectedPe, pushHistory, rgb]
  );

  const applyTextCommit = useCallback(() => {
    if (!selectedPe || !isTextPe(selectedPe)) return;
    pushHistory();
    setDraftContent((c) => applyTextPe(c, selectedPe, textDraft));
  }, [selectedPe, textDraft, pushHistory]);

  const applyUrlCommit = useCallback(() => {
    if (!selectedPe) return;
    pushHistory();
    if (isImagePe(selectedPe)) {
      setDraftContent((c) => applyImagePe(c, selectedPe, urlDraft.trim()));
    } else if (isHeroPe(selectedPe)) {
      setDraftContent((c) => applyHeroBgUrl(c, urlDraft.trim()));
    }
  }, [selectedPe, urlDraft, pushHistory]);

  const handleSave = useCallback(async () => {
    const body: Record<string, unknown> = {
      content: draftContent,
      seo: draftSeo,
    };
    const cssTrim = draftCss.trim();
    if (cssTrim) body.previewEditCss = cssTrim;
    else body.previewEditCss = '';

    if (contentVariants?.length) {
      body.contentVariants = contentVariants.map((v) => {
        const tpl = TEMPLATES.find((t) => t.id === v.templateId) ?? TEMPLATES[0];
        let html = buildHtml(draftContent, draftSeo, tpl, genOpts);
        html = injectPreviewEditCss(html, draftCss);
        return { templateId: v.templateId, html };
      });
    }

    if (useApi && isApiAvailable()) {
      await api.patchDashboardItem(itemId, body);
    } else {
      updateDashboardItem(itemId, {
        content: draftContent,
        seo: draftSeo,
        previewEditCss: cssTrim,
        ...(body.contentVariants ? { contentVariants: body.contentVariants as typeof contentVariants } : {}),
      });
    }
    baselineRef.current = {
      content: JSON.parse(JSON.stringify(draftContent)),
      seo: JSON.parse(JSON.stringify(draftSeo)),
      css: draftCss,
    };
    historyRef.current = [];
    setHistoryCount(0);
    setEditing(false);
    setSelectedPe(null);
    onSaved();
  }, [draftContent, draftSeo, draftCss, contentVariants, genOpts, itemId, useApi, onSaved]);

  return (
    <div className="review-preview-editor">
      <div className="review-preview-toolbar">
        {!editing ? (
          <>
            <button type="button" className="small review-edit-start" onClick={startEdit}>
              プレビューを編集
            </button>
            <button
              type="button"
              className="small review-duplicate-personal"
              onClick={duplicateForPersonal}
              title="この案件のコピーを先頭に作り、宛先ごとに文言だけ変える用途向け（元の案件は変更されません）"
            >
              個別用に複製
            </button>
          </>
        ) : (
          <>
            <button type="button" className="small primary" onClick={handleSave}>
              保存（上書き）
            </button>
            <button
              type="button"
              className="small"
              onClick={undo}
              disabled={historyCount === 0}
              title="直前の変更を取り消し"
            >
              一つ前に戻す
            </button>
            <button type="button" className="small" onClick={cancelEdit}>
              編集をやめる
            </button>
          </>
        )}
      </div>
      <p className="review-edit-hint">
        {editing
          ? 'プレビュー内の枠付き要素をクリックして選択。右パネルで色（RGB）・文字サイズ・本文を変更できます。'
          : '「プレビューを編集」＝この案件を直接更新。「個別用に複製」＝コピーを別案件にして A 社向けなどに文言だけ変える（レイアウト変更はテンプレコード側）。'}
      </p>
      <div className="review-preview-editor-body">
        <div className="review-preview-wrap review-preview-wrap--tall">
          <iframe
            ref={iframeRef}
            title="LPプレビュー編集"
            className="review-preview-iframe"
            sandbox="allow-same-origin allow-scripts"
          />
        </div>
        {editing && (
          <aside className="review-preview-edit-panel" aria-label="編集パネル">
            {!selectedPe && <p className="muted">左のプレビューで要素をクリックしてください。</p>}
            {selectedPe && isTextPe(selectedPe) && (
              <>
                <h5 className="review-panel-title">{peLabelJa(selectedPe)}</h5>
                <label className="review-panel-label">
                  本文
                  <textarea
                    className="review-panel-textarea"
                    rows={5}
                    value={textDraft}
                    onChange={(e) => setTextDraft(e.target.value)}
                    onBlur={applyTextCommit}
                  />
                </label>
                <label className="review-panel-label">
                  文字サイズ: {fontSizePx}px
                  <input
                    type="range"
                    min={10}
                    max={96}
                    value={fontSizePx}
                    onChange={(e) => applyFontSize(Number(e.target.value))}
                  />
                </label>
                <div className="review-rgb-sliders">
                  <span className="review-rgb-label">文字色（RGB）</span>
                  <label>
                    R {rgb.r}
                    <input
                      type="range"
                      min={0}
                      max={255}
                      value={rgb.r}
                      onChange={(e) => applyColor({ ...rgb, r: Number(e.target.value) })}
                    />
                  </label>
                  <label>
                    G {rgb.g}
                    <input
                      type="range"
                      min={0}
                      max={255}
                      value={rgb.g}
                      onChange={(e) => applyColor({ ...rgb, g: Number(e.target.value) })}
                    />
                  </label>
                  <label>
                    B {rgb.b}
                    <input
                      type="range"
                      min={0}
                      max={255}
                      value={rgb.b}
                      onChange={(e) => applyColor({ ...rgb, b: Number(e.target.value) })}
                    />
                  </label>
                  <div
                    className="review-color-swatch"
                    style={{ background: `rgb(${rgb.r},${rgb.g},${rgb.b})` }}
                    title="現在の文字色"
                  />
                </div>
              </>
            )}
            {selectedPe && isImagePe(selectedPe) && (
              <>
                <h5 className="review-panel-title">{peLabelJa(selectedPe)}</h5>
                <label className="review-panel-label">
                  画像URL
                  <input
                    type="url"
                    className="review-panel-input"
                    value={urlDraft}
                    onChange={(e) => setUrlDraft(e.target.value)}
                    onBlur={applyUrlCommit}
                    placeholder="https://..."
                  />
                </label>
                <button type="button" className="small" onClick={applyUrlCommit}>
                  反映
                </button>
              </>
            )}
            {selectedPe && isHeroPe(selectedPe) && (
              <>
                <h5 className="review-panel-title">{peLabelJa(selectedPe)}</h5>
                <label className="review-panel-label">
                  背景画像URL（heroSlides 先頭）
                  <input
                    type="url"
                    className="review-panel-input"
                    value={urlDraft}
                    onChange={(e) => setUrlDraft(e.target.value)}
                    onBlur={applyUrlCommit}
                    placeholder="https://..."
                  />
                </label>
                <button type="button" className="small" onClick={applyUrlCommit}>
                  反映
                </button>
              </>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
