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
    <div className="panel theme-picker">
      <h2>6パターンからデザインを選ぶ</h2>
      <p className="hint">
        共通ルール（字間詰め・行間広め・余白4/8/16/32/64・transition 0.8s）を適用したテンプレートです。
      </p>
      <div className="template-grid template-grid-six">
        {TEMPLATES.map((tpl) => (
          <button
            key={tpl.id}
            type="button"
            className={`template-card ${selectedStyleId === tpl.id ? 'selected' : ''}`}
            onClick={() => {
              onStyleChange(tpl.styleId);
              onSelect(tpl);
            }}
          >
            <span className="template-name">{tpl.name}</span>
            <span className="template-desc">{tpl.description}</span>
            <div
              className="template-preview"
              style={{
                background: PREVIEW_BG[tpl.id] ?? '#fff',
                color: PREVIEW_COLOR[tpl.id] ?? '#333',
              }}
            >
              Aa
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
