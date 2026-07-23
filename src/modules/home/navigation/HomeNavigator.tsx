import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import ContractsScreen from '@/modules/contracts/screens/ContractsScreen';
import ContractDetailScreen from '@/modules/contracts/screens/ContractDetailScreen';
import ContractLevelScreen from '@/modules/contracts/screens/ContractLevelScreen';
export type HomeNavigatorParamList = {
  Home: undefined;
  Contracts: undefined;
  ContractDetail: { contractId: number };
  ContractLevel: {
    contractId: number;
    parentCode: string;
    path: string[];
  };
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
      <Stack.Screen
        name="Contracts"
        component={ContractsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ContractDetail"
        component={ContractDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ContractLevel"
        component={ContractLevelScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};
export default HomeNavigator;
