import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary': '#43413d',
        'brand-teal': '#234252',
        'deep-slate': '#373e42',
        'brand-charcoal': '#222222',
        'charcoal': '#222222',
        'background-light': '#f7f7f7',
        'background-dark': '#171a1b',
      },
      fontFamily: {
        'display': ['Inter', 'sans-serif'],
        'heading': ['Outfit', 'sans-serif'],
      },
      borderRadius: {
        'DEFAULT': '0.5rem',
        'lg': '1rem',
        'xl': '1.5rem',
        '2xl': '2rem',
        'full': '9999px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
export default config
