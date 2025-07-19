/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: 'hsl(214.3 31.8% 91.4%)',
        background: 'hsl(0 0% 100%)',
        foreground: 'hsl(222.2 84% 4.9%)',
        ring: 'hsl(221.2 83.2% 53.3%)',
        // Dark mode colors
        'dark-bg': 'hsl(222.2 84% 4.9%)',
        'dark-surface': 'hsl(217.2 32.6% 17.5%)',
        'dark-border': 'hsl(217.2 32.6% 17.5%)',
        'dark-text': 'hsl(210 40% 98%)',
        'dark-text-secondary': 'hsl(215 20.2% 65.1%)',
      },
    },
  },
  plugins: [],
};