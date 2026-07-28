import { useAuthStore } from '@/modules/auth/state/useAuthStore';
import { createStaticNavigation } from '@react-navigation/native';
import type { StaticParamList } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainAppNavigator from './MainAppNavigator';
import { AuthStatus } from '@/modules/auth/types/authStatus.types';
import AuthNavigator from '@/modules/auth/navigation/AuthNavigator';

const useIsSignedIn = () => {
  const { status } = useAuthStore();
  return status === AuthStatus.authenticated;
};

const useIsSignedOut = () => {
  const { status } = useAuthStore();
  return status === AuthStatus.unauthenticated;
};

const RootStack = createNativeStackNavigator({
  screenOptions: {
    headerShown: false,
  },
  screens: {
    SignIn: {
      if: useIsSignedIn,
      screen: MainAppNavigator,
      options: {
        headerShown: false,
      },
    },
    SignOut: {
      if: useIsSignedOut,
      screen: AuthNavigator,
      options: {
        headerShown: false,
      },
    },
  },
});

export type RootNavigatorParamList = StaticParamList<typeof RootStack>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootNavigatorParamList {}
  }
}

const RootNavigator = createStaticNavigation(RootStack);

export default RootNavigator;
