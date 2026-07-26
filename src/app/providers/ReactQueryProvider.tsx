import {
  focusManager,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactNode, useEffect } from 'react';
import { AppState } from 'react-native';
import { queryClient } from '@/infrastructure/query/queryClient';

interface ReactQueryProviderProps {
  children: ReactNode;
}

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
