import type { TemplateOption } from '../types';
import { TEMPLATES } from '../lib/templates';

interface ThemePickerProps {
  selectedIndustryId: string;
  selectedStyleId: string;
  onSelect: (template: TemplateOption) => void;
  onIndustryChange: (id: string) => void;
  onStyleChange: (id: string) => void;
}

const PREVIEW_BG: Record<string, string> = {
  minimal_luxury: '#FAFAFA',
  dark_edge: '#080808',
  corporate_trust: '#f8fafc',
  warm_organic: '#FDFBF7',
  pop_friendly: '#fef08a',
  high_energy: '#fff',
};

const PREVIEW_COLOR: Record<string, string> = {
  minimal_luxury: '#111',
  dark_edge: '#fff',
  corporate_trust: '#1e293b',
  warm_organic: '#3d2914',
  pop_friendly: '#1a1a1a',
  high_energy: '#0f0f0f',
};

export function ThemePicker({
  selectedIndustryId: _industryId,
  selectedStyleId,
  onSelect,
  onIndustryChange: _onIndustryChange,
  onStyleChange,
}: ThemePickerProps) {
  return (
    <div className="panel theme-picker theme-picker-design">
      <h2 className="design-step-label">⓪ デザイン</h2>
      <p className="design-step-desc">6パターンから1つ選んでください。</p>
      <ul className="design-list" aria-label="デザインパターン一覧">
        {TEMPLATES.map((tpl, i) => (
          <li key={tpl.id}>
            <button
              type="button"
              className={`design-card ${selectedStyleId === tpl.id ? 'selected' : ''}`}
              onClick={() => {
                onStyleChange(tpl.styleId);
                onSelect(tpl);
              }}
            >
              <span className="design-card-index">{i + 1}</span>
              <span className="design-card-name">{tpl.name}</span>
              <span className="design-card-desc">{tpl.description}</span>
              <div
                className="design-card-preview"
                style={{
                  background: PREVIEW_BG[tpl.id] ?? '#fff',
                  color: PREVIEW_COLOR[tpl.id] ?? '#333',
                }}
              >
                Aa
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
