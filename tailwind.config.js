/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)', panel: 'var(--panel)', line: 'var(--line)', fg: 'var(--fg)', muted: 'var(--muted)',
        accent: 'var(--accent)', 'accent-ink': 'var(--accent-ink)', mark: 'var(--mark)', warn: 'var(--warn)',
        g1: 'var(--g1)', g2: 'var(--g2)', g3: 'var(--g3)', special: 'var(--special)', office: 'var(--office)'
      },
      fontFamily: {
        display: ['"LXGW WenKai TC"', '"Noto Serif TC"', 'serif'],
        sans: ['"Noto Sans TC"', '"PingFang TC"', '"Microsoft JhengHei"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace']
      }
    }
  },
  plugins: []
};
