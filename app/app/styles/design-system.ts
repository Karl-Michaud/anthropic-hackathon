/**
 * Modern, Sleek Design System
 * A cohesive, minimal design language with smooth interactions
 * Supports both light and dark modes
 * Using brandColors as the foundation
 */

// ============================================================================
// BRAND COLORS - Foundation
// ============================================================================

export const brandColors = {
  foreground: '#3D2219',
  foregroundDark: '#FAF9F5',
  background: '#F4F3EE',
  backgroundDark: '#1F1E1D',
  componentBackground: '#FDFBF9',
  componentBackgroundDark: '#1F1E1D',
  teal: '#008080',
  crail: '#C15F3C',
  navy: '#000080',
  mustard: '#FFDB58',
  olive: '#808000',
  clay: '#804000',
  maroon: '#800000',
  magenta: '#800031',
  purple: '#710080',
  pampas: '#F4F3EE',
  cloudy: '#B1ADA1',
}

// ============================================================================
// SEMANTIC COLOR MAPPINGS - Light Mode
// ============================================================================

export const colorsLight = {
  primary: brandColors.teal,
  accent: brandColors.crail,
  success: brandColors.olive,
  warning: brandColors.mustard,
  danger: brandColors.maroon,

  text: {
    primary: brandColors.foreground,
    secondary: brandColors.cloudy,
    inverse: brandColors.foregroundDark,
  },

  background: {
    default: brandColors.background,
    paper: brandColors.componentBackground,
    elevated: brandColors.pampas,
  },

  border: {
    default: brandColors.cloudy,
    strong: brandColors.foreground,
  },

  // Sticky note colors (using brand palette)
  sticky: {
    mustard: { bg: brandColors.mustard, border: brandColors.clay, text: brandColors.foreground },
    teal: { bg: brandColors.teal, border: brandColors.navy, text: brandColors.foregroundDark },
    crail: { bg: brandColors.crail, border: brandColors.maroon, text: brandColors.foreground },
    olive: { bg: brandColors.olive, border: brandColors.clay, text: brandColors.foregroundDark },
    purple: { bg: brandColors.purple, border: brandColors.magenta, text: brandColors.foregroundDark },
    navy: { bg: brandColors.navy, border: brandColors.teal, text: brandColors.foregroundDark },
  },
}

// ============================================================================
// SEMANTIC COLOR MAPPINGS - Dark Mode
// ============================================================================

export const colorsDark = {
  primary: brandColors.teal,
  accent: brandColors.crail,
  success: brandColors.olive,
  warning: brandColors.mustard,
  danger: brandColors.maroon,

  text: {
    primary: brandColors.foregroundDark,
    secondary: brandColors.cloudy,
    inverse: brandColors.foreground,
  },

  background: {
    default: brandColors.backgroundDark,
    paper: brandColors.componentBackgroundDark,
    elevated: '#262624',
  },

  border: {
    default: brandColors.cloudy,
    strong: brandColors.foregroundDark,
  },

  // Sticky note colors (darker variants for dark mode)
  sticky: {
    mustard: { bg: brandColors.clay, border: brandColors.mustard, text: brandColors.foregroundDark },
    teal: { bg: brandColors.navy, border: brandColors.teal, text: brandColors.foregroundDark },
    crail: { bg: brandColors.maroon, border: brandColors.crail, text: brandColors.foregroundDark },
    olive: { bg: brandColors.clay, border: brandColors.olive, text: brandColors.foregroundDark },
    purple: { bg: brandColors.magenta, border: brandColors.purple, text: brandColors.foregroundDark },
    navy: { bg: brandColors.navy, border: brandColors.teal, text: brandColors.foregroundDark },
  },
}

// Default export is light mode
export const colors = colorsLight

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  // Font families
  fonts: {
    sans: '"Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    serif:
      '"Noto Serif", ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
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
    background: brandColors.componentBackground,
    shadow: shadows.md,
    border: `1px solid ${brandColors.cloudy}`,
  },

  // Surface variants
  surface: {
    primary: {
      background: brandColors.componentBackground,
      border: `1px solid ${brandColors.teal}`,
    },
    secondary: {
      background: brandColors.pampas,
      border: `1px solid ${brandColors.cloudy}`,
    },
    accent: {
      background: brandColors.componentBackground,
      border: `1px solid ${brandColors.crail}`,
    },
  },
}

// ============================================================================
// DARK MODE COMPONENT TOKENS
// ============================================================================

export const componentsDark = {
  // Button sizes (same as light mode)
  button: {
    xs: {
      height: '1.75rem',
      padding: '0 0.5rem',
      fontSize: typography.sizes.xs,
    },
    sm: {
      height: '2rem',
      padding: '0 0.75rem',
      fontSize: typography.sizes.sm,
    },
    md: {
      height: '2.5rem',
      padding: '0 1rem',
      fontSize: typography.sizes.base,
    },
    lg: {
      height: '3rem',
      padding: '0 1.5rem',
      fontSize: typography.sizes.lg,
    },
  },

  // Input sizes (same as light mode)
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

  // Card styling (dark mode variant)
  card: {
    padding: spacing[6],
    borderRadius: borderRadius.xl,
    background: brandColors.componentBackgroundDark,
    shadow: shadows.md,
    border: `1px solid ${brandColors.cloudy}`,
  },

  // Surface variants (dark mode)
  surface: {
    primary: {
      background: brandColors.componentBackgroundDark,
      border: `1px solid ${brandColors.teal}`,
    },
    secondary: {
      background: brandColors.backgroundDark,
      border: `1px solid ${brandColors.cloudy}`,
    },
    accent: {
      background: brandColors.componentBackgroundDark,
      border: `1px solid ${brandColors.crail}`,
    },
  },
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const designSystem = {
  colors,
  colorsDark,
  colorsLight,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  components,
  componentsDark,
}

// Re-export all for convenience
export default designSystem
