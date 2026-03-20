import { useCallback, useEffect, useMemo, useState } from 'react';
import { TEMPLATES } from '../lib/templates';
import { buildHtml } from '../lib/buildHtml';
import type { PageContent, SEOData, BuildHtmlGenOptions } from '../types';
import { SHOWCASE_BY_STYLE_ID } from '../data/showcasePresets';
import { api, isApiAvailable, type TemplateCandidate } from '../lib/api';

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
};

export function DesignCheckPanel() {
  const [candidates, setCandidates] = useState<TemplateCandidate[]>([]);
  const [selectedId, setSelectedId] = useState<string>(TEMPLATES[0]?.id || 'salon_barber');
  const [name, setName] = useState('');
  const [headline, setHeadline] = useState('');
  const [subheadline, setSubheadline] = useState('');
  const [navLabels, setNavLabels] = useState('');
  const [bg, setBg] = useState('');
  const [text, setText] = useState('');
  const [accent, setAccent] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

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
    setMsg(null);
    setErr(null);
  }, [selected?.id]);

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

  const openPreview = useCallback(() => {
    if (!selected) return;
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
  }, [selected, applyOverrides, makeThemeCss, bg, text, accent]);

  const saveAsNew = useCallback(async () => {
    if (!isApiAvailable() || !selected) return;
    setErr(null);
    setMsg(null);
    try {
      await api.saveTemplateCustomization({
        mode: 'create',
        name: name.trim() || `${selected.name} カスタム`,
        baseTemplateId: selected.baseTemplateId || selected.id,
        override: { headline, subheadline, navLabels, theme: { bg, text, accent } },
      });
      const list = await api.getTemplateCandidates();
      setCandidates(list || []);
      setMsg('新規テンプレとして保存しました。');
    } catch (e) {
      setErr(e instanceof Error ? e.message : '保存に失敗しました');
    }
  }, [selected, name, headline, subheadline, navLabels, bg, text, accent]);

  const saveUpdate = useCallback(async () => {
    if (!isApiAvailable() || !selected?.isCustom) {
      setErr('既存テンプレの直接更新は不可です。新規テンプレ保存を使ってください。');
      return;
    }
    setErr(null);
    setMsg(null);
    try {
      await api.saveTemplateCustomization({
        mode: 'update',
        id: selected.id,
        name: name.trim() || selected.name,
        override: { headline, subheadline, navLabels, theme: { bg, text, accent } },
      });
      const list = await api.getTemplateCandidates();
      setCandidates(list || []);
      setMsg('カスタムテンプレを更新しました。');
    } catch (e) {
      setErr(e instanceof Error ? e.message : '更新に失敗しました');
    }
  }, [selected, name, headline, subheadline, navLabels, bg, text, accent]);

  return (
    <div className="panel theme-picker theme-picker-design design-check-panel">
      <h2 className="design-step-label">⓪ デザイン</h2>
      <p className="design-step-desc">
        テンプレを選んで文言・色・メニュー名を調整し、既存更新または新規テンプレ保存ができます。
      </p>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1.2fr 1fr' }}>
        <div>
          <ul className="design-list" aria-label="デザインパターン一覧">
            {resolvedCandidates.map((tpl, i) => (
              <li key={tpl.id}>
                <button
                  type="button"
                  className="design-card design-card-preview-only"
                  onClick={() => setSelectedId(tpl.id)}
                  style={{ outline: selectedId === tpl.id ? '2px solid #2563eb' : 'none' }}
                >
                  <span className="design-card-index">{i + 1}</span>
                  <span className="design-card-name">{tpl.name}{tpl.isCustom ? '（カスタム）' : ''}</span>
                  <span className="design-card-desc">{tpl.baseTemplateId}</span>
                  <div className="design-card-preview" style={{ background: PREVIEW_BG[tpl.baseTemplateId] ?? '#fff', color: PREVIEW_COLOR[tpl.baseTemplateId] ?? '#333' }}>Aa</div>
                  <span className="design-card-action">選択</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ display: 'grid', gap: 8, alignContent: 'start' }}>
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
            <button type="button" onClick={openPreview}>プレビューを開く</button>
            <button type="button" onClick={saveAsNew}>新規テンプレ保存</button>
            <button type="button" onClick={saveUpdate} disabled={!selected?.isCustom}>既存カスタム更新</button>
          </div>
          {msg && <p style={{ color: '#0f766e', margin: 0 }}>{msg}</p>}
          {err && <p style={{ color: '#b91c1c', margin: 0 }}>{err}</p>}
        </div>
      </div>
    </div>
  );
}
