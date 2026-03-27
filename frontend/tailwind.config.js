/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Essential for explicitly switching light/dark modes
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'General Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        prime: {
          bg: '#ffffff',
          bgDark: '#09090b', // zinc-950
          text: '#09090b', // zinc-950
          textDark: '#fafafa', // zinc-50
          card: '#ffffff',
          cardDark: '#09090b', // zinc-950
          border: '#e4e4e7', // zinc-200
          borderDark: '#27272a', // zinc-800
          blue: '#2563eb', // blue-600 active accent
          gray: '#a1a1aa' // zinc-400
        }
      },
      backgroundImage: {
         'linear-gradient-border': 'linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
      }
    },
  },
  plugins: [],
}
