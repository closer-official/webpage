/**
 * 検品20項・独自トークン（LPは主にテンプレートCSS。ここはアプリUI用の基準）
 */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F9F9F7',
        surface: '#FAFAF8',
        ink: '#1C1C1C',
        muted: '#3D3D3A',
        accent: '#666666',
        warmth: '#F4F4F1',
      },
      spacing: {
        4: '4px',
        8: '8px',
        16: '16px',
        24: '24px',
        32: '32px',
        48: '48px',
        64: '64px',
        96: '96px',
        128: '128px',
      },
      fontSize: {
        display: ['clamp(2.25rem,6vw+1rem,4.25rem)', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        section: ['clamp(1.5rem,2.8vw+0.75rem,2.35rem)', { lineHeight: '1.15', letterSpacing: '0.04em' }],
        lead: ['clamp(1.0625rem,1.2vw+0.9rem,1.3125rem)', { lineHeight: '1.75', letterSpacing: '0.02em' }],
      },
      boxShadow: {
        lift: '0 1px 1px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.05), 0 20px 40px rgba(0,0,0,0.06)',
        press: '0 1px 2px rgba(0,0,0,0.06)',
        liftHover:
          '0 2px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.08), 0 28px 56px rgba(0,0,0,0.08)',
      },
      borderWidth: {
        hairline: '0.5px',
      },
      transitionTimingFunction: {
        hell: 'cubic-bezier(0.22, 1, 0.36, 1)',
        expo: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        reveal: '1050ms',
        page: '1100ms',
      },
      borderRadius: {
        none: '0',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Yu Mincho', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
