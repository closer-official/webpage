/**
 * グローバル・デザイン・トークン（A1 オーバーホール命令書）
 * Colors: Background #F9F9F7, Text #1A1A1A, Accent #666666
 * Spacing: 4, 8, 16, 24, 32, 48, 64, 96, 128 の倍数のみ
 * A-1 (Luxury): rounded-none 徹底
 */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F9F9F7',
        text: '#1A1A1A',
        accent: '#666666',
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
      borderRadius: {
        none: '0',
        // A-1 (Luxury) では rounded-none を強制
      },
      fontFamily: {
        serif: ['Playfair Display', 'Yu Mincho', 'Georgia', 'serif'],
      },
      transitionTimingFunction: {
        'a1-ease': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        'a1': '1.2s',
      },
    },
  },
  plugins: [],
};
