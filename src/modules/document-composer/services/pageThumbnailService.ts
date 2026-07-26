import { FileSystem } from 'react-native-file-access';
import StorageAdapter from '@/infrastructure/storage/StorageAdapter';
import PrivateCacheAdapter from '@/infrastructure/storage/PrivateCacheAdapter';
import {
  asFileUri,
  sanitizePathSegment,
} from '@/infrastructure/storage/fileSystemUtils';
import { API_BASE_URL } from '@/infrastructure/http/apiClient';
import { AUTH_STORAGE_KEYS } from '@/modules/auth/constants/authStorageKeys';

const DEFAULT_RETRY_AFTER_MS = 1500;
const MAX_CACHED_THUMBNAILS = 300;
const PRUNE_AFTER_DOWNLOADS = 25;
let downloadsSincePrune = 0;

export type PageThumbnailResult =
  | { status: 'ready'; uri: string }
  | { status: 'pending'; retryAfterMs: number }
  | { status: 'unavailable' };

export const buildPageThumbnailUrl = (
  artifactId: string,
  pageNumber: number
) =>
  `${API_BASE_URL.replace(/\/$/, '')}/document-composer/artifacts/${encodeURIComponent(
    artifactId
  )}/pages/${pageNumber}/thumbnail`;

export const getPageThumbnailCacheScope = () =>
  StorageAdapter.getItem(AUTH_STORAGE_KEYS.cacheScope) || undefined;

const getRetryAfterMs = (value?: string) => {
  if (!value) return DEFAULT_RETRY_AFTER_MS;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.max(seconds * 1000, 500);
  }
  const retryAt = Date.parse(value);
  return Number.isNaN(retryAt)
    ? DEFAULT_RETRY_AFTER_MS
    : Math.max(retryAt - Date.now(), 500);
};

const findCachedThumbnail = async (basePath: string) => {
  for (const extension of ['webp', 'jpg']) {
    const path = `${basePath}.${extension}`;
    if (await FileSystem.exists(path)) return path;
  }
  return undefined;
};

const getThumbnailExtension = (contentType?: string) =>
  contentType?.toLocaleLowerCase().includes('webp') ? 'webp' : 'jpg';

const pruneThumbnailCache = async (directory: string) => {
  downloadsSincePrune++;
  if (downloadsSincePrune < PRUNE_AFTER_DOWNLOADS) return;
  downloadsSincePrune = 0;

  const files = (await FileSystem.statDir(directory))
    .filter(entry => entry.type === 'file')
    .sort((left, right) => right.lastModified - left.lastModified);
  await Promise.all(
    files
      .slice(MAX_CACHED_THUMBNAILS)
      .map(file => FileSystem.unlink(file.path).catch(() => undefined))
  );
};

export const getPageThumbnail = async (input: {
  cacheScope: string;
  artifactId: string;
  pageNumber: number;
  signal?: AbortSignal;
}): Promise<PageThumbnailResult> => {
  const token = StorageAdapter.getItem(AUTH_STORAGE_KEYS.accessToken);
  if (!token) return { status: 'unavailable' };

  const cacheDirectory = await PrivateCacheAdapter.getScopedDirectory(
    input.cacheScope,
    'document-composer-thumbnails'
  );
  const safeArtifactId = sanitizePathSegment(
    input.artifactId,
    'artifact'
  );
  const basePath = `${cacheDirectory}/${safeArtifactId}-${input.pageNumber}`;
  const cachedPath = await findCachedThumbnail(basePath);
  if (cachedPath) return { status: 'ready', uri: asFileUri(cachedPath) };

  const temporaryPath = `${basePath}-${Date.now()}.part`;
  const request = FileSystem.fetchManaged(
    buildPageThumbnailUrl(input.artifactId, input.pageNumber),
    {
      method: 'GET',
      path: temporaryPath,
      headers: {
        Accept: 'image/webp,image/jpeg',
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const cancelRequest = () => {
    request.cancel().catch(() => undefined);
  };
  input.signal?.addEventListener('abort', cancelRequest, { once: true });

  try {
    const response = await request.result;
    if (response.status === 200) {
      const extension = getThumbnailExtension(
        response.getHeader('content-type')
      );
      const finalPath = `${basePath}.${extension}`;
      await FileSystem.mv(temporaryPath, finalPath);
      await pruneThumbnailCache(cacheDirectory).catch(() => undefined);
      return { status: 'ready', uri: asFileUri(finalPath) };
    }

    await FileSystem.unlink(temporaryPath).catch(() => undefined);
    if (response.status === 202) {
      return {
        status: 'pending',
        retryAfterMs: getRetryAfterMs(response.getHeader('retry-after')),
      };
    }
    if ([401, 403, 404].includes(response.status)) {
      return { status: 'unavailable' };
    }
    throw new Error('No se pudo obtener la miniatura de la página.');
  } catch (error) {
    await FileSystem.unlink(temporaryPath).catch(() => undefined);
    throw error;
  } finally {
    input.signal?.removeEventListener('abort', cancelRequest);
  }
};
