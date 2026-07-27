import {
  DefaultTheme,
  type Theme as NavigationTheme,
} from '@react-navigation/native';
import { ActivityIndicator } from 'react-native';
import RootNavigator from './RootNavigator';
import { useUnistyles } from 'react-native-unistyles';
import { useEffect } from 'react';
import AppFlex from '@/components/layout/AppFlex';
import { useAuthStore } from '@/modules/auth/state/useAuthStore';
import { AuthStatus } from '@/modules/auth/types/authStatus.types';

const AppNavigator = () => {
  const { theme } = useUnistyles();
  const checkStatus = useAuthStore(state => state.checkStatus);
  const authStatus = useAuthStore(state => state.status);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const navigationTheme: NavigationTheme = {
    ...DefaultTheme,
    dark: theme.name === 'dark',
    colors: {
      ...DefaultTheme.colors,
      background: theme.colors.surface.background.primary,
      primary: theme.colors.text.link,
      text: theme.colors.text.headings,
      card: theme.colors.surface.background.cards,
      border: theme.colors.button.border,
    },
  };

  // const navigationRef = useNavigationContainerRef();

  // // Manejar foco global con react-navigation
  // useEffect(() => {
  //   const unsubscribe = navigationRef.addListener('state', () => {
  //     // cada vez que cambia el estado de navegación -> setFocus(true)
  //     focusManager.setFocused(true);
  //   });

  //   return unsubscribe;
  // }, [navigationRef]);

  // Manejar foco por AppState (cuando pasa background -> foreground)

  if (authStatus === AuthStatus.checking) {
    return (
      <AppFlex
        flex={1}
        align="center"
        justify="center"
        style={{ backgroundColor: theme.colors.surface.background.primary }}
      >
        <ActivityIndicator color={theme.colors.text.link} />
      </AppFlex>
    );
  }

  return <RootNavigator theme={navigationTheme} />;
};

export default AppNavigator;
