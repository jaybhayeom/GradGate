// ==============================================================================
// VERIFIED PRO COLOR PALETTES FOR GRADGATE
// Sourced strictly from the 75-palette pro-color-palettes library.
// Enforces 60-30-10 distribution and WCAG AA contrast compliance:
//   - 60% Base / Background (--palette-bg)
//   - 30% Surface / Cards (--palette-surface)
//   - 10% Accent / CTA (--palette-accent)
// ==============================================================================

export type ThemeId =
  | 'theme_python_emerald'
  | 'theme_dark_oled'
  | 'theme_cyberpunk_ai'
  | 'theme_retro_terminal'
  | 'theme_ideas_amber';

export interface ThemeTokens {
  bg: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  borderSubtle: string;
  accent: string;
  accentHover: string;
  accentLip: string;
  textOnBg: string;
  textOnSurface: string;
  textMuted: string;
  textOnAccent: string;
}

export interface ThemeDefinition {
  id: ThemeId;
  paletteCode: string;
  name: string;
  tagline: string;
  category: string;
  isDark: boolean;
  unlockedByDefault: boolean;
  gemCost: number;
  tokens: ThemeTokens;
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
  // P60: Deep Graphite + Lime Compute (Primary Workstation)
  theme_python_emerald: {
    id: 'theme_python_emerald',
    paletteCode: 'P60',
    name: 'Graphite Compute (P60)',
    tagline: 'Dark neutral graphite engineered to eliminate eye strain during multi-hour technical study',
    category: 'Developer & Data Science Tools',
    isDark: true,
    unlockedByDefault: true,
    gemCost: 0,
    tokens: {
      bg: '#1F2329',
      surface: '#282C34',
      surfaceElevated: '#323842',
      border: '#3E4451',
      borderSubtle: '#2D333F',
      accent: '#B6FF2E',
      accentHover: '#A3E826',
      accentLip: '#8ACC1D',
      textOnBg: '#FFFFFF',
      textOnSurface: '#E6EDF3',
      textMuted: '#94A3B8',
      textOnAccent: '#0A0A0A'
    },
    colors: {
      bgApp: '#1F2329',
      bgSurface: '#282C34',
      bgElevated: '#323842',
      borderSubtle: '#2D333F',
      borderBold: '#3E4451',
      textPrimary: '#FFFFFF',
      textSecondary: '#E6EDF3',
      textMuted: '#94A3B8',
      primary: '#B6FF2E',
      primaryLip: '#8ACC1D',
      secondary: '#3D7EFF',
      secondaryLip: '#2B66DB',
      accentGold: '#FFC328',
      accentGoldLip: '#E5AC1C',
      danger: '#FF4B4B',
      dangerLip: '#EA2B2B',
      hudBackground: '#1F2329EE'
    }
  },

  // P32: Orbit Navy + Electric Blue (Systems & Quantitative Finance)
  theme_dark_oled: {
    id: 'theme_dark_oled',
    paletteCode: 'P32',
    name: 'Orbit Navy (P32)',
    tagline: 'Deep institutional naval stability combined with piercing electric blue for focused study',
    category: 'Systems & Engineering',
    isDark: true,
    unlockedByDefault: false,
    gemCost: 200,
    tokens: {
      bg: '#0A1024',
      surface: '#141D3B',
      surfaceElevated: '#1E2952',
      border: '#2A3A6D',
      borderSubtle: '#192447',
      accent: '#0066FF',
      accentHover: '#0052CC',
      accentLip: '#0043A8',
      textOnBg: '#FFFFFF',
      textOnSurface: '#E2E8F0',
      textMuted: '#94A3B8',
      textOnAccent: '#FFFFFF'
    },
    colors: {
      bgApp: '#0A1024',
      bgSurface: '#141D3B',
      bgElevated: '#1E2952',
      borderSubtle: '#192447',
      borderBold: '#2A3A6D',
      textPrimary: '#FFFFFF',
      textSecondary: '#E2E8F0',
      textMuted: '#94A3B8',
      primary: '#0066FF',
      primaryLip: '#0043A8',
      secondary: '#00E5FF',
      secondaryLip: '#00A8BA',
      accentGold: '#FFC328',
      accentGoldLip: '#E5AC1C',
      danger: '#EF4444',
      dangerLip: '#DC2626',
      hudBackground: '#0A1024EE'
    }
  },

  // P34: Void Black + Neon Cyan (High-Precision Terminal)
  theme_cyberpunk_ai: {
    id: 'theme_cyberpunk_ai',
    paletteCode: 'P34',
    name: 'Void Cyan (P34)',
    tagline: 'High-contrast obsidian minimalism with razor-sharp cyan telemetry highlights',
    category: 'Precision Telemetry',
    isDark: true,
    unlockedByDefault: false,
    gemCost: 350,
    tokens: {
      bg: '#0B0F14',
      surface: '#151D28',
      surfaceElevated: '#1F2B3B',
      border: '#2E3E54',
      borderSubtle: '#1C2636',
      accent: '#3DF2E0',
      accentHover: '#28D9C7',
      accentLip: '#1EB8A8',
      textOnBg: '#FFFFFF',
      textOnSurface: '#E2E8F0',
      textMuted: '#94A3B8',
      textOnAccent: '#0A0A0A'
    },
    colors: {
      bgApp: '#0B0F14',
      bgSurface: '#151D28',
      bgElevated: '#1F2B3B',
      borderSubtle: '#1C2636',
      borderBold: '#2E3E54',
      textPrimary: '#FFFFFF',
      textSecondary: '#E2E8F0',
      textMuted: '#94A3B8',
      primary: '#3DF2E0',
      primaryLip: '#1EB8A8',
      secondary: '#6366F1',
      secondaryLip: '#4F46E5',
      accentGold: '#FBBF24',
      accentGoldLip: '#B45309',
      danger: '#FF0055',
      dangerLip: '#B3003C',
      hudBackground: '#0B0F14EE'
    }
  },

  // P30: Deep Matrix + Acid Lime (Focus & Deep Work)
  theme_retro_terminal: {
    id: 'theme_retro_terminal',
    paletteCode: 'P30',
    name: 'Deep Matrix (P30)',
    tagline: 'Near-black matrix green canvas paired with acid lime for instant optical recognition',
    category: 'Terminal Focus',
    isDark: true,
    unlockedByDefault: false,
    gemCost: 450,
    tokens: {
      bg: '#0B1A12',
      surface: '#13271C',
      surfaceElevated: '#1C3B2A',
      border: '#28523A',
      borderSubtle: '#193324',
      accent: '#B4FF00',
      accentHover: '#9FE000',
      accentLip: '#84BA00',
      textOnBg: '#FFFFFF',
      textOnSurface: '#E2E8F0',
      textMuted: '#86EFAC',
      textOnAccent: '#0A0A0A'
    },
    colors: {
      bgApp: '#0B1A12',
      bgSurface: '#13271C',
      bgElevated: '#1C3B2A',
      borderSubtle: '#193324',
      borderBold: '#28523A',
      textPrimary: '#FFFFFF',
      textSecondary: '#E2E8F0',
      textMuted: '#86EFAC',
      primary: '#B4FF00',
      primaryLip: '#84BA00',
      secondary: '#00E5FF',
      secondaryLip: '#00A8BA',
      accentGold: '#FFD700',
      accentGoldLip: '#C7A600',
      danger: '#FF3333',
      dangerLip: '#B30000',
      hudBackground: '#0B1A12EE'
    }
  },

  // P03: Turn Ideas Into Impact (Clean Minimal Graphite + Sunshine Amber)
  theme_ideas_amber: {
    id: 'theme_ideas_amber',
    paletteCode: 'P03',
    name: 'Graphite Amber (P03)',
    tagline: 'Precision dark graphite grounded with decisive warm amber for high-focus problem solving',
    category: 'Minimal Workspace',
    isDark: true,
    unlockedByDefault: false,
    gemCost: 300,
    tokens: {
      bg: '#1C1C20',
      surface: '#27272D',
      surfaceElevated: '#33333B',
      border: '#45454F',
      borderSubtle: '#2E2E36',
      accent: '#FFC328',
      accentHover: '#E6AC1E',
      accentLip: '#CC9816',
      textOnBg: '#FFFFFF',
      textOnSurface: '#F2F2F1',
      textMuted: '#A1A1AA',
      textOnAccent: '#0A0A0A'
    },
    colors: {
      bgApp: '#1C1C20',
      bgSurface: '#27272D',
      bgElevated: '#33333B',
      borderSubtle: '#2E2E36',
      borderBold: '#45454F',
      textPrimary: '#FFFFFF',
      textSecondary: '#F2F2F1',
      textMuted: '#A1A1AA',
      primary: '#FFC328',
      primaryLip: '#CC9816',
      secondary: '#3D7EFF',
      secondaryLip: '#2B66DB',
      accentGold: '#FFC328',
      accentGoldLip: '#CC9816',
      danger: '#FF4B4B',
      dangerLip: '#EA2B2B',
      hudBackground: '#1C1C20EE'
    }
  }
};

export function applyThemeVariables(theme: ThemeDefinition): void {
  const root = document.documentElement;

  // 1. Pro Color Palette Tokens (60-30-10 Architecture)
  root.style.setProperty('--palette-bg', theme.tokens.bg);
  root.style.setProperty('--palette-surface', theme.tokens.surface);
  root.style.setProperty('--palette-surface-elevated', theme.tokens.surfaceElevated);
  root.style.setProperty('--palette-border', theme.tokens.border);
  root.style.setProperty('--palette-border-subtle', theme.tokens.borderSubtle);
  root.style.setProperty('--palette-accent', theme.tokens.accent);
  root.style.setProperty('--palette-accent-hover', theme.tokens.accentHover);
  root.style.setProperty('--palette-accent-lip', theme.tokens.accentLip);
  root.style.setProperty('--palette-text-on-bg', theme.tokens.textOnBg);
  root.style.setProperty('--palette-text-on-surface', theme.tokens.textOnSurface);
  root.style.setProperty('--palette-text-muted', theme.tokens.textMuted);
  root.style.setProperty('--palette-text-on-accent', theme.tokens.textOnAccent);

  // 2. Legacy Bindings (Strictly linked to verified tokens)
  root.style.setProperty('--color-primary', theme.tokens.accent);
  root.style.setProperty('--color-primary-lip', theme.tokens.accentLip);
  root.style.setProperty('--color-secondary', theme.colors.secondary);
  root.style.setProperty('--color-secondary-lip', theme.colors.secondaryLip);
  root.style.setProperty('--color-accent-gold', theme.colors.accentGold);
  root.style.setProperty('--color-accent-gold-lip', theme.colors.accentGoldLip);
  root.style.setProperty('--color-danger', theme.colors.danger);
  root.style.setProperty('--color-danger-lip', theme.colors.dangerLip);
  root.style.setProperty('--color-bg-app', theme.tokens.bg);
  root.style.setProperty('--color-bg-surface', theme.tokens.surface);
  root.style.setProperty('--color-bg-elevated', theme.tokens.surfaceElevated);
}
