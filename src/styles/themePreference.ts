import { Appearance } from 'react-native';
import { UnistylesRuntime } from 'react-native-unistyles';
import { create } from 'zustand';
import StorageAdapter from '@/infrastructure/storage/StorageAdapter';

export type ThemePreference = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'appearance.theme';

export const getStoredThemePreference = (): ThemePreference => {
  const stored = StorageAdapter.getItem(THEME_STORAGE_KEY);
  return stored === 'light' || stored === 'dark' || stored === 'system'
    ? stored
    : 'system';
};

export const resolveThemePreference = (
  preference: ThemePreference
): 'light' | 'dark' =>
  preference === 'system'
    ? Appearance.getColorScheme() === 'dark'
      ? 'dark'
      : 'light'
    : preference;

type ThemePreferenceState = {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

export const useThemePreferenceStore = create<ThemePreferenceState>(set => ({
  preference: getStoredThemePreference(),
  setPreference: preference => {
    StorageAdapter.setItem(THEME_STORAGE_KEY, preference);
    UnistylesRuntime.setTheme(resolveThemePreference(preference));
    set({ preference });
  },
}));
