import { darkColors } from './semanticColors';
import { palette } from './palette';
import {
  fontFamily,
  fontSize,
  fontWeight,
  icon,
  opacity,
  radius,
  spacing,
  typography,
} from './tokens';

export const darkTheme = {
  name: 'dark',
  palette,
  colors: darkColors,
  spacing,
  radius,
  fontFamily,
  fontSize,
  fontWeight,
  icon,
  typography,
  opacity,
} as const;
