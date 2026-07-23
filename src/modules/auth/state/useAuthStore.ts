import StorageAdapter from '@/infrastructure/storage/StorageAdapter';
import { AUTH_STORAGE_KEYS } from '@/modules/auth/constants/authStorageKeys';
import AuthService from '@/modules/auth/services/AuthService';
import { AuthStatus } from '@/modules/auth/types/authStatus.types';

import { create } from 'zustand';

interface AuthState {
  status: AuthStatus;
  token?: string;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkStatus: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, _get) => ({
  status: AuthStatus.unauthenticated,

  login: async (username: string, password: string) => {
    const data = await AuthService.login(username, password);

    set({
      status: AuthStatus.authenticated,
    });

    StorageAdapter.setItem(AUTH_STORAGE_KEYS.accessToken, data.token);

    return true;
  },

  logout: async () => {
    StorageAdapter.removeItem(AUTH_STORAGE_KEYS.accessToken);
    set({
      status: AuthStatus.unauthenticated,
    });
  },

  checkStatus: async () => {
    const token = StorageAdapter.getItem(AUTH_STORAGE_KEYS.accessToken);

    if (!token) {
      set({
        status: AuthStatus.unauthenticated,
      });
      return;
    }

    set({
      status: AuthStatus.authenticated,
    });
  },
}));
