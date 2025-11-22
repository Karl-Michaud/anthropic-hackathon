/**
 * Modern, Sleek Design System
 * A cohesive, minimal design language with smooth interactions
 */

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const colors = {
  // Primary - Sophisticated Blue
  primary: {
    50: '#f0f7ff',
    100: '#e0efff',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Main primary
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c3d66',
  },

  // Accent - Vibrant Teal
  accent: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6', // Main accent
    600: '#0d9488',
    700: '#0f766e',
    800: '#134e4a',
    900: '#0f2f2a',
  },

  // Success - Emerald
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    900: '#14532d',
  },

  // Warning - Amber
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    900: '#78350f',
  },

  // Danger - Rose
  danger: {
    50: '#fff5f7',
    100: '#ffe4e6',
    200: '#fecdd3',
    400: '#fb7185',
    500: '#f43f5e',
    600: '#e11d48',
    700: '#be185d',
    900: '#881337',
  },

  // Neutral - Modern Gray
  neutral: {
    0: '#ffffff',
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },

  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    accent: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
    success: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
  },
}

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  // Font families
  fonts: {
    sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, "Cascadia Code", "Source Code Pro", "Courier New", monospace',
  },

  // Font sizes
  sizes: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
  },

  // Font weights
  weights: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  // Line heights
  lineHeights: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
}

// ============================================================================
// SPACING
// ============================================================================

export const spacing = {
  0: '0',
  1: '0.25rem', // 4px
  2: '0.5rem', // 8px
  3: '0.75rem', // 12px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  8: '2rem', // 32px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
}

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: '0px',
  xs: '0.25rem', // 4px
  sm: '0.375rem', // 6px
  base: '0.5rem', // 8px
  md: '0.75rem', // 12px
  lg: '1rem', // 16px
  xl: '1.25rem', // 20px
  '2xl': '1.5rem', // 24px
  full: '9999px',
}

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
  none: 'none',
  // Subtle elevation
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

  // Colored shadows for elevation
  blue: '0 20px 25px -5px rgba(14, 165, 233, 0.1)',
  teal: '0 20px 25px -5px rgba(20, 184, 166, 0.1)',
  success: '0 20px 25px -5px rgba(34, 197, 94, 0.1)',

  // Inner shadow for depth
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
}

// ============================================================================
// TRANSITIONS & ANIMATIONS
// ============================================================================

export const transitions = {
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },

  easing: {
    // Custom easing functions for smooth, natural motion
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },

  // Common transition combinations
  common: {
    all: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    colors:
      'color, background-color, border-color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    shadow: 'box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
}

// ============================================================================
// COMPONENT TOKENS
// ============================================================================

export const components = {
  // Button sizes
  button: {
    xs: {
      height: '1.75rem', // 28px
      padding: '0 0.5rem',
      fontSize: typography.sizes.xs,
    },
    sm: {
      height: '2rem', // 32px
      padding: '0 0.75rem',
      fontSize: typography.sizes.sm,
    },
    md: {
      height: '2.5rem', // 40px
      padding: '0 1rem',
      fontSize: typography.sizes.base,
    },
    lg: {
      height: '3rem', // 48px
      padding: '0 1.5rem',
      fontSize: typography.sizes.lg,
    },
  },

  // Input sizes
  input: {
    sm: {
      height: '2rem',
      padding: '0.5rem 0.75rem',
      fontSize: typography.sizes.sm,
      borderRadius: borderRadius.md,
    },
    md: {
      height: '2.5rem',
      padding: '0.75rem 1rem',
      fontSize: typography.sizes.base,
      borderRadius: borderRadius.md,
    },
    lg: {
      height: '3rem',
      padding: '1rem 1.25rem',
      fontSize: typography.sizes.lg,
      borderRadius: borderRadius.lg,
    },
  },

  // Card styling
  card: {
    padding: spacing[6],
    borderRadius: borderRadius.xl,
    background: colors.neutral[0],
    shadow: shadows.md,
    border: `1px solid ${colors.neutral[200]}`,
  },

  // Surface variants
  surface: {
    primary: {
      background: colors.primary[50],
      border: `1px solid ${colors.primary[200]}`,
    },
    secondary: {
      background: colors.neutral[50],
      border: `1px solid ${colors.neutral[200]}`,
    },
    accent: {
      background: colors.accent[50],
      border: `1px solid ${colors.accent[200]}`,
    },
  },
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const designSystem = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  components,
}

// Re-export all for convenience
export default designSystem
