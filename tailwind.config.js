// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#2563eb', dark: '#1e40af', light: '#60a5fa' },
        secondary: { DEFAULT: '#16a34a', dark: '#166534', light: '#4ade80' },
        danger: { DEFAULT: '#dc2626', dark: '#991b1b', light: '#f87171' },
        neutral: { DEFAULT: '#374151', light: '#9ca3af', dark: '#111827' }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio')
  ]
}