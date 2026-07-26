import { Dirs, FileSystem } from 'react-native-file-access';
import {
  ensureDirectory,
  sanitizePathSegment,
} from './fileSystemUtils';

const PRIVATE_CACHE_ROOT = `${Dirs.CacheDir}/dhyrium/private`;

const removeDirectoryTree = async (path: string): Promise<void> => {
  if (!(await FileSystem.exists(path))) return;
  const entries = await FileSystem.statDir(path);
  for (const entry of entries) {
    if (entry.type === 'directory') await removeDirectoryTree(entry.path);
    else await FileSystem.unlink(entry.path).catch(() => undefined);
  }
  await FileSystem.unlink(path).catch(() => undefined);
};

class PrivateCacheAdapter {
  static async getScopedDirectory(scope: string, namespace: string) {
    const root = `${Dirs.CacheDir}/dhyrium`;
    const scopeDirectory = `${PRIVATE_CACHE_ROOT}/${sanitizePathSegment(
      scope
    )}`;
    const namespaceDirectory = `${scopeDirectory}/${sanitizePathSegment(
      namespace
    )}`;
    await ensureDirectory(root);
    await ensureDirectory(PRIVATE_CACHE_ROOT);
    await ensureDirectory(scopeDirectory);
    await ensureDirectory(namespaceDirectory);
    return namespaceDirectory;
  }

  static async clearAll() {
    await removeDirectoryTree(PRIVATE_CACHE_ROOT);
  }
}

export default PrivateCacheAdapter;
