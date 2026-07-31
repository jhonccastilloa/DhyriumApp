import { Dirs, FileSystem } from 'react-native-file-access';
import { create } from 'zustand';
import StorageAdapter from '@/infrastructure/storage/StorageAdapter';
import {
  asFileUri,
  ensureDirectory,
  stripFileScheme,
} from '@/infrastructure/storage/fileSystemUtils';
import { DOCUMENT_COMPOSER_LIMITS } from '../constants/documentComposerLimits';
import { deriveComposerSource } from '../domain/composerSources';
import {
  appendPages,
  movePageToPosition,
  normalizePageOrder,
  removePage,
  replacePageRangeByIds,
} from '../domain/pageOrder';
import type {
  ComposerArtifact,
  ComposerDestination,
  ComposerPage,
  ComposerPdfSource,
  ComposerSession,
  ComposerSource,
} from '../types/documentComposer.types';

const DRAFTS_STORAGE_KEY = 'document-composer.drafts.v1';
const COMPOSER_ROOT = `${Dirs.DocumentDir}/dhyrium/composer`;

const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

type LegacyComposerSession = Omit<
  ComposerSession,
  'pdfSources' | 'contentUpdatedAt'
> & {
  pdfSources?: ComposerPdfSource[];
  sourceArtifact?: ComposerArtifact;
  contentUpdatedAt?: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isStoredSession = (value: unknown): value is LegacyComposerSession =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.name === 'string' &&
  typeof value.updatedAt === 'string' &&
  Array.isArray(value.pages);

const migrateDraft = (draft: LegacyComposerSession): ComposerSession => {
  const { sourceArtifact, ...currentDraft } = draft;
  if (draft.pdfSources) {
    return {
      ...currentDraft,
      pdfSources: draft.pdfSources,
      contentUpdatedAt: draft.contentUpdatedAt ?? draft.updatedAt,
      savedContentAt: draft.savedContentAt ?? draft.updatedAt,
    };
  }

  const firstPdfPage = draft.pages.find(
    page => page.origin === 'originalPdf',
  );
  const legacySource =
    sourceArtifact && firstPdfPage
      ? {
          id: `pdf-source-${sourceArtifact.id}`,
          uri: firstPdfPage.uri,
          fileName: sourceArtifact.name,
          artifact: sourceArtifact,
          createdAt: sourceArtifact.createdAt,
          ownedBySession: true,
        }
      : undefined;

  return {
    ...currentDraft,
    pdfSources: legacySource ? [legacySource] : [],
    pages: draft.pages.map(page =>
      page.origin === 'originalPdf' && legacySource
        ? { ...page, pdfSourceId: legacySource.id }
        : page,
    ),
    contentUpdatedAt: draft.updatedAt,
    savedContentAt: draft.updatedAt,
  };
};

const readDrafts = (): ComposerSession[] => {
  const stored = StorageAdapter.getItem(DRAFTS_STORAGE_KEY);
  if (!stored) return [];
  try {
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed)
      ? parsed.filter(isStoredSession).map(migrateDraft)
      : [];
  } catch {
    return [];
  }
};

const persistDrafts = (drafts: ComposerSession[]) => {
  StorageAdapter.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
};

type PdfSourceInput = {
  uri: string;
  fileName: string;
  artifact: ComposerArtifact;
  ownedBySession?: boolean;
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
  appendPdfSource: (input: PdfSourceInput) => Promise<void>;
  replaceWithPdfSource: (input: PdfSourceInput) => Promise<void>;
  refreshPdfSourceArtifact: (
    sourceId: string,
    artifact: ComposerArtifact,
  ) => void;
  addScannedPaths: (paths: string[]) => Promise<void>;
  replaceWithScannedPaths: (paths: string[]) => Promise<void>;
  applyNearbyPageOrder: (
    rangePageIds: string[],
    orderedPageIds: string[],
  ) => boolean;
  moveToPosition: (pageId: string, targetPosition: number) => void;
  deletePage: (pageId: string) => Promise<void>;
  markLegible: (pageId: string) => void;
  setName: (name: string) => void;
  updateProcess: (patch: Partial<ComposerSession>) => void;
  saveDraft: () => void;
  loadDraft: (sessionId: string) => void;
  removeDraft: (sessionId: string) => Promise<void>;
  discardSession: (options?: {
    preserveSavedDraft?: boolean;
  }) => Promise<void>;
  pruneMissingDrafts: () => Promise<void>;
};

const removeLocalFile = (uri: string) =>
  FileSystem.unlink(stripFileScheme(uri)).catch(() => undefined);

const cleanupSessionFiles = async (
  session: ComposerSession,
  preserveUris = new Set<string>(),
) => {
  const ownedUris = new Set([
    ...session.pages
      .filter(page => page.ownedBySession)
      .map(page => page.uri),
    ...session.pdfSources
      .filter(source => source.ownedBySession)
      .map(source => source.uri),
    ...(session.detachedLocalUris ?? []),
  ]);

  await Promise.all(
    [...ownedUris]
      .filter(uri => !preserveUris.has(uri))
      .map(removeLocalFile),
  );
};

const getOwnedSessionUris = (session: ComposerSession) =>
  new Set([
    ...session.pages
      .filter(page => page.ownedBySession)
      .map(page => page.uri),
    ...session.pdfSources
      .filter(source => source.ownedBySession)
      .map(source => source.uri),
  ]);

const appendDetachedUris = (
  session: ComposerSession,
  uris: Iterable<string>,
) => [...new Set([...(session.detachedLocalUris ?? []), ...uris])];

const touchSessionContent = (
  session: ComposerSession,
  patch: Partial<ComposerSession>,
) => {
  const now = new Date().toISOString();
  return {
    ...session,
    ...patch,
    updatedAt: now,
    contentUpdatedAt: now,
  };
};

const pruneUnusedPdfSources = (
  pages: ComposerPage[],
  pdfSources: ComposerPdfSource[],
) => {
  const usedSourceIds = new Set(
    pages.flatMap(page => (page.pdfSourceId ? [page.pdfSourceId] : [])),
  );
  return pdfSources.filter(source => usedSourceIds.has(source.id));
};

const updateSessionPages = (
  set: (partial: Partial<ComposerStore>) => void,
  get: () => ComposerStore,
  pages: ComposerPage[],
) => {
  const session = get().session;
  if (!session || pages === session.pages) return false;
  const pdfSources = pruneUnusedPdfSources(pages, session.pdfSources);
  set({
    session: touchSessionContent(session, {
      pages,
      pdfSources,
      source: deriveComposerSource(pages),
      artifact: undefined,
    }),
  });
  return true;
};

const copyScannedPaths = async (
  sessionId: string,
  paths: string[],
): Promise<ComposerPage[]> => {
  const sessionDir = `${COMPOSER_ROOT}/${sessionId}`;
  await ensureDirectory(`${Dirs.DocumentDir}/dhyrium`);
  await ensureDirectory(COMPOSER_ROOT);
  await ensureDirectory(sessionDir);
  const createdAt = new Date().toISOString();
  const pages: ComposerPage[] = [];
  try {
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
  } catch (error) {
    await Promise.all(pages.map(page => removeLocalFile(page.uri)));
    throw error;
  }
  return pages;
};

const createPdfSource = async (
  sessionId: string,
  input: PdfSourceInput,
): Promise<ComposerPdfSource> => {
  const id = `pdf-source-${createId()}`;
  const sessionDir = `${COMPOSER_ROOT}/${sessionId}`;
  const target = `${sessionDir}/${id}.pdf`;
  await ensureDirectory(`${Dirs.DocumentDir}/dhyrium`);
  await ensureDirectory(COMPOSER_ROOT);
  await ensureDirectory(sessionDir);
  await FileSystem.cp(stripFileScheme(input.uri), target);
  if ((input.ownedBySession ?? true) && stripFileScheme(input.uri) !== target) {
    await removeLocalFile(input.uri);
  }
  return {
    id,
    uri: asFileUri(target),
    fileName: input.fileName,
    artifact: input.artifact,
    createdAt: new Date().toISOString(),
    ownedBySession: true,
  };
};

const createPdfPages = (
  source: ComposerPdfSource,
  startOrder: number,
): ComposerPage[] =>
  Array.from({ length: source.artifact.pageCount }, (_, index) => ({
    id: `pdf-page-${source.id}-${index + 1}`,
    source: source.uri,
    uri: source.uri,
    fileName: `${source.fileName} · pág. ${index + 1}`,
    mimeType: 'application/pdf' as const,
    order: startOrder + index,
    legibilityStatus: 'legible' as const,
    origin: 'originalPdf' as const,
    pdfSourceId: source.id,
    originalPageNumber: index + 1,
    createdAt: source.createdAt,
    ownedBySession: false,
  }));

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
      pdfSources: [],
      pages: [],
      status: 'reviewing',
      uploadProgress: 0,
      createdAt: now,
      updatedAt: now,
      contentUpdatedAt: now,
      detachedLocalUris: [],
    };
    set({ session });
    return session;
  },

  appendPdfSource: async input => {
    const session = get().session;
    if (!session) return;
    if (
      session.pages.length + input.artifact.pageCount >
      DOCUMENT_COMPOSER_LIMITS.maxPages
    ) {
      throw new Error('El documento no puede superar 200 páginas.');
    }
    const source = await createPdfSource(session.id, input);
    const pages = appendPages(
      session.pages,
      createPdfPages(source, session.pages.length + 1),
    );
    const adoptPdfName = session.mode === 'tool' && session.pages.length === 0;
    set({
      session: touchSessionContent(session, {
        source: deriveComposerSource(pages),
        name: adoptPdfName
          ? input.fileName.replace(/\.pdf$/i, '')
          : session.name,
        pdfSources: [...session.pdfSources, source],
        pages,
        status: 'reviewing',
        uploadProgress: 0,
        artifact: undefined,
      }),
    });
  },

  replaceWithPdfSource: async input => {
    const session = get().session;
    if (!session) return;
    const source = await createPdfSource(session.id, input);
    const pages = createPdfPages(source, 1);
    const detachedLocalUris = appendDetachedUris(
      session,
      [...getOwnedSessionUris(session)].filter(uri => uri !== source.uri),
    );
    const adoptPdfName = session.mode === 'tool' && session.pages.length === 0;
    set({
      session: touchSessionContent(session, {
        source: 'pdf',
        name: adoptPdfName
          ? input.fileName.replace(/\.pdf$/i, '')
          : session.name,
        pdfSources: [source],
        pages,
        status: 'reviewing',
        uploadProgress: 0,
        artifact: undefined,
        detachedLocalUris,
      }),
    });
  },

  refreshPdfSourceArtifact: (sourceId, artifact) => {
    const session = get().session;
    if (!session) return;
    const replaceArtifact = (source: ComposerPdfSource) =>
      source.id === sourceId ? { ...source, artifact } : source;
    const drafts = get().drafts.map(draft =>
      draft.id === session.id
        ? {
            ...draft,
            pdfSources: draft.pdfSources.map(replaceArtifact),
          }
        : draft,
    );
    if (drafts.some((draft, index) => draft !== get().drafts[index])) {
      persistDrafts(drafts);
    }
    set({
      session: {
        ...session,
        pdfSources: session.pdfSources.map(replaceArtifact),
        updatedAt: new Date().toISOString(),
      },
      drafts,
    });
  },

  addScannedPaths: async paths => {
    const session = get().session;
    if (!session || paths.length === 0) return;
    if (
      session.pages.length + paths.length >
      DOCUMENT_COMPOSER_LIMITS.maxPages
    ) {
      throw new Error('El documento no puede superar 200 páginas.');
    }
    const added = await copyScannedPaths(session.id, paths);
    updateSessionPages(set, get, appendPages(get().session?.pages || [], added));
  },

  replaceWithScannedPaths: async paths => {
    const session = get().session;
    if (!session || paths.length === 0) return;
    if (paths.length > DOCUMENT_COMPOSER_LIMITS.maxPages) {
      throw new Error('El documento no puede superar 200 páginas.');
    }
    const added = await copyScannedPaths(session.id, paths);
    const addedUris = new Set(added.map(page => page.uri));
    const detachedLocalUris = appendDetachedUris(
      session,
      [...getOwnedSessionUris(session)].filter(
        uri => !addedUris.has(uri),
      ),
    );
    const pages = normalizePageOrder(added);
    set({
      session: touchSessionContent(session, {
        source: 'scanner',
        pdfSources: [],
        pages,
        status: 'reviewing',
        uploadProgress: 0,
        artifact: undefined,
        detachedLocalUris,
      }),
    });
  },

  applyNearbyPageOrder: (rangePageIds, orderedPageIds) => {
    const session = get().session;
    if (!session) return false;
    return updateSessionPages(
      set,
      get,
      replacePageRangeByIds(
        session.pages,
        rangePageIds,
        orderedPageIds,
      ),
    );
  },

  moveToPosition: (pageId, targetPosition) => {
    const session = get().session;
    if (!session) return;
    updateSessionPages(
      set,
      get,
      movePageToPosition(session.pages, pageId, targetPosition),
    );
  },

  deletePage: async pageId => {
    const session = get().session;
    const page = session?.pages.find(candidate => candidate.id === pageId);
    if (!session || !page) return;
    const pages = removePage(session.pages, pageId);
    const pdfSources = pruneUnusedPdfSources(pages, session.pdfSources);
    const removedSources = session.pdfSources.filter(
      source => !pdfSources.some(candidate => candidate.id === source.id),
    );
    const detachedLocalUris = appendDetachedUris(session, [
      ...(page.ownedBySession ? [page.uri] : []),
      ...removedSources
        .filter(source => source.ownedBySession)
        .map(source => source.uri),
    ]);
    set({
      session: touchSessionContent(session, {
        pages,
        pdfSources,
        source: deriveComposerSource(pages),
        artifact: undefined,
        detachedLocalUris,
      }),
    });
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
          : page,
      ),
    );
  },

  setName: name => {
    const session = get().session;
    if (session) {
      set({
        session: touchSessionContent(session, {
          name,
          artifact: undefined,
        }),
      });
    }
  },

  updateProcess: patch => {
    const session = get().session;
    if (session) {
      set({
        session: {
          ...session,
          ...patch,
          updatedAt: new Date().toISOString(),
        },
      });
    }
  },

  saveDraft: () => {
    const session = get().session;
    if (!session || session.pages.length === 0) return;
    const now = new Date().toISOString();
    const referencedUris = getOwnedSessionUris(session);
    const detachedUris = (session.detachedLocalUris ?? []).filter(
      uri => !referencedUris.has(uri),
    );
    Promise.all(detachedUris.map(removeLocalFile)).catch(() => undefined);
    const draft = {
      ...session,
      status: 'draft' as const,
      savedContentAt: session.contentUpdatedAt,
      updatedAt: now,
      detachedLocalUris: [],
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
    if (draft) await cleanupSessionFiles(draft);
    const drafts = get().drafts.filter(item => item.id !== sessionId);
    persistDrafts(drafts);
    set({ drafts });
  },

  discardSession: async options => {
    const session = get().session;
    if (!session) return;
    const preserveSavedDraft = options?.preserveSavedDraft ?? true;
    const savedDraft = preserveSavedDraft
      ? get().drafts.find(draft => draft.id === session.id)
      : undefined;
    await cleanupSessionFiles(
      session,
      savedDraft ? getOwnedSessionUris(savedDraft) : undefined,
    );
    if (preserveSavedDraft || !get().drafts.some(draft => draft.id === session.id)) {
      set({ session: null });
      return;
    }
    const drafts = get().drafts.filter(draft => draft.id !== session.id);
    persistDrafts(drafts);
    set({ session: null, drafts });
  },

  pruneMissingDrafts: async () => {
    const valid: ComposerSession[] = [];
    for (const draft of get().drafts) {
      const ownedUris = new Set([
        ...draft.pages
          .filter(page => page.ownedBySession)
          .map(page => page.uri),
        ...draft.pdfSources
          .filter(source => source.ownedBySession)
          .map(source => source.uri),
      ]);
      const checks = await Promise.all(
        [...ownedUris].map(uri =>
          FileSystem.exists(stripFileScheme(uri)),
        ),
      );
      if (checks.every(Boolean)) valid.push(draft);
    }
    persistDrafts(valid);
    set({ drafts: valid });
  },
}));
