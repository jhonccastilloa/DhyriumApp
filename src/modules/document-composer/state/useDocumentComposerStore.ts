import { Dirs, FileSystem } from 'react-native-file-access';
import { create } from 'zustand';
import StorageAdapter from '@/infrastructure/storage/StorageAdapter';
import {
  appendPages,
  movePage,
  normalizePageOrder,
  removePage,
} from '../domain/pageOrder';
import type {
  ComposerDestination,
  ComposerPage,
  ComposerSession,
  ComposerSource,
} from '../types/documentComposer.types';

const DRAFTS_STORAGE_KEY = 'document-composer.drafts.v1';
const COMPOSER_ROOT = `${Dirs.DocumentDir}/dhyrium/composer`;

const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const readDrafts = (): ComposerSession[] => {
  const stored = StorageAdapter.getItem(DRAFTS_STORAGE_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const persistDrafts = (drafts: ComposerSession[]) => {
  StorageAdapter.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
};

const stripFileScheme = (uri: string) => uri.replace(/^file:\/\//, '');
const asFileUri = (path: string) =>
  path.startsWith('file://') ? path : `file://${path}`;
const ensureDirectory = async (path: string) => {
  if (!(await FileSystem.exists(path))) await FileSystem.mkdir(path);
};

type ComposerStore = {
  session: ComposerSession | null;
  drafts: ComposerSession[];
  createSession: (input: {
    mode: 'tool' | 'contract';
    source: ComposerSource;
    destination?: ComposerDestination;
    isEditingExisting?: boolean;
  }) => ComposerSession;
  setSourcePdf: (input: {
    uri: string;
    fileName: string;
    artifact: ComposerSession['sourceArtifact'];
  }) => void;
  addScannedPaths: (paths: string[]) => Promise<void>;
  replaceWithScannedPaths: (paths: string[]) => Promise<void>;
  reorder: (fromIndex: number, toIndex: number) => void;
  deletePage: (pageId: string) => Promise<void>;
  markLegible: (pageId: string) => void;
  setName: (name: string) => void;
  updateProcess: (patch: Partial<ComposerSession>) => void;
  saveDraft: () => void;
  loadDraft: (sessionId: string) => void;
  removeDraft: (sessionId: string) => Promise<void>;
  clearSession: () => void;
  pruneMissingDrafts: () => Promise<void>;
};

const updateSessionPages = (
  set: (partial: Partial<ComposerStore>) => void,
  get: () => ComposerStore,
  pages: ComposerPage[]
) => {
  const session = get().session;
  if (!session) return;
  set({
    session: {
      ...session,
      pages,
      updatedAt: new Date().toISOString(),
    },
  });
};

const copyScannedPaths = async (
  sessionId: string,
  paths: string[]
): Promise<ComposerPage[]> => {
  const sessionDir = `${COMPOSER_ROOT}/${sessionId}`;
  await ensureDirectory(`${Dirs.DocumentDir}/dhyrium`);
  await ensureDirectory(COMPOSER_ROOT);
  await ensureDirectory(sessionDir);
  const createdAt = new Date().toISOString();
  const pages: ComposerPage[] = [];
  for (const [index, source] of paths.entries()) {
    const id = createId();
    const target = `${sessionDir}/${id}.jpg`;
    await FileSystem.cp(stripFileScheme(source), target);
    pages.push({
      id,
      source,
      uri: asFileUri(target),
      fileName: `escaneo-${index + 1}.jpg`,
      mimeType: 'image/jpeg',
      order: index + 1,
      legibilityStatus: 'pending',
      origin: 'scanned',
      createdAt,
      ownedBySession: true,
    });
  }
  return pages;
};

export const useDocumentComposerStore = create<ComposerStore>((set, get) => ({
  session: null,
  drafts: readDrafts(),

  createSession: input => {
    const now = new Date().toISOString();
    const session: ComposerSession = {
      id: createId(),
      mode: input.mode,
      source: input.source,
      destination: input.destination,
      isEditingExisting: input.isEditingExisting,
      name: input.destination?.levelName || `Documento ${now.slice(0, 10)}`,
      pages: [],
      status: 'reviewing',
      uploadProgress: 0,
      createdAt: now,
      updatedAt: now,
    };
    set({ session });
    return session;
  },

  setSourcePdf: ({ uri, fileName, artifact }) => {
    const session = get().session;
    if (!session || !artifact) return;
    const now = new Date().toISOString();
    const pages = Array.from({ length: artifact.pageCount }, (_, index) => ({
      id: `pdf-${artifact.id}-${index + 1}`,
      source: uri,
      uri,
      fileName: `${fileName} · pág. ${index + 1}`,
      mimeType: 'application/pdf' as const,
      order: index + 1,
      legibilityStatus: 'legible' as const,
      origin: 'originalPdf' as const,
      originalPageNumber: index + 1,
      createdAt: now,
      ownedBySession: false,
    }));
    set({
      session: {
        ...session,
        source: 'pdf',
        sourceArtifact: artifact,
        name: fileName.replace(/\.pdf$/i, ''),
        pages,
        updatedAt: now,
      },
    });
  },

  addScannedPaths: async paths => {
    const session = get().session;
    if (!session || paths.length === 0) return;
    const added = await copyScannedPaths(session.id, paths);
    updateSessionPages(set, get, appendPages(get().session?.pages || [], added));
  },

  replaceWithScannedPaths: async paths => {
    const session = get().session;
    if (!session || paths.length === 0) return;
    for (const page of session.pages) {
      if (page.ownedBySession) {
        await FileSystem.unlink(stripFileScheme(page.uri)).catch(() => undefined);
      }
    }
    const added = await copyScannedPaths(session.id, paths);
    updateSessionPages(set, get, normalizePageOrder(added));
  },

  reorder: (fromIndex, toIndex) => {
    const session = get().session;
    if (!session) return;
    updateSessionPages(set, get, movePage(session.pages, fromIndex, toIndex));
  },

  deletePage: async pageId => {
    const session = get().session;
    const page = session?.pages.find(candidate => candidate.id === pageId);
    if (!session || !page) return;
    if (page.ownedBySession) {
      await FileSystem.unlink(stripFileScheme(page.uri)).catch(() => undefined);
    }
    updateSessionPages(set, get, removePage(session.pages, pageId));
  },

  markLegible: pageId => {
    const session = get().session;
    if (!session) return;
    updateSessionPages(
      set,
      get,
      session.pages.map(page =>
        page.id === pageId
          ? { ...page, legibilityStatus: 'legible' }
          : page
      )
    );
  },

  setName: name => {
    const session = get().session;
    if (session)
      set({
        session: { ...session, name, updatedAt: new Date().toISOString() },
      });
  },

  updateProcess: patch => {
    const session = get().session;
    if (session)
      set({
        session: {
          ...session,
          ...patch,
          updatedAt: new Date().toISOString(),
        },
      });
  },

  saveDraft: () => {
    const session = get().session;
    if (!session || session.pages.length === 0) return;
    const draft = {
      ...session,
      status: 'draft' as const,
      updatedAt: new Date().toISOString(),
    };
    const drafts = [
      draft,
      ...get().drafts.filter(item => item.id !== draft.id),
    ];
    persistDrafts(drafts);
    set({ session: draft, drafts });
  },

  loadDraft: sessionId => {
    const session = get().drafts.find(draft => draft.id === sessionId);
    if (session) set({ session: { ...session, status: 'reviewing' } });
  },

  removeDraft: async sessionId => {
    const draft = get().drafts.find(item => item.id === sessionId);
    if (draft) {
      for (const page of draft.pages) {
        if (page.ownedBySession) {
          await FileSystem.unlink(stripFileScheme(page.uri)).catch(
            () => undefined
          );
        }
      }
    }
    const drafts = get().drafts.filter(item => item.id !== sessionId);
    persistDrafts(drafts);
    set({ drafts });
  },

  clearSession: () => set({ session: null }),

  pruneMissingDrafts: async () => {
    const valid: ComposerSession[] = [];
    for (const draft of get().drafts) {
      const owned = draft.pages.filter(page => page.ownedBySession);
      const checks = await Promise.all(
        owned.map(page => FileSystem.exists(stripFileScheme(page.uri)))
      );
      if (checks.every(Boolean)) valid.push(draft);
    }
    persistDrafts(valid);
    set({ drafts: valid });
  },
}));
