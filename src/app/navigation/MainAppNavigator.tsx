import {
  createNativeStackNavigator,
  createNativeStackScreen,
  type NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import type { StaticParamList } from '@react-navigation/native';
import MainTabsNavigator from './MainTabsNavigator';
import ComposerReviewScreen from '@/modules/document-composer/screens/ComposerReviewScreen';
import ComposerProcessScreen from '@/modules/document-composer/screens/ComposerProcessScreen';
import ComposerResultScreen from '@/modules/document-composer/screens/ComposerResultScreen';
import PagePreviewScreen from '@/modules/document-composer/screens/PagePreviewScreen';
import GeneratedPdfViewerScreen from '@/modules/document-composer/screens/GeneratedPdfViewerScreen';
import ComposerDraftsScreen from '@/modules/document-composer/screens/ComposerDraftsScreen';
import NearbyPageReorderScreen from '@/modules/document-composer/screens/NearbyPageReorderScreen';
import ContractPdfViewerScreen from '@/modules/contracts/screens/ContractPdfViewerScreen';

const MainAppNavigator = createNativeStackNavigator({
  screenOptions: { headerShown: false },
  screens: {
    MainTabs: MainTabsNavigator,
    ComposerReview: createNativeStackScreen({
      screen: ComposerReviewScreen,
      options: { gestureEnabled: false },
    }),
    ComposerProcess: createNativeStackScreen({
      screen: ComposerProcessScreen,
      options: { gestureEnabled: false },
    }),
    ComposerResult: createNativeStackScreen({
      screen: ComposerResultScreen,
      options: { gestureEnabled: false },
    }),
    PagePreview: PagePreviewScreen,
    GeneratedPdfViewer: GeneratedPdfViewerScreen,
    ComposerDrafts: ComposerDraftsScreen,
    NearbyPageReorder: createNativeStackScreen({
      screen: NearbyPageReorderScreen,
      options: { gestureEnabled: false },
    }),
    ContractPdfViewer: ContractPdfViewerScreen,
  },
});

export type MainAppNavigatorParamList = StaticParamList<
  typeof MainAppNavigator
>;

export type MainAppNavigatorNavigationProp =
  NativeStackNavigationProp<MainAppNavigatorParamList>;

export default MainAppNavigator;
