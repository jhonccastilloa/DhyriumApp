import { useDocumentComposerStore } from '@/modules/document-composer/state/useDocumentComposerStore';
import type {
  ComposerPage,
  ComposerSession,
} from '@/modules/document-composer/types/documentComposer.types';

jest.mock('react-native-file-access', () => ({
  Dirs: { DocumentDir: '/documents' },
  FileSystem: {
    cp: jest.fn(),
    exists: jest.fn(),
    unlink: jest.fn(),
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
});

describe('document composer nearby page order store action', () => {
  beforeEach(() => {
    useDocumentComposerStore.setState({ session: createSession() });
  });

  it('updates Zustand once for a valid complete order', () => {
    const before = useDocumentComposerStore.getState().session!.pages;
    const listener = jest.fn();
    const unsubscribe = useDocumentComposerStore.subscribe(listener);

    useDocumentComposerStore
      .getState()
      .applyNearbyPageOrder(['b', 'c', 'd'], ['d', 'b', 'c']);

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

    useDocumentComposerStore
      .getState()
      .applyNearbyPageOrder(range, order);

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
});
