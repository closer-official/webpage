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
  salon_barber: '#fff',
  cafe_tea: '#f2efe8',
  clinic_chiropractic: '#FAFAFA',
  gym_yoga: '#FAFAFA',
  builder: '#fff',
  professional: '#FAFAFA',
  cram_school: '#FAFAFA',
  izakaya: '#FAFAFA',
  pet_salon: '#FAF8F5',
  apparel: '#FAFAFA',
  event: '#FAFAFA',
};

const PREVIEW_COLOR: Record<string, string> = {
  salon_barber: '#111',
  cafe_tea: '#3d2914',
  clinic_chiropractic: '#111',
  gym_yoga: '#111',
  builder: '#111',
  professional: '#111',
  cram_school: '#111',
  izakaya: '#111',
  pet_salon: '#4a8f82',
  apparel: '#111',
  event: '#111',
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
      <p className="design-step-desc">10パターンから1つ選んでください。</p>
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
