// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Cores da paleta existente
        primary: { DEFAULT: '#2563eb', dark: '#1e40af', light: '#60a5fa' },
        secondary: { DEFAULT: '#16a34a', dark: '#166534', light: '#4ade80' },
        danger: { DEFAULT: '#dc2626', dark: '#991b1b', light: '#f87171' },
        neutral: { DEFAULT: '#374151', light: '#9ca3af', dark: '#111827' },
        
        // Paleta Azuis & Turquesas
        navy: '#000080',
        darkblue: '#00008B',
        mediumblue: '#0000CD',
        blue: '#0000FF',
        dodgerblue: '#1E90FF',
        deepskyblue: '#00BFFF',
        lightskyblue: '#87CEFA',
        skyblue: '#87CEEB',
        lightblue: '#ADD8E6',
        steelblue: '#4682B4',
        lightsteelblue: '#B0C4DE',
        slategray: '#708090',
        lightslategray: '#778899',
        midnightblue: '#191970',
        slateblue: '#6A5ACD',
        slateblue1: '#836FFF',
        slateblue3: '#6959CD',
        darkslateblue: '#483D8B',
        mediumslateblue: '#7B68EE',
        cornflowerblue: '#6495ED',
        royalblue: '#4169E1',
        aqua: '#00FFFF',
        darkturquoise: '#00CED1',
        turquoise: '#40E0D0',
        mediumturquoise: '#48D1CC',
        lightseagreen: '#20B2AA',
        darkcyan: '#008B8B',
        teal: '#008080',
        aquamarine: '#7FFFD4',
        mediumaquamarine: '#66CDAA',
        cadetblue: '#5F9EA0',
        darkslategray: '#2F4F4F',
        paleturquoise: '#AFEEEE',
        azure: '#F0FFFF',
        lightcyan: '#E0FFFF',
        powderblue: '#B0E0E6'
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