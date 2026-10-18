// ==============================================================================
// THEME TOKENS FOR GRADGATE (Duolingo & Professional Data Science Aesthetics)
// ==============================================================================

export type ThemeId =
  | 'theme_python_emerald'
  | 'theme_dark_oled'
  | 'theme_cyberpunk_ai'
  | 'theme_retro_terminal';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  tagline: string;
  isDark: boolean;
  unlockedByDefault: boolean;
  gemCost: number;
  colors: {
    bgApp: string;
    bgSurface: string;
    bgElevated: string;
    borderSubtle: string;
    borderBold: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    primary: string;
    primaryLip: string;
    secondary: string;
    secondaryLip: string;
    accentGold: string;
    accentGoldLip: string;
    danger: string;
    dangerLip: string;
    hudBackground: string;
  };
}

export const THEMES: Record<ThemeId, ThemeDefinition> = {
  theme_python_emerald: {
    id: 'theme_python_emerald',
    name: 'Python Emerald',
    tagline: 'Official crisp Duolingo-grade tactile palette with Python green accents',
    isDark: true,
    unlockedByDefault: true,
    gemCost: 0,
    colors: {
      bgApp: '#0B1120',
      bgSurface: '#0F172A',
      bgElevated: '#1E293B',
      borderSubtle: '#334155',
      borderBold: '#475569',
      textPrimary: '#F8FAFC',
      textSecondary: '#94A3B8',
      textMuted: '#64748B',
      primary: '#58CC02',
      primaryLip: '#46A302',
      secondary: '#1CB0F6',
      secondaryLip: '#1899D6',
      accentGold: '#FFC800',
      accentGoldLip: '#E5A500',
      danger: '#FF4B4B',
      dangerLip: '#EA2B2B',
      hudBackground: '#0F172AEE'
    }
  },
  theme_dark_oled: {
    id: 'theme_dark_oled',
    name: 'Dark OLED Matrix',
    tagline: 'Ultra-deep zero-backlight black engineered for marathon late-night mock tests',
    isDark: true,
    unlockedByDefault: false,
    gemCost: 200,
    colors: {
      bgApp: '#000000',
      bgSurface: '#09090B',
      bgElevated: '#18181B',
      borderSubtle: '#27272A',
      borderBold: '#3F3F46',
      textPrimary: '#FAFAFA',
      textSecondary: '#A1A1AA',
      textMuted: '#71717A',
      primary: '#10B981',
      primaryLip: '#059669',
      secondary: '#06B6D4',
      secondaryLip: '#0891B2',
      accentGold: '#F59E0B',
      accentGoldLip: '#D97706',
      danger: '#EF4444',
      dangerLip: '#DC2626',
      hudBackground: '#000000EE'
    }
  },
  theme_cyberpunk_ai: {
    id: 'theme_cyberpunk_ai',
    name: 'Cyberpunk AI',
    tagline: 'High-contrast neon cyan and magenta matrix inspired by deep neural nets',
    isDark: true,
    unlockedByDefault: false,
    gemCost: 350,
    colors: {
      bgApp: '#080816',
      bgSurface: '#101026',
      bgElevated: '#1B1B3A',
      borderSubtle: '#312E81',
      borderBold: '#4F46E5',
      textPrimary: '#FFFFFF',
      textSecondary: '#C7D2FE',
      textMuted: '#818CF8',
      primary: '#00F0FF',
      primaryLip: '#00A8B5',
      secondary: '#F43F5E',
      secondaryLip: '#BE123C',
      accentGold: '#FBBF24',
      accentGoldLip: '#B45309',
      danger: '#FF0055',
      dangerLip: '#B3003C',
      hudBackground: '#080816EE'
    }
  },
  theme_retro_terminal: {
    id: 'theme_retro_terminal',
    name: 'Retro Terminal',
    tagline: 'Classic phosphor amber glow inspired by vintage UNIX computing labs',
    isDark: true,
    unlockedByDefault: false,
    gemCost: 500,
    colors: {
      bgApp: '#0D0904',
      bgSurface: '#171207',
      bgElevated: '#261D0C',
      borderSubtle: '#453517',
      borderBold: '#785D28',
      textPrimary: '#FFB000',
      textSecondary: '#D99100',
      textMuted: '#996600',
      primary: '#FF9900',
      primaryLip: '#CC7A00',
      secondary: '#00E5FF',
      secondaryLip: '#00A8BA',
      accentGold: '#FFD700',
      accentGoldLip: '#C7A600',
      danger: '#FF3333',
      dangerLip: '#B30000',
      hudBackground: '#0D0904EE'
    }
  }
};

export function applyThemeVariables(theme: ThemeDefinition): void {
  const root = document.documentElement;
  root.style.setProperty('--color-primary', theme.colors.primary);
  root.style.setProperty('--color-primary-lip', theme.colors.primaryLip);
  root.style.setProperty('--color-secondary', theme.colors.secondary);
  root.style.setProperty('--color-secondary-lip', theme.colors.secondaryLip);
  root.style.setProperty('--color-accent-gold', theme.colors.accentGold);
  root.style.setProperty('--color-accent-gold-lip', theme.colors.accentGoldLip);
  root.style.setProperty('--color-danger', theme.colors.danger);
  root.style.setProperty('--color-danger-lip', theme.colors.dangerLip);
  root.style.setProperty('--color-bg-app', theme.colors.bgApp);
  root.style.setProperty('--color-bg-surface', theme.colors.bgSurface);
  root.style.setProperty('--color-bg-elevated', theme.colors.bgElevated);
}
