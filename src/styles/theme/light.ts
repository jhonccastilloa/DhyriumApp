import { lightColors } from './semanticColors';
import { palette } from './palette';
import {
  border,
  control,
  elevation,
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
  control,
  border,
  elevation,
} as const;
