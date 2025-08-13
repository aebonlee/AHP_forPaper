/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          600: '#2563EB',
        },
        secondary: {
          600: '#16A34A',
        },
        warning: {
          500: '#EAB308',
        },
        error: {
          600: '#DC2626',
        },
      },
      backgroundColor: {
        'gray-50': '#F9FAFB',
      }
    },
  },
  plugins: [],
}