import type { StaticParamList } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import ContractsScreen from '@/modules/contracts/screens/ContractsScreen';
import ContractDetailScreen from '@/modules/contracts/screens/ContractDetailScreen';
import ContractLevelScreen from '@/modules/contracts/screens/ContractLevelScreen';

const HomeNavigator = createNativeStackNavigator({
  initialRouteName: 'Home',
  screenOptions: { headerShown: false },
  screens: {
    Home: HomeScreen,
    Contracts: ContractsScreen,
    ContractDetail: ContractDetailScreen,
    ContractLevel: ContractLevelScreen,
  },
});

export type HomeNavigatorParamList = StaticParamList<typeof HomeNavigator>;

export type HomeNavigatorNavigationProp = NativeStackNavigationProp<
  HomeNavigatorParamList
>;

export default HomeNavigator;
