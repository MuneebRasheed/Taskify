/**
 * App color constants. Use these across the app instead of hardcoded hex values.
 * - palette: raw colors (theme-agnostic)
 * - getColors(isDark): semantic colors for the current theme
 */

/** Raw palette – use for one-off values or when building semantic colors. */
export const palette = {
    white: '#ffffff',
    blackText:"#000000",
    /** Primary text / he adings (replaces red) – use for headings, labels, icons in light theme */
    black: '#292D32',
    gray100: '#f5f5f5',
    gray200: '#eeeeee',
    gray300: '#e0e0e0',
    gray400: '#bdbdbd',
    gray500: '#9e9e9e',
    gray600: '#757575',
    gray700: '#616161',
    gray800: '#424242',
    gray900: '#212121',
    primary: '#52976D',
    /** Accent orange for onboarding / CTAs */
    divider: '#F5F5F5',
    orange: '#FE7A36',
  } as const;

  /** Semantic colors for light theme. */
  export const lightColors = {

    habitIndicator: '#EA1E61',
    taskIndicator: '#1A96F0',
    BtnBackground: '#F5F5F5',
    disabledButton: '#F78FBE',
    accent: '#BD51B7',
    skipbg: '#FCE8F0',
    smallText: '#212121',
    placeholderText: '#9E9E9E',
    background: "#7C1C76",
    secondaryBackground: "#FFFFFF",
    textButtonOrange: '#FE7A36',
    inputBackground: "#fafafa",
    text: "#292D32",
    subText: '#616161',
    textSecondary: palette.gray600,
    surface: palette.gray200,
    surfaceBorder: palette.gray300,
    border: '#EEEEEE',
    primary: palette.primary,
    exclamatoryBg: '#E0F2FE',
  } as const;
  
  /** Semantic colors for dark theme. */
  export const darkColors = {
    background: "#1D1D1D",
    textButtonOrange: '#FE7A36',
    inputBackground: "#fafafa",
    text: palette.white,
    subText: '#616161',
    textSecondary: palette.gray400,
    surface: '#2C2C2E',
    surfaceBorder: palette.gray700,
    border: palette.gray700,
    primary: palette.primary,
    exclamatoryBg: '#1E3A5F',
  } as const;
  
  export type AppColors = {
    background: string;
    text: string;
    textButtonOrange: string;
    textSecondary: string;
    surface: string;
    surfaceBorder: string;
    border: string;
    primary: string;
    exclamatoryBg: string;
    subText: string;
    inputBackground: string;
  };
  
  /** Returns semantic colors for the current theme. Use in components with isDark from useThemeStore. */
  export function getColors(isDark: boolean): AppColors {
    return isDark ? darkColors : lightColors;
  }