import type { TemplateOption } from '../types';
import { INDUSTRIES } from '../types';
import { TEMPLATES } from '../lib/templates';

interface ThemePickerProps {
  selectedIndustryId: string;
  selectedStyleId: string;
  onSelect: (template: TemplateOption) => void;
  onIndustryChange: (id: string) => void;
  onStyleChange: (id: string) => void;
}

export function ThemePicker({
  selectedIndustryId,
  selectedStyleId,
  onSelect,
  onIndustryChange,
  onStyleChange,
}: ThemePickerProps) {
  return (
    <div className="panel theme-picker">
      <h2>デザインを選ぶ</h2>
      <p className="hint">業界とデザインスタイルを選ぶと、テンプレートが適用されます。</p>

      <div className="field">
        <label>業界</label>
        <select
          value={selectedIndustryId}
          onChange={(e) => onIndustryChange(e.target.value)}
        >
          {INDUSTRIES.map((ind) => (
            <option key={ind.id} value={ind.id}>
              {ind.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>デザインスタイル</label>
        <div className="template-grid">
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
                  background: tpl.id === 'bold' ? '#0f0f0f' : tpl.id === 'warm' ? '#fef8f0' : tpl.id === 'minimal' ? '#fff' : '#f9fafb',
                  color: tpl.id === 'bold' ? '#fff' : '#333',
                }}
              >
                Aa
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
