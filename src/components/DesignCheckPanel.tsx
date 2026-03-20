import { useCallback, useEffect, useMemo, useState } from 'react';
import { TEMPLATES } from '../lib/templates';
import { buildHtml } from '../lib/buildHtml';
import type { PageContent, SEOData, BuildHtmlGenOptions } from '../types';
import { SHOWCASE_BY_STYLE_ID } from '../data/showcasePresets';
import { api, isApiAvailable, type TemplateCandidate, type DesignBlueprint } from '../lib/api';
import { ReviewPreviewEditor, type ReviewPreviewPersistPayload } from './ReviewPreviewEditor';

const LS_INLINE_PREFIX = 'design-inline-editor-';

function loadInlineDraft(
  mode: 'template' | 'individual',
  baseId: string
): ReviewPreviewPersistPayload | null {
  try {
    const raw = localStorage.getItem(`${LS_INLINE_PREFIX}${mode}-${baseId}`);
    if (!raw) return null;
    const j = JSON.parse(raw) as ReviewPreviewPersistPayload;
    if (j?.content && j?.seo) return { content: j.content, seo: j.seo, previewEditCss: j.previewEditCss || '' };
  } catch {
    /* ignore */
  }
  return null;
}

function saveInlineDraft(mode: 'template' | 'individual', baseId: string, payload: ReviewPreviewPersistPayload) {
  try {
    localStorage.setItem(`${LS_INLINE_PREFIX}${mode}-${baseId}`, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

/** インラインLP編集の初期データ（ショーケース＋テンプレの上書き＋任意で右フォームの値） */
function buildSeedForInlineEditor(
  tpl: TemplateCandidate,
  live?: { headline: string; subheadline: string; navLabels: string }
): ReviewPreviewPersistPayload {
  const baseId = tpl.baseTemplateId || tpl.id;
  const tplDef = TEMPLATES.find((t) => t.id === baseId);
  const sample = tplDef ? SHOWCASE_BY_STYLE_ID[tplDef.styleId] : null;
  const content = JSON.parse(JSON.stringify(sample ? sample.content : SAMPLE_DEFAULT)) as PageContent;
  const seo = JSON.parse(JSON.stringify(sample ? sample.seo : SAMPLE_SEO_DEFAULT)) as SEOData;
  const ov = tpl.customization?.override;
  if (ov?.headline) content.headline = ov.headline;
  if (ov?.subheadline) content.subheadline = ov.subheadline;
  if (ov?.navLabels) {
    const labels = ov.navLabels
      .split(/[,，\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 8);
    if (labels.length) {
      content.navItems = labels.map((label, i) => ({
        label,
        href: i === 0 ? '#concept' : i === 1 ? '#menu' : i === 2 ? '#access' : '#contact',
      }));
    }
  }
  if (live) {
    if (live.headline.trim()) content.headline = live.headline.trim();
    if (live.subheadline.trim()) content.subheadline = live.subheadline.trim();
    const labels = live.navLabels
      .split(/[,，\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 8);
    if (labels.length) {
      content.navItems = labels.map((label, i) => ({
        label,
        href: i === 0 ? '#concept' : i === 1 ? '#menu' : i === 2 ? '#access' : '#contact',
      }));
    }
  }
  return { content, seo, previewEditCss: '' };
}

type InlineSession = {
  mode: 'template' | 'individual';
  tpl: TemplateCandidate;
} & ReviewPreviewPersistPayload;

/** セッション抽出 or 保存済みブループリントを解決（スキンカスタム選択時はブループリントを使わない） */
function resolveActiveBlueprint(sel: TemplateCandidate | undefined, session: DesignBlueprint | null) {
  if (sel?.customization?.blueprint && (sel.customization.blueprint as DesignBlueprint).version === 1) {
    return sel.customization.blueprint as DesignBlueprint;
  }
  if (session?.version !== 1) return null;
  if (sel?.isCustom && sel.baseTemplateId !== 'blueprint') return null;
  return session;
}

/** 完成例プレビュー用オプション（問い合わせフォーム・SNS・QRを表示） */
const SAMPLE_GEN_OPTIONS: BuildHtmlGenOptions = {
  contactForm: true,
  formActionUrl: '#',
  instagramLine: true,
  instagramUrl: 'https://instagram.com/',
  lineUrl: 'https://line.me/',
  qrCode: true,
  qrCodeTargetUrl: 'https://example.com',
};

const SAMPLE_DEFAULT: PageContent = {
  siteName: 'サンプル店舗',
  title: 'サンプル店舗',
  headline: 'サンプル店舗',
  subheadline: '6パターン確認用のプレビューです。実際に作るときは各項目を書き換えて使います。',
  sections: [
    { id: 'concept', title: 'コンセプト', content: 'このテンプレートの雰囲気を確認できます。' },
    { id: 'menu', title: 'メニュー・サービス', content: '実際のLPではメニューやサービス内容が入ります。' },
    { id: 'hours', title: '営業時間', content: '営業時間を記載してください。' },
    { id: 'access', title: 'アクセス', content: '〇〇県〇〇市〇〇 1-2-3' },
    { id: 'price', title: '料金・プラン', content: '料金の詳細があれば記載してください。' },
    { id: 'staff', title: 'スタッフ・私たち', content: 'スタッフ紹介や店の想いを書けます。' },
    { id: 'faq', title: 'よくある質問', content: 'Q&A形式で記載できます。' },
    { id: 'gallery', title: 'ギャラリー', content: '写真で雰囲気を伝えられます。' },
    { id: 'contact', title: 'お問い合わせ', content: 'お問い合わせ方法を記載してください。' },
  ],
  footerText: '© 2025 サンプル店舗. All rights reserved.',
};

const SAMPLE_SEO_DEFAULT: SEOData = {
  metaTitle: 'サンプル店舗 | 6パターン確認',
  metaDescription: 'デザインテンプレートの確認用プレビューです。',
  keywords: 'サンプル, 確認用',
  ogImageUrl: '',
  canonicalUrl: '',
};

const PREVIEW_BG: Record<string, string> = {
  salon_barber: '#fff',
  cafe_tea: '#f2efe8',
  clinic_chiropractic: '#F9F9F7',
  gym_yoga: '#121212',
  builder: '#fff',
  professional: '#e8f0fa',
  cram_school: '#F9F9F7',
  izakaya: '#F9F9F7',
  pet_salon: '#E8F4F1',
  apparel: '#F9F9F7',
  event: '#F9F9F7',
  ramen: '#f8eeee',
};

const PREVIEW_COLOR: Record<string, string> = {
  salon_barber: '#1a1a1a',
  cafe_tea: '#3d5245',
  clinic_chiropractic: '#1A1A1A',
  gym_yoga: '#FF3B30',
  builder: '#1A1A1A',
  professional: '#1a2744',
  cram_school: '#1A1A1A',
  izakaya: '#1A1A1A',
  pet_salon: '#4a8f82',
  apparel: '#1A1A1A',
  event: '#1A1A1A',
  ramen: '#8B2E2E',
  blueprint: '#f4f4f1',
};

export interface DesignCheckPanelProps {
  /** 案件LPのクリック編集へ誘導（ダッシュボードタブへ切り替え） */
  onGoDashboard?: () => void;
}

export function DesignCheckPanel({ onGoDashboard }: DesignCheckPanelProps = {}) {
  const [candidates, setCandidates] = useState<TemplateCandidate[]>([]);
  const [selectedId, setSelectedId] = useState<string>(TEMPLATES[0]?.id || 'salon_barber');
  const [name, setName] = useState('');
  const [headline, setHeadline] = useState('');
  const [subheadline, setSubheadline] = useState('');
  const [navLabels, setNavLabels] = useState('');
  const [bg, setBg] = useState('');
  const [text, setText] = useState('');
  const [accent, setAccent] = useState('');
  const [refUrl, setRefUrl] = useState('');
  /** 参考URLから抽出した新規設計ブループリント（既存業種テンプレには載せない） */
  const [referenceBlueprint, setReferenceBlueprint] = useState<DesignBlueprint | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  /** テンプレ／個別のLPクリック編集（ダッシュボードを経由しない） */
  const [inlineOpen, setInlineOpen] = useState(false);
  const [inlineSession, setInlineSession] = useState<InlineSession | null>(null);

  useEffect(() => {
    if (!isApiAvailable()) return;
    api
      .getTemplateCandidates()
      .then((list) => {
        setCandidates(list || []);
        if (list?.[0]?.id) setSelectedId(list[0].id);
      })
      .catch(() => {
        setCandidates(TEMPLATES.map((t) => ({ id: t.id, name: t.name, baseTemplateId: t.id, isCustom: false })));
      });
  }, []);

  const resolvedCandidates = useMemo(
    () =>
      candidates.length
        ? candidates
        : TEMPLATES.map((t) => ({ id: t.id, name: t.name, baseTemplateId: t.id, isCustom: false } as TemplateCandidate)),
    [candidates]
  );

  const selected = useMemo(
    () => resolvedCandidates.find((c) => c.id === selectedId) || resolvedCandidates[0],
    [resolvedCandidates, selectedId]
  );

  const selectedIsDraft = Boolean(
    selected?.isCustom && (selected.status === 'draft' || selected.customization?.status === 'draft')
  );

  const activeBlueprint = useMemo(
    () => resolveActiveBlueprint(selected, referenceBlueprint),
    [selected, referenceBlueprint]
  );

  useEffect(() => {
    if (!selected) return;
    setName(selected.name || '');
    const ov = selected.customization?.override;
    setHeadline(ov?.headline || '');
    setSubheadline(ov?.subheadline || '');
    setNavLabels(ov?.navLabels || '');
    setBg(ov?.theme?.bg || '');
    setText(ov?.theme?.text || '');
    setAccent(ov?.theme?.accent || '');
    setRefUrl(selected.customization?.sourceUrl || '');
    if (selected.customization?.blueprint) {
      setReferenceBlueprint(selected.customization.blueprint as DesignBlueprint);
    }
    setMsg(null);
    setErr(null);
  }, [selected?.id, selected?.customization?.blueprint]);

  const makeThemeCss = useCallback((templateId: string, theme: { bg?: string; text?: string; accent?: string }) => {
    const b = (theme.bg || '').trim();
    const t = (theme.text || '').trim();
    const a = (theme.accent || '').trim();
    if (!b && !t && !a) return '';
    return `.page-wrapper.template-${templateId}{${b ? `--tp-bg:${b};` : ''}${t ? `--tp-text:${t};--tp-heading:${t};` : ''}${a ? `--tp-accent:${a};` : ''}}`;
  }, []);

  const applyOverrides = useCallback(
    (content: PageContent) => {
      const out: PageContent = { ...content };
      if (headline.trim()) out.headline = headline.trim();
      if (subheadline.trim()) out.subheadline = subheadline.trim();
      const labels = navLabels
        .split(/[,，\n]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 8);
      if (labels.length) {
        out.navItems = labels.map((label, i) => ({
          label,
          href: i === 0 ? '#concept' : i === 1 ? '#menu' : i === 2 ? '#access' : '#contact',
        }));
      }
      return out;
    },
    [headline, subheadline, navLabels]
  );

  const openPreview = useCallback(async () => {
    if (!selected) return;
    if (activeBlueprint?.version === 1) {
      if (!isApiAvailable()) return;
      try {
        const html = await api.previewDesignBlueprint({
          blueprint: activeBlueprint,
          override: { headline, subheadline, navLabels, theme: { bg, text, accent } },
        });
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const u = URL.createObjectURL(blob);
        window.open(u, '_blank', 'noopener');
        setTimeout(() => URL.revokeObjectURL(u), 15000);
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'プレビューに失敗しました');
      }
      return;
    }
    const baseId = selected.baseTemplateId || selected.id;
    const tpl = TEMPLATES.find((t) => t.id === baseId);
    if (!tpl) return;
    const sample = SHOWCASE_BY_STYLE_ID[tpl.styleId];
    const content = sample ? sample.content : SAMPLE_DEFAULT;
    const seo = sample ? sample.seo : SAMPLE_SEO_DEFAULT;
    let html = buildHtml(applyOverrides(content), seo, tpl, { genOptions: SAMPLE_GEN_OPTIONS });
    const css = makeThemeCss(baseId, { bg, text, accent });
    if (css) html = html.replace('</head>', `<style id="custom-template-theme">${css}</style></head>`);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }, [selected, activeBlueprint, applyOverrides, makeThemeCss, bg, text, accent, headline, subheadline, navLabels]);

  const extractFromRefUrl = useCallback(async () => {
    if (!isApiAvailable() || !refUrl.trim()) {
      setErr('参考URLを入力してください。');
      return;
    }
    setErr(null);
    setMsg(null);
    try {
      const res = await api.extractStyleFromUrl(refUrl.trim());
      if (res.blueprint?.version === 1) {
        setReferenceBlueprint(res.blueprint);
        const col = res.blueprint.tokens?.colors;
        if (col?.bg) setBg(col.bg);
        if (col?.text) setText(col.text);
        if (col?.accent) setAccent(col.accent);
      }
      setMsg(
        '参考ページから設計ブループリントを生成しました（構成・余白・タイポ・配色を数値化）。プレビューは新規専用レイアウトで開きます。既存の美容室テンプレ等には当てません。'
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : '抽出に失敗しました');
    }
  }, [refUrl]);

  const saveAsNewPublished = useCallback(async () => {
    if (!isApiAvailable() || !selected) return;
    setErr(null);
    setMsg(null);
    try {
      if (activeBlueprint?.version === 1) {
        await api.saveTemplateCustomization({
          mode: 'create',
          status: 'published',
          baseTemplateId: 'blueprint',
          blueprint: activeBlueprint,
          name: name.trim() || '参考設計テンプレ',
          sourceUrl: refUrl.trim() || undefined,
          override: { headline, subheadline, navLabels, theme: { bg, text, accent } },
        });
      } else {
        await api.saveTemplateCustomization({
          mode: 'create',
          status: 'published',
          name: name.trim() || `${selected.name} カスタム`,
          baseTemplateId: selected.baseTemplateId || selected.id,
          sourceUrl: refUrl.trim() || undefined,
          override: { headline, subheadline, navLabels, theme: { bg, text, accent } },
        });
      }
      const list = await api.getTemplateCandidates();
      setCandidates(list || []);
      setMsg('公開テンプレとして保存しました（ヒアリングの候補にも表示されます）。');
    } catch (e) {
      setErr(e instanceof Error ? e.message : '保存に失敗しました');
    }
  }, [selected, activeBlueprint, name, headline, subheadline, navLabels, bg, text, accent, refUrl]);

  const saveAsDraft = useCallback(async () => {
    if (!isApiAvailable() || !selected) return;
    setErr(null);
    setMsg(null);
    try {
      if (activeBlueprint?.version === 1) {
        await api.saveTemplateCustomization({
          mode: 'create',
          status: 'draft',
          baseTemplateId: 'blueprint',
          blueprint: activeBlueprint,
          name: name.trim() || '参考設計 下書き',
          sourceUrl: refUrl.trim() || undefined,
          override: { headline, subheadline, navLabels, theme: { bg, text, accent } },
        });
      } else {
        await api.saveTemplateCustomization({
          mode: 'create',
          status: 'draft',
          name: name.trim() || `${selected.name} 下書き`,
          baseTemplateId: selected.baseTemplateId || selected.id,
          sourceUrl: refUrl.trim() || undefined,
          override: { headline, subheadline, navLabels, theme: { bg, text, accent } },
        });
      }
      const list = await api.getTemplateCandidates();
      setCandidates(list || []);
      setMsg('下書きとして保存しました。公開承認で候補に表示できます。');
    } catch (e) {
      setErr(e instanceof Error ? e.message : '保存に失敗しました');
    }
  }, [selected, activeBlueprint, name, headline, subheadline, navLabels, bg, text, accent, refUrl]);

  const publishSelectedDraft = useCallback(async () => {
    if (!isApiAvailable() || !selected?.isCustom || !selectedIsDraft) return;
    setErr(null);
    setMsg(null);
    try {
      await api.publishTemplateCustomization(selected.id);
      const list = await api.getTemplateCandidates();
      setCandidates(list || []);
      setMsg('下書きを公開しました。ヒアリングフォームの候補にも表示されます。');
    } catch (e) {
      setErr(e instanceof Error ? e.message : '公開に失敗しました');
    }
  }, [selected, selectedIsDraft]);

  const deleteSelected = useCallback(async () => {
    if (!isApiAvailable() || !selected?.isCustom || !selected.id) return;
    if (
      !window.confirm(
        `カスタムテンプレ「${selected.name}」を削除しますか？ヒアリング候補からも消えます。この操作は取り消せません。`
      )
    ) {
      return;
    }
    setErr(null);
    setMsg(null);
    try {
      await api.deleteTemplateCustomization(selected.id);
      const list = await api.getTemplateCandidates();
      setCandidates(list || []);
      const next = list?.find((c) => !c.isCustom) || list?.[0];
      if (next?.id) setSelectedId(next.id);
      setReferenceBlueprint(null);
      setMsg('カスタムテンプレを削除しました。');
    } catch (e) {
      setErr(e instanceof Error ? e.message : '削除に失敗しました');
    }
  }, [selected]);

  const saveUpdate = useCallback(async () => {
    if (!isApiAvailable() || !selected?.isCustom) {
      setErr('既存テンプレの直接更新は不可です。新規テンプレ保存を使ってください。');
      return;
    }
    setErr(null);
    setMsg(null);
    try {
      const baseBp =
        (selected.customization?.blueprint as DesignBlueprint | undefined) ?? activeBlueprint ?? undefined;
      let blueprintPayload: DesignBlueprint | undefined;
      if (baseBp && baseBp.version === 1 && selected?.baseTemplateId === 'blueprint') {
        blueprintPayload = {
          ...baseBp,
          tokens: {
            ...baseBp.tokens,
            colors: {
              ...baseBp.tokens?.colors,
              ...(bg.trim() ? { bg: bg.trim() } : {}),
              ...(text.trim() ? { text: text.trim() } : {}),
              ...(accent.trim() ? { accent: accent.trim() } : {}),
            },
          },
        };
      }
      await api.saveTemplateCustomization({
        mode: 'update',
        id: selected.id,
        name: name.trim() || selected.name,
        status: selectedIsDraft ? 'draft' : 'published',
        sourceUrl: refUrl.trim() || undefined,
        override: { headline, subheadline, navLabels, theme: { bg, text, accent } },
        ...(blueprintPayload ? { blueprint: blueprintPayload } : {}),
      });
      const list = await api.getTemplateCandidates();
      setCandidates(list || []);
      setMsg('カスタムテンプレを更新しました。');
    } catch (e) {
      setErr(e instanceof Error ? e.message : '更新に失敗しました');
    }
  }, [selected, selectedIsDraft, activeBlueprint, name, headline, subheadline, navLabels, bg, text, accent, refUrl]);

  /** 全画面でLPプレビュー編集（テンプレ＝マスタ案、個別＝別ストレージの案） */
  const openInlineEditor = useCallback(
    (mode: 'template' | 'individual', tplId: string) => {
      const tpl = resolvedCandidates.find((c) => c.id === tplId);
      if (!tpl) return;
      const baseId = tpl.baseTemplateId || tpl.id;
      if (tpl.kind === 'blueprint' || baseId === 'blueprint') {
        setMsg('参考設計テンプレは右のフォームと「プレビューを別タブで開く」で編集してください。');
        setSelectedId(tpl.id);
        return;
      }
      setSelectedId(tpl.id);
      const saved = loadInlineDraft(mode, baseId);
      if (saved) {
        setInlineSession({ mode, tpl, ...saved });
      } else {
        const useLive = tpl.id === selectedId;
        const payload = buildSeedForInlineEditor(tpl, useLive ? { headline, subheadline, navLabels } : undefined);
        setInlineSession({ mode, tpl, ...payload });
      }
      setInlineOpen(true);
    },
    [resolvedCandidates, selectedId, headline, subheadline, navLabels]
  );

  const handleInlinePersist = useCallback(async (payload: ReviewPreviewPersistPayload) => {
    setInlineSession((prev) => {
      if (!prev) return prev;
      const bid = prev.tpl.baseTemplateId || prev.tpl.id;
      saveInlineDraft(prev.mode, bid, payload);
      return { ...prev, ...payload };
    });
    setHeadline(payload.content.headline);
    setSubheadline(payload.content.subheadline);
    const nav = payload.content.navItems?.map((n) => n.label).join(', ') || '';
    setNavLabels(nav);
    setMsg('編集内容を保存しました（このブラウザに記録。見出し・メニュー名は右のフォームにも反映しました）。');
  }, []);

  const closeInlineEditor = useCallback(() => {
    setInlineOpen(false);
  }, []);

  return (
    <div className="panel theme-picker theme-picker-design design-check-panel">
      <h2 className="design-step-label">⓪ デザイン</h2>
      <p className="design-step-desc">
        参考URLから<strong>新規専用の設計ブループリント</strong>（構成・余白・タイポ・配色の数値）を生成します。既存の美容室テンプレ等には当てず、別レイアウトでプレビュー・保存します。文章・写真はオリジナル素材です。
      </p>
      <div className="design-check-panel-grid">
        <div>
          <ul className="design-list" aria-label="デザインパターン一覧">
            {resolvedCandidates.map((tpl, i) => (
              <li key={tpl.id}>
                <div className={`design-card design-card-block ${selectedId === tpl.id ? 'selected' : ''}`}>
                  <button
                    type="button"
                    className="design-card-select-area design-card-preview-only"
                    onClick={() => setSelectedId(tpl.id)}
                    aria-pressed={selectedId === tpl.id}
                  >
                    <span className="design-card-index">{i + 1}</span>
                    <span className="design-card-name">
                      {tpl.name}
                      {tpl.isCustom
                        ? tpl.status === 'draft' || tpl.customization?.status === 'draft'
                          ? '（下書き）'
                          : '（カスタム）'
                        : ''}
                    </span>
                    <span className="design-card-desc">
                      {tpl.kind === 'blueprint' || tpl.baseTemplateId === 'blueprint' ? '参考設計' : tpl.baseTemplateId}
                    </span>
                    <div
                      className="design-card-preview"
                      style={{
                        background: PREVIEW_BG[tpl.baseTemplateId] ?? '#fff',
                        color: PREVIEW_COLOR[tpl.baseTemplateId] ?? '#333',
                      }}
                    >
                      Aa
                    </div>
                    <span className="design-card-action">選択</span>
                  </button>
                  <div className="design-card-footer-actions">
                    <button
                      type="button"
                      className="design-card-footer-btn"
                      onClick={() => openInlineEditor('template', tpl.id)}
                    >
                      テンプレ編集
                    </button>
                    <button
                      type="button"
                      className="design-card-footer-btn"
                      onClick={() => openInlineEditor('individual', tpl.id)}
                      title="テンプレ案とは別ストレージで、個別向けにLPをクリック編集できます"
                    >
                      個別編集
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div id="design-check-panel-form" style={{ display: 'grid', gap: 8, alignContent: 'start' }}>
          <div className="design-check-panel-callout" role="note">
            <strong>テンプレ編集</strong>／<strong>個別編集</strong>で、このタブ内に<strong>全画面のLPプレビュー編集</strong>が開きます（枠付き要素をクリックして色・文言を変更）。
            テンプレ＝マスタ案、個別＝別データとしてブラウザに保存されます。右のフォームの見出しなどは保存時に同期されます。
            <br />
            実案件のダッシュボード編集が必要なときは「ダッシュボードへ」から。
          </div>
          {onGoDashboard && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <button type="button" className="secondary" onClick={onGoDashboard}>
                ダッシュボードへ（案件の編集）
              </button>
              <span className="design-check-panel-hint">編集画面が見つからないときはこちら</span>
            </div>
          )}
          <label>
            参考URL（任意・自動抽出）
            <input
              value={refUrl}
              onChange={(e) => setRefUrl(e.target.value)}
              placeholder="https:// 設計ブループリントを生成（コード・文章のコピーはしません）"
            />
          </label>
          <button type="button" className="small" onClick={extractFromRefUrl} disabled={!isApiAvailable()}>
            URLから設計を抽出（新規テンプレ）
          </button>
          <label>テンプレ名<input value={name} onChange={(e) => setName(e.target.value)} /></label>
          <label>見出し<input value={headline} onChange={(e) => setHeadline(e.target.value)} /></label>
          <label>サブ見出し<input value={subheadline} onChange={(e) => setSubheadline(e.target.value)} /></label>
          <label>メニュー名（カンマ区切り）<input value={navLabels} onChange={(e) => setNavLabels(e.target.value)} placeholder="TOP, サービス, 実績, 問い合わせ" /></label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <label>背景色<input value={bg} onChange={(e) => setBg(e.target.value)} placeholder="#f2f0eb" /></label>
            <label>文字色<input value={text} onChange={(e) => setText(e.target.value)} placeholder="#3d3935" /></label>
          </div>
          <label>アクセント色<input value={accent} onChange={(e) => setAccent(e.target.value)} placeholder="#b8956f" /></label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
            <button type="button" onClick={openPreview}>
              プレビューを別タブで開く
            </button>
            <button type="button" onClick={saveAsDraft} disabled={!isApiAvailable()}>
              下書き保存
            </button>
            <button type="button" onClick={saveAsNewPublished} disabled={!isApiAvailable()}>
              公開として保存
            </button>
            <button type="button" onClick={saveUpdate} disabled={!selected?.isCustom}>
              既存カスタム更新
            </button>
            <button
              type="button"
              onClick={publishSelectedDraft}
              disabled={!isApiAvailable() || !selectedIsDraft}
              style={{ fontWeight: 700 }}
            >
              公開承認（下書き→候補表示）
            </button>
            <button
              type="button"
              className="small"
              onClick={deleteSelected}
              disabled={!isApiAvailable() || !selected?.isCustom}
              style={{ color: '#b91c1c', borderColor: '#fecaca' }}
            >
              テンプレを削除
            </button>
          </div>
          {selectedIsDraft && (
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#92400e' }}>
              選択中は下書きです。問題なければ「公開承認」でヒアリングのテンプレ候補に載せられます。
            </p>
          )}
          {msg && <p style={{ color: '#0f766e', margin: 0 }}>{msg}</p>}
          {err && <p style={{ color: '#b91c1c', margin: 0 }}>{err}</p>}
        </div>
      </div>

      {inlineOpen && inlineSession && (
        <div
          className="design-inline-editor-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="design-inline-editor-title"
        >
          <div className="design-inline-editor-toolbar">
            <button type="button" className="secondary" onClick={closeInlineEditor}>
              ← 一覧に戻る
            </button>
            <h3 id="design-inline-editor-title" className="design-inline-editor-title">
              {inlineSession.mode === 'template' ? 'テンプレ編集' : '個別編集'} · {inlineSession.tpl.name}
            </h3>
          </div>
          <div className="design-inline-editor-body">
            <ReviewPreviewEditor
              key={`${inlineSession.mode}-${inlineSession.tpl.id}`}
              itemId={`sandbox-${inlineSession.mode}-${inlineSession.tpl.id}`}
              persistMode="callback"
              onPersist={handleInlinePersist}
              showDuplicatePersonal={false}
              idleHintOverride={
                inlineSession.mode === 'template'
                  ? '「プレビューを編集」でLP上の要素をクリックして編集。保存はこのブラウザのテンプレ用データに記録され、右の見出し欄にも同期されます。'
                  : '個別向けの案としてテンプレ案とは別に保存されます（このブラウザのみ）。ダッシュボードの案件とは別データです。'
              }
              content={inlineSession.content}
              seo={inlineSession.seo}
              templateId={inlineSession.tpl.baseTemplateId || inlineSession.tpl.id}
              previewEditCss={inlineSession.previewEditCss}
              variantIndex={0}
              useApi={false}
              onSaved={() => {}}
            />
          </div>
        </div>
      )}
    </div>
  );
}
