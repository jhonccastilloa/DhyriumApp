import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';

export type AuthNavigatorParamList = {
  Login: undefined;
  Register: undefined;
};

const AuthNavigator = createNativeStackNavigator({
  screenOptions: {
    headerShown: false,
  },
  screens: {
    Login: LoginScreen,
  },
});

export type AuthNavigatorNavigationProp =
  NativeStackNavigationProp<AuthNavigatorParamList>;

export default AuthNavigator;
