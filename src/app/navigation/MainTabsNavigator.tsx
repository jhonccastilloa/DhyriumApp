import { View } from 'react-native';
import {
  createBottomTabNavigator,
  type BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import type { NavigatorScreenParams } from '@react-navigation/native';
import {
  DotsThreeOutlineIcon,
  HouseIcon,
  ToolboxIcon,
  type Icon,
} from 'phosphor-react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import HomeNavigator, {
  type HomeNavigatorParamList,
} from '@/modules/home/navigation/HomeNavigator';
import ToolsScreen from '@/modules/tools/screens/ToolsScreen';
import MoreScreen from '@/modules/more/screens/MoreScreen';

export type MainTabsNavigatorParamList = {
  Inicio: NavigatorScreenParams<HomeNavigatorParamList> | undefined;
  Herramientas: undefined;
  Mas: undefined;
};

const Tab = createBottomTabNavigator<MainTabsNavigatorParamList>();

const TabRailIcon = ({
  icon: Icon,
  focused,
  color,
}: {
  icon: Icon;
  focused: boolean;
  color: string;
}) => (
  <View style={[styles.iconContainer, focused && styles.iconFocused]}>
    <Icon size={22} color={color} weight={focused ? 'fill' : 'regular'} />
    {focused ? <View style={styles.activeRail} /> : null}
  </View>
);

const MainTabsNavigator = () => {
  const { theme } = useUnistyles();
  const commonOptions: BottomTabNavigationOptions = {
    headerShown: false,
    tabBarActiveTintColor: theme.colors.navigation.active,
    tabBarInactiveTintColor: theme.colors.navigation.inactive,
    tabBarStyle: {
      height: 68,
      paddingTop: 6,
      borderTopWidth: theme.border.hairline,
      borderTopColor: theme.colors.border.subtle,
      backgroundColor: theme.colors.navigation.surface,
    },
    tabBarLabelStyle: theme.typography.menu,
    tabBarItemStyle: { minHeight: 52 },
    tabBarHideOnKeyboard: true,
  };

  return (
    <Tab.Navigator screenOptions={commonOptions}>
      <Tab.Screen
        name="Inicio"
        component={HomeNavigator}
        options={{
          title: 'Inicio',
          tabBarIcon: props => (
            <TabRailIcon icon={HouseIcon} {...props} />
          ),
        }}
      />
      <Tab.Screen
        name="Herramientas"
        component={ToolsScreen}
        options={{
          title: 'Herramientas',
          tabBarIcon: props => (
            <TabRailIcon icon={ToolboxIcon} {...props} />
          ),
        }}
      />
      <Tab.Screen
        name="Mas"
        component={MoreScreen}
        options={{
          title: 'Más',
          tabBarIcon: props => (
            <TabRailIcon icon={DotsThreeOutlineIcon} {...props} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create(theme => ({
  iconContainer: {
    position: 'relative',
    width: 52,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
  },
  iconFocused: { backgroundColor: theme.colors.navigation.rail },
  activeRail: {
    position: 'absolute',
    top: -7,
    width: 24,
    height: 3,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.navigation.active,
  },
}));

export default MainTabsNavigator;
