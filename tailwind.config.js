/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#FDFBF7',
          100: '#F7F4EE',
          200: '#EFEBE1',
          300: '#E2DBD0',
          400: '#C5BBAE',
          500: '#A79B8C',
          900: '#1C1917',
        },
        natural: {
          stone: '#292524',
          sand: '#F5F2EB',
          border: '#E5E0D8',
          hover: '#EFEBE4',
          accent: '#C85A32',
          accentHover: '#B24E2A',
          badge: '#FDF6F0',
          darkBg: '#141413',
          darkCard: '#1E1E1C',
          darkBorder: '#2E2E2A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
        signature: ['"Dancing Script"', 'cursive']
      },
      boxShadow: {
        'paper-sm': '0 1px 3px rgba(41, 37, 36, 0.05), 0 1px 2px rgba(41, 37, 36, 0.03)',
        'paper-md': '0 4px 12px rgba(41, 37, 36, 0.08), 0 2px 4px rgba(41, 37, 36, 0.04)',
        'paper-lg': '0 12px 28px rgba(41, 37, 36, 0.12), 0 4px 10px rgba(41, 37, 36, 0.06)',
        'pdf-page': '0 8px 30px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}
