import { StyleSheet } from 'react-native-unistyles';

import { darkTheme, lightTheme } from './theme';

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
    initialTheme: 'light',
    // adaptiveThemes: true,
  },
});
