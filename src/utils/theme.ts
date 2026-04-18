// src/utils/theme.ts
export const Colors = {
  // Primary palette — deep navy + gold
  primary: '#4A90D9',
  primaryDark: '#2E6BB0',
  primaryLight: '#7AB3E8',
  accent: '#F5A623',
  accentDark: '#D4891A',

  // Background layers
  background: '#0A1628',
  surface: '#0F2040',
  surfaceElevated: '#162D55',
  card: '#1A3460',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A8C0D6',
  textMuted: '#5A7A99',
  textInverse: '#0A1628',

  // Semantic
  success: '#27D08B',
  warning: '#F5A623',
  error: '#FF5C5C',
  info: '#4A90D9',

  // Session phase colors
  intro: '#7B61FF',
  question: '#4A90D9',
  response: '#27D08B',
  solution: '#F5A623',

  // Badges
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',

  // Misc
  border: '#1E3A5F',
  divider: '#162D55',
  overlay: 'rgba(10, 22, 40, 0.85)',
  rotating: '#4A90D9',
};

export const Fonts = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    hero: 40,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
};
