/**
 * Paleta base de Dhyrium.
 *
 * Los valores de marca provienen del sistema web. Los niveles intermedios
 * permiten crear superficies y estados sin introducir colores ad hoc en UI.
 */
export const palette = {
  brand: {
    primary: '#0E9CD8',
    secondary: '#001B69',
  },
  cyan: {
    50: '#F0FAFF',
    100: '#C2E7FF',
    200: '#A0DCF5',
    300: '#7DCEEF',
    400: '#38BDF8',
    500: '#0E9CD8',
    600: '#0783BD',
    700: '#006B9B',
    800: '#004C70',
    900: '#003B7A',
    alpha: {
      24: '#C2E7FF3D',
    },
  },
  navy: {
    50: '#F4F7FC',
    100: '#E9EDF8',
    200: '#C2CAD8',
    300: '#A9B3C8',
    400: '#64748B',
    500: '#464F60',
    600: '#203881',
    700: '#13275F',
    800: '#0B1D4D',
    900: '#06133A',
    alpha: {
      16: '#A9B3C829',
    },
  },
  green: {
    50: '#E1FCEF',
    100: '#DFFBEA',
    200: '#B8F3D4',
    300: '#8BE6B7',
    400: '#57D9A3',
    500: '#0F9F6E',
    600: '#0A8057',
    700: '#076040',
    800: '#054A32',
    900: '#032E20',
    alpha: {
      16: '#57D9A329',
    },
  },
  amber: {
    50: '#FFF4D6',
    100: '#FFEAB5',
    400: '#FFD140',
    500: '#D97706',
    600: '#AA5B00',
    alpha: {
      18: '#FFD1402E',
    },
  },
  red: {
    50: '#FEE2E2',
    400: '#FF6B6B',
    500: '#DC2626',
    600: '#B91C1C',
    alpha: {
      16: '#FF6B6B29',
    },
  },
  info: {
    50: '#E7EFFF',
    400: '#7DB5FF',
    500: '#2563EB',
    alpha: {
      16: '#7DB5FF29',
    },
  },
  violet: {
    50: '#F0F1FA',
    500: '#4F5AED',
  },
  neutral: {
    100: '#D4D4D4',
  },
  pure: {
    white: '#FFFFFF',
    black: '#000000',
  },
} as const;
