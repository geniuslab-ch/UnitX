/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0a0a0f',
          800: '#0f1419',
          700: '#141b24',
          600: '#1a2332',
          500: '#1f2937',
        },
        // UNITX Brand Colors - Bleu foncé vers Cyan
        unitx: {
          50: '#e0f2fe',
          100: '#bae6fd',
          200: '#7dd3fc',
          300: '#38bdf8',
          400: '#0ea5e9',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#082f49',
          navy: '#1e3a5f',
          blue: '#2563eb',
          cyan: '#06b6d4',
          light: '#38bdf8',
        },
        primary: {
          50: '#e0f2fe',
          100: '#bae6fd',
          200: '#7dd3fc',
          300: '#38bdf8',
          400: '#0ea5e9',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#082f49',
        },
        accent: {
          cyan: '#06b6d4',
          blue: '#2563eb',
          navy: '#1e3a5f',
          sky: '#38bdf8',
          ocean: '#0284c7',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-dark': 'linear-gradient(135deg, #0a0a0f 0%, #141b24 100%)',
        'gradient-unitx': 'linear-gradient(135deg, #0c4a6e 0%, #0284c7 50%, #06b6d4 100%)',
        'gradient-unitx-alt': 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #38bdf8 100%)',
        'gradient-primary': 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
        'gradient-success': 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
        'gradient-warning': 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
        'gradient-danger': 'linear-gradient(135deg, #ef4444 0%, #ec4899 100%)',
        'gradient-cosmic': 'linear-gradient(135deg, #0c4a6e 0%, #0284c7 50%, #38bdf8 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #082f49 0%, #0369a1 50%, #06b6d4 100%)',
      },
      animation: {
        'gradient': 'gradient 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { 
            'box-shadow': '0 0 20px rgba(2, 132, 199, 0.5), 0 0 40px rgba(6, 182, 212, 0.3)',
          },
          '100%': { 
            'box-shadow': '0 0 30px rgba(2, 132, 199, 0.8), 0 0 60px rgba(6, 182, 212, 0.5)',
          },
        },
      },
    },
  },
  plugins: [],
}
