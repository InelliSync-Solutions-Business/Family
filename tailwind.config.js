/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#fafaf7',
          100: '#f4f2eb',
          200: '#e8e1d4',
          300: '#d6cbb5',
          400: '#c0b094',
          500: '#a89277',
          600: '#8a7560',
          700: '#6d5e4f',
          800: '#4a4038',
          900: '#2a2420',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Source Serif Pro', 'serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/container-queries')],
}
