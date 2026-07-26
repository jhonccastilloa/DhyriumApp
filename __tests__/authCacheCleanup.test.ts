import StorageAdapter from '@/infrastructure/storage/StorageAdapter';
import PrivateCacheAdapter from '@/infrastructure/storage/PrivateCacheAdapter';
import { queryClient } from '@/infrastructure/query/queryClient';
import { AUTH_STORAGE_KEYS } from '@/modules/auth/constants/authStorageKeys';
import AuthService from '@/modules/auth/services/AuthService';
import { useAuthStore } from '@/modules/auth/state/useAuthStore';

jest.mock('sonner-native', () => ({
  toast: { error: jest.fn() },
}));

jest.mock('@/infrastructure/storage/PrivateCacheAdapter', () => ({
  __esModule: true,
  default: {
    clearAll: jest.fn(),
  },
}));

const privateCache = jest.mocked(PrivateCacheAdapter);

describe('authenticated private cache lifecycle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    privateCache.clearAll.mockResolvedValue();
  });

  afterEach(() => {
    StorageAdapter.removeItem(AUTH_STORAGE_KEYS.accessToken);
    StorageAdapter.removeItem(AUTH_STORAGE_KEYS.cacheScope);
    jest.restoreAllMocks();
  });

  it('stores a non-secret cache scope after login', async () => {
    jest.spyOn(AuthService, 'login').mockResolvedValue({
      id: 42,
      role: { id: 1, name: 'Usuario', hierarchy: 1 },
      password: '',
      email: 'user@example.com',
      profile: {
        firstName: 'Test',
        lastName: 'User',
        dni: '00000000',
        phone: '',
      },
      token: 'private-token',
    });

    await useAuthStore.getState().login('00000000', 'password');

    expect(StorageAdapter.getItem(AUTH_STORAGE_KEYS.cacheScope)).toBe(
      'user-42'
    );
  });

  it('clears remote queries and private files during logout', async () => {
    StorageAdapter.setItem(AUTH_STORAGE_KEYS.accessToken, 'private-token');
    StorageAdapter.setItem(AUTH_STORAGE_KEYS.cacheScope, 'user-42');
    const clearQueries = jest.spyOn(queryClient, 'clear');

    await useAuthStore.getState().logout();

    expect(clearQueries).toHaveBeenCalledTimes(1);
    expect(privateCache.clearAll).toHaveBeenCalledTimes(1);
    expect(StorageAdapter.getItem(AUTH_STORAGE_KEYS.accessToken)).toBeNull();
    expect(StorageAdapter.getItem(AUTH_STORAGE_KEYS.cacheScope)).toBeNull();
  });
});
