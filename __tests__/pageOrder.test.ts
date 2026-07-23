import {
  appendPages,
  movePage,
  removePage,
} from '@/modules/document-composer/domain/pageOrder';
import type { ComposerPage } from '@/modules/document-composer/types/documentComposer.types';

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

describe('document composer page order', () => {
  it('appends new scans and renumbers them at the end', () => {
    const result = appendPages(
      [page('a', 1), page('b', 2)],
      [page('c', 99)]
    );
    expect(result.map(item => `${item.id}:${item.order}`)).toEqual([
      'a:1',
      'b:2',
      'c:3',
    ]);
  });

  it('moves only page metadata and keeps every URI unchanged', () => {
    const original = [page('a', 1), page('b', 2), page('c', 3)];
    const result = movePage(original, 2, 0);
    expect(result.map(item => item.id)).toEqual(['c', 'a', 'b']);
    expect(result.map(item => item.uri)).toEqual([
      'file:///c.jpg',
      'file:///a.jpg',
      'file:///b.jpg',
    ]);
    expect(result.map(item => item.order)).toEqual([1, 2, 3]);
  });

  it('deletes and renumbers the remaining pages', () => {
    const result = removePage(
      [page('a', 1), page('b', 2), page('c', 3)],
      'b'
    );
    expect(result.map(item => `${item.id}:${item.order}`)).toEqual([
      'a:1',
      'c:2',
    ]);
  });
});
