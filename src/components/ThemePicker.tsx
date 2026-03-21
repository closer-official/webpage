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
  cafe_1: '#ffffff',
  clinic_chiropractic: '#FAFAFA',
  gym_yoga: '#121212',
  builder: '#fff',
  professional: '#f4f8fc',
  cram_school: '#FAFAFA',
  izakaya: '#FAFAFA',
  pet_salon: '#FAF8F5',
  apparel: '#FAFAFA',
  event: '#FAFAFA',
  ramen: '#f8eeee',
  apparel_lookbook: '#79acc4',
};

const PREVIEW_COLOR: Record<string, string> = {
  salon_barber: '#111',
  cafe_tea: '#3d2914',
  cafe_1: '#1a1a1a',
  clinic_chiropractic: '#111',
  gym_yoga: '#FF3B30',
  builder: '#111',
  professional: '#1a2744',
  cram_school: '#111',
  izakaya: '#111',
  pet_salon: '#4a8f82',
  apparel: '#111',
  event: '#111',
  ramen: '#8B2E2E',
  apparel_lookbook: '#fff',
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
