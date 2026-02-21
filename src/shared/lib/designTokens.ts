/**
 * Design Tokens для Appointy
 * 
 * Примечание: Эти токены должны быть загружены из Figma макета
 * Сейчас используются значения по умолчанию из spec.md
 * 
 * TODO: Обновить значения после получения данных из Figma MCP
 */

export const designTokens = {
  // ============================================
  // COLORS
  // ============================================
  colors: {
    // Primary palette
    primary: {
      DEFAULT: '#7C3AED', // Violet - основной бренд цвет
      50: '#F5F3FF',
      100: '#EDE9FE',
      200: '#DDD6FE',
      300: '#C4B5FD',
      400: '#A78BFA',
      500: '#8B5CF6',
      600: '#7C3AED',
      700: '#6D28D9',
      800: '#5B21B6',
      900: '#4C1D95',
      foreground: '#FFFFFF',
    },
    // Secondary palette
    secondary: {
      DEFAULT: '#F1F5F9',
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
      foreground: '#0F172A',
    },
    // Semantic colors
    background: '#FFFFFF',
    surface: '#F8FAFC',
    border: '#E2E8F0',
    input: '#E2E8F0',
    ring: '#7C3AED',
    
    // Status colors
    success: {
      DEFAULT: '#10B981',
      foreground: '#FFFFFF',
    },
    error: {
      DEFAULT: '#EF4444',
      foreground: '#FFFFFF',
    },
    warning: {
      DEFAULT: '#F59E0B',
      foreground: '#FFFFFF',
    },
    info: {
      DEFAULT: '#3B82F6',
      foreground: '#FFFFFF',
    },
    
    // Text colors
    text: {
      primary: '#0F172A',
      secondary: '#64748B',
      muted: '#94A3B8',
      disabled: '#CBD5E1',
    },
  },

  // ============================================
  // TYPOGRAPHY
  // ============================================
  typography: {
    // Font families (из spec.md)
    fontFamily: {
      heading: 'Nunito, sans-serif',
      body: 'Nunito Sans, sans-serif',
      mono: 'Fira Code, monospace',
    },
    
    // Font sizes
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
      sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
      base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
      lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
      xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
      '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
      '5xl': ['3rem', { lineHeight: '1' }],           // 48px
    },
    
    // Font weights
    fontWeight: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
  },

  // ============================================
  // SPACING
  // ============================================
  spacing: {
    // Base spacing (4px grid)
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    7: '1.75rem',   // 28px
    8: '2rem',      // 32px
    9: '2.25rem',   // 36px
    10: '2.5rem',   // 40px
    11: '2.75rem',  // 44px
    12: '3rem',     // 48px
    14: '3.5rem',   // 56px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
  },

  // ============================================
  // BORDER RADIUS (из spec.md)
  // ============================================
  borderRadius: {
    none: '0',
    sm: '0.375rem',   // 6px
    DEFAULT: '0.5rem', // 8px - inputs
    md: '0.625rem',    // 10px
    lg: '1rem',        // 16px - buttons
    xl: '1.5rem',      // 24px
    '2xl': '2.5rem',   // 40px - cards
    '3xl': '3rem',     // 48px
    full: '9999px',
  },

  // ============================================
  // SHADOWS (из spec.md - cards)
  // ============================================
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    // Card shadow из spec.md
    card: '0 4px 24px rgba(124, 58, 237, 0.1)',
  },

  // ============================================
  // COMPONENT SPECIFICS (из spec.md)
  // ============================================
  components: {
    // Buttons: 52px height, 16px radius
    button: {
      height: '52px',
      borderRadius: '16px',
      paddingX: '24px',
      paddingY: '16px',
      fontWeight: '600',
      fontSize: '1rem',
    },
    
    // Cards: 40px radius + shadow
    card: {
      borderRadius: '40px',
      padding: '24px',
      shadow: '0 4px 24px rgba(124, 58, 237, 0.1)',
    },
    
    // Inputs: 8px radius
    input: {
      borderRadius: '8px',
      height: '52px',
      paddingX: '16px',
      fontSize: '1rem',
    },
    
    // Icons: Lucide React
    icon: {
      sm: '16px',
      md: '20px',
      lg: '24px',
      xl: '32px',
    },
  },

  // ============================================
  // BREAKPOINTS (Responsive)
  // ============================================
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

export type DesignTokens = typeof designTokens;
export default designTokens;
