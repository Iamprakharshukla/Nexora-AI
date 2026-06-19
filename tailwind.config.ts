import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        nexora: {
          dark: '#030303',
          darker: '#010101',
          card: '#080808',
          border: 'rgba(255, 255, 255, 0.06)',
          glow: '#00ffcc',
          neonPink: '#cc00ff',
          neonBlue: '#0077ff',
          gold: '#ffaa00',
          glass: 'rgba(5, 5, 5, 0.7)',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'nexora-gradient': 'linear-gradient(135deg, #00ffcc 0%, #cc00ff 100%)',
        'gold-gradient': 'linear-gradient(135deg, #ffaa00 0%, #ff5500 100%)',
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 255, 204, 0.15)',
        'glow-pink': '0 0 20px rgba(204, 0, 255, 0.15)',
      }
    },
  },
  plugins: [],
};

export default config;
