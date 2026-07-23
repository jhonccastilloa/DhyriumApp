import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { NavigatorScreenParams } from '@react-navigation/native';
import MainTabsNavigator, {
  MainTabsNavigatorParamList,
} from './MainTabsNavigator';
// import AddTransactionScreen from '@/modules/addTransaction/screens/AddTransactionScreen';
// import AppHeader from '@/components/AppHeader';
// import SelectContactScreen from '@/modules/selectContact/screens/SelectContactScreen';
// import { Contact } from '@/validations/contactSchema';
// import ContactInfoScreen from '@/modules/contactInfo/screens/ContactInfoScreen';
// import { ContactWithBalance } from '@/interfaces/ContactWithBalance';
// import { Transaction } from '@/modules/contactInfo/interfaces/Transaction';
// import SharedLedgerDetailScreen from '@/modules/sharedLedgers/screens/SharedLedgerDetailScreen';
// import AddSharedTransactionScreen from '@/modules/sharedLedgers/screens/AddSharedTransactionScreen';
// import SharedRequestsInboxScreen from '@/modules/sharedLedgers/screens/SharedRequestsInboxScreen';
// import { SharedTransaction } from '@/modules/sharedLedgers/interfaces/SharedTransaction';
// import { useTranslation } from 'react-i18next';
// import DeviceContactsScreen from '@/modules/pendingBalances/screens/DeviceContactsScreen';
// import UpdatePhoneScreen from '@/modules/setting/screens/UpdatePhoneScreen';

export type MainAppNavigatorParamList = {
  MainTabs: NavigatorScreenParams<MainTabsNavigatorParamList> | undefined;
};
const Stack = createNativeStackNavigator<MainAppNavigatorParamList>();
const MainAppNavigator = () => {
  return (
    <Stack.Navigator
    // screenOptions={{
    //   header: AppHeader,
    // }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabsNavigator}
        options={{ headerShown: false }}
      />
      {/* <Stack.Screen
        name="AddTransaction"
        component={AddTransactionScreen}
        options={{ title: t('newTransaction') }}
      />
      <Stack.Screen
        name="SelectContact"
        component={SelectContactScreen}
        options={{ title: t('selectContact') }}
      />
      <Stack.Screen
        name="DeviceContacts"
        component={DeviceContactsScreen}
        options={{ title: t('deviceContacts') }}
      />
      <Stack.Screen
        name="ContactInfo"
        component={ContactInfoScreen}
        options={{ title: t('contactInfo') }}
      />
      <Stack.Screen
        name="SharedLedgerDetail"
        component={SharedLedgerDetailScreen}
        options={{ title: t('sharedDebtDetail') }}
      />
      <Stack.Screen
        name="SharedRequestsInbox"
        component={SharedRequestsInboxScreen}
        options={{ title: t('requestsInboxTitle') }}
      />
      <Stack.Screen
        name="UpdatePhone"
        component={UpdatePhoneScreen}
        options={{ title: t('updatePhoneTitle') }}
      />
      <Stack.Screen
        name="AddSharedTransaction"
        component={AddSharedTransactionScreen}
        options={{ title: t('newTransaction') }}
      /> */}
    </Stack.Navigator>
  );
};

export type MainAppNavigatorNavigationProp =
  NativeStackNavigationProp<MainAppNavigatorParamList>;

export default MainAppNavigator;
