import type { FetchResult } from 'react-native-file-access';
import { FileSystem } from 'react-native-file-access';
import StorageAdapter from '@/infrastructure/storage/StorageAdapter';
import PrivateCacheAdapter from '@/infrastructure/storage/PrivateCacheAdapter';
import { AUTH_STORAGE_KEYS } from '@/modules/auth/constants/authStorageKeys';
import {
  buildPageThumbnailUrl,
  getPageThumbnail,
  getPageThumbnailCacheScope,
} from '@/modules/document-composer/services/pageThumbnailService';

jest.mock('sonner-native', () => ({
  toast: { error: jest.fn() },
}));

jest.mock('react-native-file-access', () => ({
  FileSystem: {
    exists: jest.fn(),
    fetchManaged: jest.fn(),
    mv: jest.fn(),
    statDir: jest.fn(),
    unlink: jest.fn(),
  },
}));

jest.mock('@/infrastructure/storage/PrivateCacheAdapter', () => ({
  __esModule: true,
  default: {
    getScopedDirectory: jest.fn(),
  },
}));

const fileSystem = jest.mocked(FileSystem);
const privateCache = jest.mocked(PrivateCacheAdapter);

const fetchResponse = (
  status: number,
  headers: Record<string, string> = {}
): FetchResult => ({
  getHeader: name => headers[name.toLocaleLowerCase()],
  headers,
  ok: status >= 200 && status < 300,
  redirected: false,
  status,
  statusText: '',
  url: '',
});

describe('document page thumbnail service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    StorageAdapter.setItem(AUTH_STORAGE_KEYS.accessToken, 'test-token');
    StorageAdapter.setItem(AUTH_STORAGE_KEYS.cacheScope, 'user-42');
    privateCache.getScopedDirectory.mockResolvedValue(
      '/private/user-42/thumbnails'
    );
    fileSystem.exists.mockResolvedValue(false);
    fileSystem.mv.mockResolvedValue();
    fileSystem.statDir.mockResolvedValue([]);
    fileSystem.unlink.mockResolvedValue();
  });

  afterEach(() => {
    StorageAdapter.removeItem(AUTH_STORAGE_KEYS.accessToken);
    StorageAdapter.removeItem(AUTH_STORAGE_KEYS.cacheScope);
  });

  it('builds the authenticated endpoint URL', () => {
    expect(buildPageThumbnailUrl('artifact/42', 8)).toBe(
      'http://127.0.0.1:8013/api/v1/document-composer/artifacts/artifact%2F42/pages/8/thumbnail'
    );
  });

  it('uses the current authentication scope for cache isolation', async () => {
    fileSystem.fetchManaged.mockReturnValue({
      cancel: jest.fn().mockResolvedValue(undefined),
      result: Promise.resolve(
        fetchResponse(200, { 'content-type': 'image/webp' })
      ),
    });

    const result = await getPageThumbnail({
      cacheScope: 'user-42',
      artifactId: 'artifact-1',
      pageNumber: 3,
    });

    expect(getPageThumbnailCacheScope()).toBe('user-42');
    expect(privateCache.getScopedDirectory).toHaveBeenCalledWith(
      'user-42',
      'document-composer-thumbnails'
    );
    expect(fileSystem.fetchManaged).toHaveBeenCalledWith(
      expect.stringContaining('/artifact-1/pages/3/thumbnail'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    );
    expect(result).toEqual({
      status: 'ready',
      uri: 'file:///private/user-42/thumbnails/artifact-1-3.webp',
    });
  });

  it('returns a cached thumbnail without downloading it again', async () => {
    fileSystem.exists.mockImplementation(async path =>
      path.endsWith('artifact-1-3.webp')
    );

    await expect(
      getPageThumbnail({
        cacheScope: 'user-42',
        artifactId: 'artifact-1',
        pageNumber: 3,
      })
    ).resolves.toEqual({
      status: 'ready',
      uri: 'file:///private/user-42/thumbnails/artifact-1-3.webp',
    });
    expect(fileSystem.fetchManaged).not.toHaveBeenCalled();
  });

  it('treats a 202 response as pending and respects Retry-After', async () => {
    fileSystem.fetchManaged.mockReturnValue({
      cancel: jest.fn().mockResolvedValue(undefined),
      result: Promise.resolve(fetchResponse(202, { 'retry-after': '2' })),
    });

    await expect(
      getPageThumbnail({
        cacheScope: 'user-42',
        artifactId: 'artifact-1',
        pageNumber: 3,
      })
    ).resolves.toEqual({ status: 'pending', retryAfterMs: 2000 });
  });

  it('cancels the native download when the query is aborted', async () => {
    let rejectRequest: (reason: Error) => void = () => undefined;
    const result = new Promise<FetchResult>((_resolve, reject) => {
      rejectRequest = reject;
    });
    const cancel = jest.fn(async () => {
      rejectRequest(new Error('cancelled'));
    });
    fileSystem.fetchManaged.mockReturnValue({ cancel, result });
    const controller = new AbortController();

    const thumbnail = getPageThumbnail({
      cacheScope: 'user-42',
      artifactId: 'artifact-1',
      pageNumber: 3,
      signal: controller.signal,
    });
    await new Promise<void>(resolve => setTimeout(resolve, 0));
    controller.abort();

    await expect(thumbnail).rejects.toThrow('cancelled');
    expect(cancel).toHaveBeenCalledTimes(1);
  });
});
