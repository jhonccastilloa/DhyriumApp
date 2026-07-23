import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toaster } from 'sonner-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import ReactQueryProvider from './providers/ReactQueryProvider';
import AppNavigator from './navigation/AppNavigator';
import { Appearance } from 'react-native';
import { useEffect } from 'react';
import {
  resolveThemePreference,
  useThemePreferenceStore,
} from '@/styles/themePreference';
import { UnistylesRuntime } from 'react-native-unistyles';
import { StyleSheet } from 'react-native';

const App = () => {
  const themePreference = useThemePreferenceStore(state => state.preference);

  useEffect(() => {
    if (themePreference !== 'system') return;
    UnistylesRuntime.setTheme(resolveThemePreference('system'));
    const subscription = Appearance.addChangeListener(() => {
      UnistylesRuntime.setTheme(resolveThemePreference('system'));
    });
    return () => subscription.remove();
  }, [themePreference]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <ReactQueryProvider>
        <BottomSheetModalProvider>
          <KeyboardProvider>
            <SafeAreaProvider>
              <AppNavigator />
              <Toaster />
            </SafeAreaProvider>
          </KeyboardProvider>
        </BottomSheetModalProvider>
      </ReactQueryProvider>
    </GestureHandlerRootView>
  );
};

export default App;

const styles = StyleSheet.create({
  root: { flex: 1 },
});
