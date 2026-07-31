import { Dirs, FileSystem } from 'react-native-file-access';
import StorageAdapter from '@/infrastructure/storage/StorageAdapter';
import {
  asFileUri,
  ensureDirectory,
} from '@/infrastructure/storage/fileSystemUtils';
import api, { API_BASE_URL } from '@/infrastructure/http/apiClient';
import { AUTH_STORAGE_KEYS } from '@/modules/auth/constants/authStorageKeys';
import { buildDocumentManifest } from '../domain/documentManifest';
import type {
  ComposerArtifact,
  ComposerPdfSource,
  ComposerSession,
} from '../types/documentComposer.types';

type ArtifactApiResponse = {
  artifact: ComposerArtifact;
};

const asUploadUri = (uri: string) =>
  uri.startsWith('content://') ? uri : asFileUri(uri);

const absoluteApiUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) return path;
  const origin = API_BASE_URL.replace(/\/api\/v1\/?$/i, '');
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
};

class DocumentComposerService {
  static async registerPdf(input: {
    uri: string;
    fileName: string;
    idempotencyKey: string;
    onProgress?: (progress: number) => void;
  }) {
    const data = new FormData();
    data.append('name', input.fileName);
    data.append('idempotencyKey', input.idempotencyKey);
    data.append(
      'file',
      {
        uri: asUploadUri(input.uri),
        name: input.fileName,
        type: 'application/pdf',
      } as unknown as Blob
    );
    const response = await api.post<ArtifactApiResponse>(
      '/document-composer/sources/pdf',
      data,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          noLoader: true,
        },
        onUploadProgress: event => {
          if (event.total)
            input.onProgress?.(
              Math.round((event.loaded / event.total) * 100)
            );
        },
      }
    );
    return response.data.artifact;
  }

  static async compose(
    session: ComposerSession,
    onProgress?: (progress: number) => void
  ) {
    const ordered = [...session.pages].sort((a, b) => a.order - b.order);
    const manifest = buildDocumentManifest(session);
    const data = new FormData();
    data.append('name', session.name);
    data.append(
      'idempotencyKey',
      `${session.id}-${ordered
        .map(page => `${page.id}:${page.order}`)
        .join('|')}`
    );
    data.append('manifest', JSON.stringify(manifest));
    for (const page of ordered) {
      if (page.origin !== 'scanned') continue;
      data.append(
        'files',
        {
          uri: asUploadUri(page.uri),
          name: `${page.id}.jpg`,
          type: 'image/jpeg',
        } as unknown as Blob
      );
    }
    const response = await api.post<ArtifactApiResponse>(
      '/document-composer/artifacts',
      data,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          noLoader: true,
        },
        onUploadProgress: event => {
          if (event.total)
            onProgress?.(Math.round((event.loaded / event.total) * 100));
        },
      }
    );
    return response.data.artifact;
  }

  static async downloadArtifact(artifact: ComposerArtifact) {
    const directory = `${Dirs.CacheDir}/dhyrium/results`;
    await ensureDirectory(`${Dirs.CacheDir}/dhyrium`);
    await ensureDirectory(directory);
    const target = `${directory}/${artifact.id}-${artifact.name}`;
    const token = StorageAdapter.getItem(AUTH_STORAGE_KEYS.accessToken);
    const response = await FileSystem.fetch(
      absoluteApiUrl(artifact.downloadUrl),
      {
        method: 'GET',
        path: target,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
    );
    if (!response.ok) {
      throw new Error('No se pudo descargar el PDF.');
    }
    return target;
  }

  static async refreshExpiredPdfSources(
    session: ComposerSession,
    onProgress?: (progress: number) => void
  ) {
    const expiredSources = session.pdfSources.filter(source => {
      const expiresAt = source.artifact.expiresAt;
      return expiresAt !== null && new Date(expiresAt).getTime() <= Date.now();
    });
    const refreshed: {
      sourceId: string;
      artifact: ComposerArtifact;
    }[] = [];

    for (const [index, source] of expiredSources.entries()) {
      const artifact = await DocumentComposerService.registerPdf({
        uri: source.uri,
        fileName: source.fileName,
        idempotencyKey: `source-refresh-${source.id}-${Date.now()}`,
        onProgress: progress =>
          onProgress?.(
            Math.round(
              ((index + progress / 100) /
                Math.max(expiredSources.length, 1)) *
                100
            )
          ),
      });
      refreshed.push({ sourceId: source.id, artifact });
    }

    return refreshed;
  }

  static async cleanupTemporarySources(sources: ComposerPdfSource[]) {
    return DocumentComposerService.cleanupTemporaryArtifacts(
      sources.map(source => source.artifact)
    );
  }

  static async cleanupTemporaryArtifacts(artifacts: ComposerArtifact[]) {
    await Promise.all(
      artifacts
        .filter(artifact => artifact.status === 'TEMPORARY')
        .map(artifact =>
          api
            .delete(
              `/document-composer/artifacts/${encodeURIComponent(
                artifact.id
              )}`,
              {
                headers: {
                  noLoader: true,
                  suppressErrorToast: true,
                },
              }
            )
            .catch(() => undefined)
        )
    );
  }

  static async downloadContractPdf(input: {
    contractId: number;
    levelCode: string;
    name: string;
  }) {
    const directory = `${Dirs.DocumentDir}/dhyrium/contracts`;
    await ensureDirectory(`${Dirs.DocumentDir}/dhyrium`);
    await ensureDirectory(directory);
    const safeName =
      input.name.replace(/[^a-zA-Z0-9 _.-]/g, '').slice(0, 80) ||
      'documento';
    const target = `${directory}/${input.contractId}-${input.levelCode}-${safeName}.pdf`;
    const token = StorageAdapter.getItem(AUTH_STORAGE_KEYS.accessToken);
    const url = `/api/v1/contract-documents/contracts/${
      input.contractId
    }/nodes/${encodeURIComponent(input.levelCode)}/download`;
    const response = await FileSystem.fetch(absoluteApiUrl(url), {
      method: 'GET',
      path: target,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!response.ok) throw new Error('No se pudo descargar el PDF.');
    return target;
  }
}

export default DocumentComposerService;
