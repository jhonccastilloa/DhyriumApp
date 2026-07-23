import { StyleSheet } from 'react-native-unistyles';

import { darkTheme } from './theme/dark';
import { lightTheme } from './theme/light';
import {
  getStoredThemePreference,
  resolveThemePreference,
} from './themePreference';

export const appThemes = {
  light: lightTheme,
  dark: darkTheme,
} as const;

type AppThemes = typeof appThemes;

declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends AppThemes {}
}

StyleSheet.configure({
  themes: appThemes,
  settings: {
    initialTheme: resolveThemePreference(getStoredThemePreference()),
  },
});
