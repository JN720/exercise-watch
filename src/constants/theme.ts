import { Platform } from 'react-native';

export const COLORS = {
  bgDark: '#0B0F19',
  bgCard: '#151C2C',
  bgCardHover: '#1E293B',
  bgInput: '#0F172A',

  primary: '#00E5FF', // Neon Cyan
  primaryGlow: 'rgba(0, 229, 255, 0.25)',
  
  secondary: '#FFB300', // Amber
  accent: '#FF2E93', // Crimson / Pink
  success: '#00E676', // Emerald
  warning: '#FF9100', // Neon Orange
  error: '#FF5252', // Red

  textMain: '#F8FAFC',
  textMuted: '#94A3B8',
  textDim: '#64748B',

  border: '#334155',
  borderHighlight: '#475569',

  // Status colors
  active: '#00E5FF',
  paused: '#FFB300',
  idle: '#64748B',
};

export const SHADOWS = {
  glowPrimary: Platform.select({
    web: {
      boxShadow: '0px 0px 12px rgba(0, 229, 255, 0.6)',
    },
    default: {
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 12,
      elevation: 8,
    },
  }),
  glowSuccess: Platform.select({
    web: {
      boxShadow: '0px 0px 10px rgba(0, 230, 118, 0.5)',
    },
    default: {
      shadowColor: COLORS.success,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 6,
    },
  }),
};
