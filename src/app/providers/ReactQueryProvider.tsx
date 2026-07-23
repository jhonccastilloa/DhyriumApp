import {
  focusManager,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactNode, useEffect } from 'react';
import { AppState } from 'react-native';
interface ReactQueryProviderProps {
  children: ReactNode;
}

const queryClient = new QueryClient();
const ReactQueryProvider = ({ children }: ReactQueryProviderProps) => {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', status => {
      focusManager.setFocused(status === 'active');
    });

    return () => subscription.remove();
  }, []);
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default ReactQueryProvider;
