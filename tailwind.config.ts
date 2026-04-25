import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // === Design Token จาก Stitch "Clinical Sanctuary" ===
        'primary':                    '#006948',
        'primary-dim':                '#005B3E',
        'primary-fixed':              '#7FF3BE',
        'primary-fixed-dim':          '#71E4B1',
        'primary-container':          '#7FF3BE',
        'on-primary':                 '#C8FFE1',
        'on-primary-fixed':           '#00452E',
        'on-primary-container':       '#005A3D',
        'on-primary-fixed-variant':   '#006545',

        'secondary':                  '#4D5D73',
        'secondary-dim':              '#415166',
        'secondary-fixed':            '#C8D8F3',
        'secondary-fixed-dim':        '#BAC4E4',
        'secondary-container':        '#C8D8F3',
        'on-secondary':               '#EDF3FF',
        'on-secondary-container':     '#3C4C61',
        'on-secondary-fixed':         '#29394E',
        'on-secondary-fixed-variant': '#46556B',

        'tertiary':                   '#006575',
        'tertiary-dim':               '#005866',
        'tertiary-fixed':             '#00DCFE',
        'tertiary-fixed-dim':         '#00CDED',
        'tertiary-container':         '#00DCFE',
        'on-tertiary':                '#DDF7FF',
        'on-tertiary-container':      '#004955',
        'on-tertiary-fixed':          '#00333D',
        'on-tertiary-fixed-variant':  '#005361',

        'error':                      '#B31B25',
        'error-dim':                  '#9F0519',
        'error-container':            '#FB5151',
        'on-error':                   '#FFEFEE',
        'on-error-container':         '#570008',

        'surface':                    '#F5F6F7',
        'surface-dim':                '#D1D5D7',
        'surface-bright':             '#F5F6F7',
        'surface-tint':               '#006948',
        'surface-variant':            '#DADDDF',
        'surface-container-lowest':   '#FFFFFF',
        'surface-container-low':      '#EFF1F2',
        'surface-container':          '#E6E8EA',
        'surface-container-high':     '#E0E3E4',
        'surface-container-highest':  '#DADDDF',

        'background':                 '#F5F6F7',
        'on-background':              '#2C2F30',
        'on-surface':                 '#2C2F30',
        'on-surface-variant':         '#595C5D',

        'outline':                    '#757778',
        'outline-variant':            '#ABADAE',

        'inverse-surface':            '#0C0F10',
        'inverse-on-surface':         '#9B9D9E',
        'inverse-primary':            '#7FF3BE',
      },
      fontFamily: {
        sans:     ['Plus Jakarta Sans', 'sans-serif'],
        headline: ['Plus Jakarta Sans', 'sans-serif'],
        body:     ['Plus Jakarta Sans', 'sans-serif'],
        label:    ['Plus Jakarta Sans', 'sans-serif'],
        mono:     ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'sm':   '0.25rem',
        'md':   '0.5rem',
        'lg':   '0.75rem',
        'xl':   '1rem',
        '2xl':  '1.5rem',
        '3xl':  '2rem',
        'full': '9999px',
      },
      boxShadow: {
        'premium': '0 12px 32px -4px rgba(44, 47, 48, 0.08)',
        'premium-md': '0 8px 24px -4px rgba(44, 47, 48, 0.10)',
        'inner-pressed': 'inset 0 1px 3px rgba(0, 0, 0, 0.15)',
      },
      backgroundImage: {
        'cta-gradient': 'linear-gradient(135deg, #006948 0%, #005B3E 100%)',
      },
      letterSpacing: {
        'display': '-0.02em',
        'label':   '0.05em',
      },
      lineHeight: {
        'body': '1.6',
      },
    },
  },
  plugins: [],
}

export default config
