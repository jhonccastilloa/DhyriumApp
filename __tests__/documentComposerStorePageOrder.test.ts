import { useDocumentComposerStore } from '@/modules/document-composer/state/useDocumentComposerStore';
import type {
  ComposerArtifact,
  ComposerPage,
  ComposerSession,
} from '@/modules/document-composer/types/documentComposer.types';
import { FileSystem } from 'react-native-file-access';

jest.mock('react-native-file-access', () => ({
  Dirs: { DocumentDir: '/documents' },
  FileSystem: {
    cp: jest.fn(() => Promise.resolve()),
    exists: jest.fn(() => Promise.resolve(true)),
    mkdir: jest.fn(() => Promise.resolve()),
    unlink: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('@/infrastructure/storage/StorageAdapter', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
  },
}));

const page = (id: string, order: number): ComposerPage => ({
  id,
  source: `${id}.jpg`,
  uri: `file:///${id}.jpg`,
  fileName: `${id}.jpg`,
  mimeType: 'image/jpeg',
  order,
  legibilityStatus: 'pending',
  origin: 'scanned',
  createdAt: '2026-07-23T00:00:00.000Z',
  ownedBySession: true,
});

const createSession = (): ComposerSession => ({
  id: 'session',
  mode: 'tool',
  source: 'scanner',
  name: 'Document',
  pdfSources: [],
  pages: [
    page('a', 1),
    page('b', 2),
    page('c', 3),
    page('d', 4),
    page('e', 5),
  ],
  status: 'reviewing',
  uploadProgress: 0,
  createdAt: '2026-07-23T00:00:00.000Z',
  updatedAt: '2026-07-23T00:00:00.000Z',
  contentUpdatedAt: '2026-07-23T00:00:00.000Z',
});

const artifact = (id: string, pageCount = 1): ComposerArtifact => ({
  id,
  name: `${id}.pdf`,
  status: 'TEMPORARY',
  type: 'ORIGINAL_PDF',
  mimeType: 'application/pdf',
  sizeBytes: 100,
  pageCount,
  createdAt: '2026-07-23T00:00:00.000Z',
  expiresAt: '2026-07-24T00:00:00.000Z',
  downloadUrl: `/artifacts/${id}`,
});

describe('document composer nearby page order store action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useDocumentComposerStore.setState({
      session: createSession(),
      drafts: [],
    });
  });

  it('updates Zustand once for a valid complete order', () => {
    const before = useDocumentComposerStore.getState().session!.pages;
    const listener = jest.fn();
    const unsubscribe = useDocumentComposerStore.subscribe(listener);

    const applied = useDocumentComposerStore
      .getState()
      .applyNearbyPageOrder(['b', 'c', 'd'], ['d', 'b', 'c']);

    expect(applied).toBe(true);
    const after = useDocumentComposerStore.getState().session!.pages;
    expect(listener).toHaveBeenCalledTimes(1);
    expect(after.map(item => `${item.id}:${item.order}`)).toEqual([
      'a:1',
      'd:2',
      'b:3',
      'c:4',
      'e:5',
    ]);
    expect(after[0]).toBe(before[0]);
    expect(after[4]).toBe(before[4]);
    unsubscribe();
  });

  it.each([
    {
      range: ['b', 'c', 'd'],
      order: ['b', 'c', 'd'],
    },
    {
      range: ['b', 'c', 'd'],
      order: ['d', 'b'],
    },
    {
      range: ['b', 'c', 'd'],
      order: ['d', 'b', 'b'],
    },
    {
      range: ['b', 'c', 'd'],
      order: ['d', 'missing', 'b'],
    },
    {
      range: ['a', 'd'],
      order: ['d', 'a'],
    },
  ])('does not update Zustand for $order', ({ range, order }) => {
    const before = useDocumentComposerStore.getState().session;
    const listener = jest.fn();
    const unsubscribe = useDocumentComposerStore.subscribe(listener);

    const applied = useDocumentComposerStore
      .getState()
      .applyNearbyPageOrder(range, order);

    expect(applied).toBe(false);
    expect(listener).not.toHaveBeenCalled();
    expect(useDocumentComposerStore.getState().session).toBe(before);
    unsubscribe();
  });

  it('uses the same action to undo the immediately previous drop', () => {
    const action =
      useDocumentComposerStore.getState().applyNearbyPageOrder;
    const range = ['b', 'c', 'd'];
    const originalOrder = [...range];

    action(range, ['d', 'b', 'c']);
    const listener = jest.fn();
    const unsubscribe = useDocumentComposerStore.subscribe(listener);
    action(range, originalOrder);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(
      useDocumentComposerStore
        .getState()
        .session!.pages.map(item => item.id)
    ).toEqual(['a', 'b', 'c', 'd', 'e']);
    unsubscribe();
  });

  it('combines multiple PDFs and scans while preserving the first name', async () => {
    const store = useDocumentComposerStore.getState();
    store.createSession({ mode: 'tool', source: 'pdf' });
    await store.appendPdfSource({
      uri: 'file:///first.pdf',
      fileName: 'Primero.pdf',
      artifact: artifact('first'),
    });
    await useDocumentComposerStore.getState().appendPdfSource({
      uri: 'file:///second.pdf',
      fileName: 'Segundo.pdf',
      artifact: artifact('second'),
    });
    await useDocumentComposerStore
      .getState()
      .addScannedPaths(['/scanner/page.jpg']);

    const session = useDocumentComposerStore.getState().session!;
    expect(session.name).toBe('Primero');
    expect(session.source).toBe('mixed');
    expect(session.pdfSources.map(source => source.artifact.id)).toEqual([
      'first',
      'second',
    ]);
    expect(session.pages.map(item => item.origin)).toEqual([
      'originalPdf',
      'originalPdf',
      'scanned',
    ]);
  });

  it('discards new edits without deleting files from the saved draft', async () => {
    const store = useDocumentComposerStore.getState();
    store.createSession({ mode: 'tool', source: 'pdf' });
    await store.appendPdfSource({
      uri: 'file:///saved.pdf',
      fileName: 'Guardado.pdf',
      artifact: artifact('saved'),
    });
    const savedUri =
      useDocumentComposerStore.getState().session!.pdfSources[0].uri;
    useDocumentComposerStore.getState().saveDraft();
    await useDocumentComposerStore.getState().appendPdfSource({
      uri: 'file:///new.pdf',
      fileName: 'Nuevo.pdf',
      artifact: artifact('new'),
    });
    const newUri =
      useDocumentComposerStore.getState().session!.pdfSources[1].uri;
    jest.clearAllMocks();

    await useDocumentComposerStore.getState().discardSession();

    expect(FileSystem.unlink).toHaveBeenCalledWith(
      newUri.replace(/^file:\/\//, ''),
    );
    expect(FileSystem.unlink).not.toHaveBeenCalledWith(
      savedUri.replace(/^file:\/\//, ''),
    );
    expect(useDocumentComposerStore.getState().drafts).toHaveLength(1);
    expect(useDocumentComposerStore.getState().session).toBeNull();
  });

  it('keeps the current content when a replacement PDF cannot be copied', async () => {
    const store = useDocumentComposerStore.getState();
    store.createSession({ mode: 'tool', source: 'pdf' });
    await store.appendPdfSource({
      uri: 'file:///current.pdf',
      fileName: 'Actual.pdf',
      artifact: artifact('current'),
    });
    const before = useDocumentComposerStore.getState().session;
    (FileSystem.cp as jest.Mock).mockRejectedValueOnce(
      new Error('copy failed'),
    );

    await expect(
      useDocumentComposerStore.getState().replaceWithPdfSource({
        uri: 'file:///replacement.pdf',
        fileName: 'Reemplazo.pdf',
        artifact: artifact('replacement'),
      }),
    ).rejects.toThrow('copy failed');

    expect(useDocumentComposerStore.getState().session).toBe(before);
  });

  it('rejects additions that would exceed the backend page limit', async () => {
    const store = useDocumentComposerStore.getState();
    store.createSession({ mode: 'tool', source: 'pdf' });
    await store.appendPdfSource({
      uri: 'file:///full.pdf',
      fileName: 'Completo.pdf',
      artifact: artifact('full', 200),
    });

    await expect(
      useDocumentComposerStore.getState().appendPdfSource({
        uri: 'file:///extra.pdf',
        fileName: 'Extra.pdf',
        artifact: artifact('extra'),
      }),
    ).rejects.toThrow('El documento no puede superar 200 páginas.');

    expect(
      useDocumentComposerStore.getState().session!.pdfSources,
    ).toHaveLength(1);
    expect(useDocumentComposerStore.getState().session!.pages).toHaveLength(
      200,
    );
  });
});
