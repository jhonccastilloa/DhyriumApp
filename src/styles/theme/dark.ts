import { darkColors } from './semanticColors';
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
  control,
  border,
  elevation,
} as const;
