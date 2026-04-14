/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#58CC71',
          dark: '#4AB563',
        },
        secondary: '#FF9600',
        background: '#FFF7E8',
        card: '#FFFFFF',
        'search-bg': '#F3F4F6',
        'text-primary': '#1F2937',
        'text-secondary': '#6B7280',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'card': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'float': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
      fontFamily: {
        sans: ['Inter', 'PingFang SC', 'Noto Sans SC', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
