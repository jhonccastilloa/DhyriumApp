import { View } from 'react-native';
import {
  createBottomTabNavigator,
  createBottomTabScreen,
  type BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import type { StaticParamList } from '@react-navigation/native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import AppIcon from '@/components/icons/AppIcon';
import type { IconName } from '@/components/icons/iconRegistry';
import HomeNavigator from '@/modules/home/navigation/HomeNavigator';
import ToolsScreen from '@/modules/tools/screens/ToolsScreen';
import MoreScreen from '@/modules/more/screens/MoreScreen';

const TabRailIcon = ({
  name,
  focused,
  color,
}: {
  name: IconName;
  focused: boolean;
  color: string;
}) => (
  <View style={[styles.iconContainer, focused && styles.iconFocused]}>
    <AppIcon
      name={name}
      size={22}
      mColor={color}
      variant={focused ? 'active' : 'default'}
    />
    {focused ? <View style={styles.activeRail} /> : null}
  </View>
);

const Tab = createBottomTabNavigator({
  screens: {
    Inicio: createBottomTabScreen({
      screen: HomeNavigator,
      options: {
        title: 'Inicio',
        tabBarIcon: props => <TabRailIcon name="home" {...props} />,
      },
    }),
    Herramientas: createBottomTabScreen({
      screen: ToolsScreen,
      options: {
        title: 'Herramientas',
        tabBarIcon: props => <TabRailIcon name="toolbox" {...props} />,
      },
    }),
    Mas: createBottomTabScreen({
      screen: MoreScreen,
      options: {
        title: 'Más',
        tabBarIcon: props => (
          <TabRailIcon name="dotsThreeOutline" {...props} />
        ),
      },
    }),
  },
});

const MainTabsNavigator = Tab.with(({ Navigator }) => {
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

  return <Navigator screenOptions={commonOptions} />;
});

export type MainTabsNavigatorParamList = StaticParamList<
  typeof MainTabsNavigator
>;

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
