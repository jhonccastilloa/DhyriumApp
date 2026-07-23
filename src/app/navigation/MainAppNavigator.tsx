import {
  createNativeStackNavigator,
  type NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import type { NavigatorScreenParams } from '@react-navigation/native';
import MainTabsNavigator, {
  type MainTabsNavigatorParamList,
} from './MainTabsNavigator';
import ComposerReviewScreen from '@/modules/document-composer/screens/ComposerReviewScreen';
import ComposerProcessScreen from '@/modules/document-composer/screens/ComposerProcessScreen';
import ComposerResultScreen from '@/modules/document-composer/screens/ComposerResultScreen';
import PagePreviewScreen from '@/modules/document-composer/screens/PagePreviewScreen';
import GeneratedPdfViewerScreen from '@/modules/document-composer/screens/GeneratedPdfViewerScreen';
import ComposerDraftsScreen from '@/modules/document-composer/screens/ComposerDraftsScreen';
import ContractPdfViewerScreen from '@/modules/contracts/screens/ContractPdfViewerScreen';
import type {
  ComposerArtifact,
  ComposerDestination,
} from '@/modules/document-composer/types/documentComposer.types';

export type MainAppNavigatorParamList = {
  MainTabs: NavigatorScreenParams<MainTabsNavigatorParamList> | undefined;
  ComposerReview: {
    mode: 'tool' | 'contract';
    source: 'scanner' | 'pdf';
    destination?: ComposerDestination;
    useCurrent?: boolean;
    resumeSessionId?: string;
  };
  ComposerProcess: undefined;
  ComposerResult: undefined;
  PagePreview: { pageId: string };
  GeneratedPdfViewer: { artifact: ComposerArtifact };
  ComposerDrafts: undefined;
  ContractPdfViewer: {
    contractId: number;
    levelCode: string;
    name: string;
  };
};

const Stack = createNativeStackNavigator<MainAppNavigatorParamList>();

const MainAppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs" component={MainTabsNavigator} />
    <Stack.Screen
      name="ComposerReview"
      component={ComposerReviewScreen}
      options={{ gestureEnabled: false }}
    />
    <Stack.Screen
      name="ComposerProcess"
      component={ComposerProcessScreen}
      options={{ gestureEnabled: false }}
    />
    <Stack.Screen
      name="ComposerResult"
      component={ComposerResultScreen}
      options={{ gestureEnabled: false }}
    />
    <Stack.Screen name="PagePreview" component={PagePreviewScreen} />
    <Stack.Screen
      name="GeneratedPdfViewer"
      component={GeneratedPdfViewerScreen}
    />
    <Stack.Screen name="ComposerDrafts" component={ComposerDraftsScreen} />
    <Stack.Screen
      name="ContractPdfViewer"
      component={ContractPdfViewerScreen}
    />
  </Stack.Navigator>
);

export type MainAppNavigatorNavigationProp =
  NativeStackNavigationProp<MainAppNavigatorParamList>;

export default MainAppNavigator;
