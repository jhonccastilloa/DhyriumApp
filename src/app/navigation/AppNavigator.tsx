import {
  DefaultTheme,
  type Theme as NavigationTheme,
} from '@react-navigation/native';
import RootNavigator from './RootNavigator';
import { useUnistyles } from 'react-native-unistyles';

const AppNavigator = () => {
  const { theme } = useUnistyles();

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

  return <RootNavigator theme={navigationTheme} />;
};

export default AppNavigator;
