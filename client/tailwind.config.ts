import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f8ff',
          100: '#ebf1fe',
          200: '#dce6fd',
          300: '#c3d3fc',
          400: '#a1bbf9',
          500: '#7a9df5',
          600: '#547bef',
          700: '#3a5ee3',
          800: '#2b47cc',
          900: '#1b2fa7',
          950: '#101c77',
        },
      },
    },
  },
  plugins: [],
};

export default config;
