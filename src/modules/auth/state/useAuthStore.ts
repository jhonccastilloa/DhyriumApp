import StorageAdapter from '@/infrastructure/storage/StorageAdapter';
import PrivateCacheAdapter from '@/infrastructure/storage/PrivateCacheAdapter';
import { queryClient } from '@/infrastructure/query/queryClient';
import { AUTH_STORAGE_KEYS } from '@/modules/auth/constants/authStorageKeys';
import AuthService from '@/modules/auth/services/AuthService';
import { AuthStatus } from '@/modules/auth/types/authStatus.types';

import { create } from 'zustand';

const createLegacyCacheScope = () =>
  `session-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;

interface AuthState {
  status: AuthStatus;
  token?: string;
  login: (dni: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkStatus: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, _get) => ({
  status: AuthStatus.checking,

  login: async (dni: string, password: string) => {
    const data = await AuthService.login(dni, password);

    queryClient.clear();
    StorageAdapter.setItem(AUTH_STORAGE_KEYS.accessToken, data.token);
    StorageAdapter.setItem(
      AUTH_STORAGE_KEYS.cacheScope,
      `user-${data.id}`
    );
    set({
      status: AuthStatus.authenticated,
    });

    return true;
  },

  logout: async () => {
    StorageAdapter.removeItem(AUTH_STORAGE_KEYS.accessToken);
    StorageAdapter.removeItem(AUTH_STORAGE_KEYS.cacheScope);
    queryClient.clear();
    set({
      status: AuthStatus.unauthenticated,
    });
    await PrivateCacheAdapter.clearAll();
  },

  checkStatus: async () => {
    const token = StorageAdapter.getItem(AUTH_STORAGE_KEYS.accessToken);

    if (!token) {
      set({
        status: AuthStatus.unauthenticated,
      });
      return;
    }

    if (!StorageAdapter.getItem(AUTH_STORAGE_KEYS.cacheScope)) {
      StorageAdapter.setItem(
        AUTH_STORAGE_KEYS.cacheScope,
        createLegacyCacheScope()
      );
    }
    set({
      status: AuthStatus.authenticated,
    });
  },
}));
