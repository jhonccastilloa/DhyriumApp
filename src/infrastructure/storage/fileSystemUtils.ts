import { FileSystem } from 'react-native-file-access';

const directoryPromises = new Map<string, Promise<void>>();

export const asFileUri = (path: string) =>
  path.startsWith('file://') ? path : `file://${path}`;

export const stripFileScheme = (uri: string) =>
  uri.replace(/^file:\/\//, '');

export const sanitizePathSegment = (
  value: string,
  fallback = 'default'
) => value.replace(/[^a-zA-Z0-9_-]/g, '_') || fallback;

export const ensureDirectory = (path: string) => {
  const existing = directoryPromises.get(path);
  if (existing) return existing;

  const pending = (async () => {
    if (!(await FileSystem.exists(path))) await FileSystem.mkdir(path);
  })();
  directoryPromises.set(path, pending);
  return pending.finally(() => {
    if (directoryPromises.get(path) === pending) {
      directoryPromises.delete(path);
    }
  });
};
