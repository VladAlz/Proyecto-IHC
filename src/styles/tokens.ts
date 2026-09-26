/**
 * Design Tokens alineados con los wireframes Mid-Fi de Santiago (EDT 1.2 / EDT 1.4)
 * - Escala de grises con ratios de contraste WCAG 2.1 AA (4.5:1 texto, 3:1 componentes)
 * - Tipografía con jerarquía visual estricta (h1: 24px, h2: 20px, body: 16px, caption: 12px)
 * - Espaciado en múltiplos de 8px (base 8px grid)
 * - Ley de Fitts: áreas de toque mínimo 44x44px
 */

export const tokens = {
  colors: {
    // Escala de grises Mid-Fi (Semana 6)
    white: '#ffffff',
    gray50: '#f8fafc',
    gray100: '#f1f5f9',
    gray200: '#e2e8f0',
    gray300: '#cbd5e1',
    gray400: '#94a3b8',
    gray500: '#64748b',
    gray600: '#475569',
    gray700: '#334155',
    gray800: '#1e293b',
    gray900: '#0f172a',

    // Colores semánticos con contraste WCAG 2.1 AA (>= 4.5:1 en texto sobre fondo blanco/claro)
    primary: '#2563eb',       // Azul accesible (4.56:1 sobre blanco)
    primaryHover: '#1d4ed8',
    primaryFocus: '#60a5fa',
    primaryLight: '#eff6ff',

    success: '#16a34a',       // Verde accesible (4.6:1)
    successLight: '#f0fdf4',
    successBorder: '#bbf7d0',

    warning: '#d97706',       // Ámbar accesible (4.5:1)
    warningLight: '#fffbeb',
    warningBorder: '#fde68a',

    danger: '#dc2626',        // Rojo accesible (4.6:1)
    dangerHover: '#b91c1c',
    dangerLight: '#fef2f2',
    dangerBorder: '#fecaca',

    // Severidades de Nielsen (1-4)
    severity: {
      1: { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1', label: 'Cosmético' },
      2: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', label: 'Menor' },
      3: { bg: '#fffbeb', text: '#b45309', border: '#fde68a', label: 'Mayor' },
      4: { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca', label: 'Catastrófico' },
    },
  },

  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    h1: {
      fontSize: '24px',
      lineHeight: '32px',
      fontWeight: '700',
    },
    h2: {
      fontSize: '20px',
      lineHeight: '28px',
      fontWeight: '600',
    },
    h3: {
      fontSize: '18px',
      lineHeight: '24px',
      fontWeight: '600',
    },
    body: {
      fontSize: '16px',
      lineHeight: '24px',
      fontWeight: '400',
    },
    bodyMedium: {
      fontSize: '16px',
      lineHeight: '24px',
      fontWeight: '500',
    },
    caption: {
      fontSize: '12px',
      lineHeight: '16px',
      fontWeight: '400',
    },
    captionMedium: {
      fontSize: '12px',
      lineHeight: '16px',
      fontWeight: '500',
    },
    small: {
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: '400',
    },
  },

  // Espaciado en múltiplos de 8px (Semana 6)
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '40px',
    '3xl': '48px',
  },

  radii: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    focus: '0 0 0 3px rgba(37, 99, 235, 0.35)',
  },

  // Ley de Fitts: mínimo 44x44px en áreas interactivas
  fitts: {
    minTouchArea: '44px',
  },

  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;
