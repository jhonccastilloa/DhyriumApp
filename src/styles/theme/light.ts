import { lightColors } from './semanticColors';
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

export const lightTheme = {
  name: 'light',
  palette,
  colors: lightColors,
  spacing,
  radius,
  fontFamily,
  fontSize,
  fontWeight,
  typography,
  icon,
  opacity,
} as const;
