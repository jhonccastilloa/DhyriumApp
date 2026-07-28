import {
  createNativeStackNavigator,
  type NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import type { StaticParamList } from '@react-navigation/native';
import LoginScreen from '../screens/LoginScreen';

const AuthNavigator = createNativeStackNavigator({
  screenOptions: {
    headerShown: false,
  },
  screens: {
    Login: LoginScreen,
  },
});

export type AuthNavigatorParamList = StaticParamList<typeof AuthNavigator>;

export type AuthNavigatorNavigationProp =
  NativeStackNavigationProp<AuthNavigatorParamList>;

export default AuthNavigator;
