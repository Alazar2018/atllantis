/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        leather: {
          50: '#fdf8f3',
          100: '#f9e8d9',
          200: '#f3d1b8',
          300: '#eab38c',
          400: '#e08f5f',
          500: '#d6753a',
          600: '#c75f2a',
          700: '#a64a25',
          800: '#853c25',
          900: '#6d3321',
        },
        atlantic: {
          primary: '#941b1f',
          secondary: '#97c0d8',
        },
        accent: {
          gold: '#d4af37',
          copper: '#b87333',
          bronze: '#cd7f32',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'leather-texture': "url('/images/leather-texture.jpg')",
      }
    },
  },
  plugins: [],
}
