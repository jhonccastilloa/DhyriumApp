import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeNavigator from '@/modules/home/navigation/HomeNavigator';
import HomeScreen from '@/modules/home/screens/HomeScreen';

export type MainTabsNavigatorParamList = {
  Home: undefined;
  Prices: undefined;
  Settings: undefined;
};
// const isProd = MODE === 'production';
const Tab = createBottomTabNavigator<MainTabsNavigatorParamList>();

const MainTabsNavigator = () => {
  const baseTabBarStyle = {
    borderTopWidth: 1,
    height: 70,
    paddingTop: 10,
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: baseTabBarStyle,

        tabBarInactiveTintColor: '#ffffff99',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeNavigator}
        options={{
          title: 'home',
        }}
      />

      <Tab.Screen
        name="Settings"
        component={HomeScreen}
        options={{
          title: 'settings',
          // tabBarIcon: ({ color, size }) => (
          //   <AppIcon name={'slidersHorizontal'} mColor={color} size={size} />
          // ),
          headerShown: true,
          // header: props => <AppHeader {...props} iconBack={false} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabsNavigator;
