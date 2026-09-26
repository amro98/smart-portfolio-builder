/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: {
          DEFAULT: 'hsl(var(--border))',
          warm: 'hsl(var(--border-warm))',
        },
        haze: 'hsl(var(--haze-warm))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: {
          DEFAULT: 'hsl(var(--foreground))',
          secondary: 'hsl(var(--foreground-secondary))',
        },
        divider: 'hsl(var(--divider))',
        // Warm neutral panels (editor nav, design controls, auth background).
        workspace: 'hsl(var(--workspace))',
        // Form-field fill (white in light mode, inset in dark mode).
        field: 'hsl(var(--input-background))',
        surface: {
          DEFAULT: 'hsl(var(--surface))',
          secondary: 'hsl(var(--surface-secondary))',
        },
        canvas: 'hsl(var(--canvas))',
        overlay: 'hsl(var(--overlay))',
        subtle: {
          foreground: 'hsl(var(--subtle-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          hover: 'hsl(var(--primary-hover))',
          soft: 'hsl(var(--primary-soft))',
          'soft-foreground': 'hsl(var(--primary-soft-foreground))',
        },
        // Vivid teal highlight + its soft badge surface.
        brand: {
          DEFAULT: 'hsl(var(--brand))',
          soft: 'hsl(var(--brand-soft))',
          'soft-foreground': 'hsl(var(--brand-soft-foreground))',
        },
        draft: {
          DEFAULT: 'hsl(var(--draft))',
          soft: 'hsl(var(--draft-soft))',
          'soft-foreground': 'hsl(var(--draft-soft-foreground))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar))',
          foreground: 'hsl(var(--sidebar-foreground))',
          muted: 'hsl(var(--sidebar-muted))',
          deep: 'hsl(var(--sidebar-deep))',
          elevated: 'hsl(var(--sidebar-elevated))',
          'active-strong': 'hsl(var(--sidebar-active-strong))',
          'foreground-strong': 'hsl(var(--sidebar-foreground-strong))',
          hover: 'hsl(var(--sidebar-hover))',
          active: 'hsl(var(--sidebar-active))',
          indicator: 'hsl(var(--sidebar-indicator))',
          border: 'hsl(var(--sidebar-border))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
          soft: 'hsl(var(--destructive-soft))',
          'soft-foreground': 'hsl(var(--destructive-soft-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
          soft: 'hsl(var(--success-soft))',
          'soft-foreground': 'hsl(var(--success-soft-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
          soft: 'hsl(var(--warning-soft))',
          'soft-foreground': 'hsl(var(--warning-soft-foreground))',
        },
      },
      boxShadow: {
        // Hairline elevation for surfaces on the app background, and a soft lift on hover.
        card: '0 1px 2px 0 hsl(var(--shadow-color) / 0.04), 0 1px 3px 0 hsl(var(--shadow-color) / 0.04)',
        // Restrained elevation for cards that sit on a decorated background (auth).
        elevated: '0 1px 2px 0 hsl(var(--shadow-color) / 0.05), 0 24px 48px -28px hsl(var(--shadow-color) / 0.28)',
        'card-hover': '0 10px 28px -14px hsl(var(--shadow-color) / 0.22), 0 2px 6px -2px hsl(var(--shadow-color) / 0.06)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
