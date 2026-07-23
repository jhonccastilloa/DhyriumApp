import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
export type HomeNavigatorParamList = {
  Home: undefined;
};

const Stack = createNativeStackNavigator<HomeNavigatorParamList>();

const HomeNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};
export default HomeNavigator;
