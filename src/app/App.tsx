import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toaster } from 'sonner-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import ReactQueryProvider from './providers/ReactQueryProvider';
import AppNavigator from './navigation/AppNavigator';

const App = () => {
  return (
    <GestureHandlerRootView>
      <ReactQueryProvider>
        <BottomSheetModalProvider>
          <KeyboardProvider>
            <SafeAreaProvider>
              <AppNavigator />
              <Toaster />
            </SafeAreaProvider>
          </KeyboardProvider>
        </BottomSheetModalProvider>
      </ReactQueryProvider>
    </GestureHandlerRootView>
  );
};

export default App;
