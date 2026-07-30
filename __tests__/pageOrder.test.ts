import {
  appendPages,
  getNearbyPages,
  movePageToPosition,
  removePage,
  replacePageRangeByIds,
  resolvePageOrderFromPositions,
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

  describe('nearby page window', () => {
    const pages = (count: number) =>
      Array.from({ length: count }, (_, index) =>
        page(`page-${index + 1}`, index + 1)
      );

    it('returns every page when the document has fewer than nine', () => {
      expect(getNearbyPages(pages(5), 'page-3').map(item => item.id)).toEqual([
        'page-1',
        'page-2',
        'page-3',
        'page-4',
        'page-5',
      ]);
    });

    it('fills the window forward when the selected page is at the start', () => {
      expect(getNearbyPages(pages(12), 'page-1').map(item => item.id)).toEqual(
        Array.from({ length: 9 }, (_, index) => `page-${index + 1}`)
      );
    });

    it('centers the selected page when possible', () => {
      expect(
        getNearbyPages(pages(1000), 'page-500').map(item => item.id)
      ).toEqual(
        Array.from({ length: 9 }, (_, index) => `page-${index + 496}`)
      );
    });

    it('fills the window backward when the selected page is at the end', () => {
      expect(
        getNearbyPages(pages(12), 'page-12').map(item => item.id)
      ).toEqual(
        Array.from({ length: 9 }, (_, index) => `page-${index + 4}`)
      );
    });
  });

  it('replaces a contiguous range using stable IDs', () => {
    const original = [
      page('a', 1),
      page('b', 2),
      page('c', 3),
      page('d', 4),
      page('e', 5),
    ];
    const result = replacePageRangeByIds(
      original,
      ['b', 'c', 'd'],
      ['d', 'b', 'c']
    );

    expect(result.map(item => `${item.id}:${item.order}`)).toEqual([
      'a:1',
      'd:2',
      'b:3',
      'c:4',
      'e:5',
    ]);
    expect(result[0]).toBe(original[0]);
    expect(result[4]).toBe(original[4]);
    expect(original.map(item => item.id)).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('reuses the original array when the range order did not change', () => {
    const original = [page('a', 1), page('b', 2), page('c', 3)];

    expect(
      replacePageRangeByIds(
        original,
        ['a', 'b', 'c'],
        ['a', 'b', 'c']
      )
    ).toBe(original);
  });

  it('ignores an invalid non-contiguous range', () => {
    const original = [
      page('a', 1),
      page('b', 2),
      page('c', 3),
      page('d', 4),
    ];
    const result = replacePageRangeByIds(
      original,
      ['a', 'd'],
      ['d', 'a']
    );

    expect(result).toBe(original);
  });

  it('rejects duplicate, unknown, or incomplete range results', () => {
    const original = [
      page('a', 1),
      page('b', 2),
      page('c', 3),
      page('d', 4),
    ];

    expect(
      replacePageRangeByIds(
        original,
        ['b', 'c', 'd'],
        ['d', 'b']
      )
    ).toBe(original);
    expect(
      replacePageRangeByIds(
        original,
        ['b', 'c', 'd'],
        ['d', 'b', 'b']
      )
    ).toBe(original);
    expect(
      replacePageRangeByIds(
        original,
        ['b', 'c', 'd'],
        ['d', 'missing', 'b']
      )
    ).toBe(original);
  });

  describe('grid position validation', () => {
    const positions = {
      a: { index: 2 },
      b: { index: 0 },
      c: { index: 1 },
    };

    it('returns the complete stable ID order', () => {
      expect(
        resolvePageOrderFromPositions(['a', 'b', 'c'], positions)
      ).toEqual(['b', 'c', 'a']);
    });

    it('rejects unknown, missing, duplicate, and invalid positions', () => {
      expect(
        resolvePageOrderFromPositions(['a', 'b'], positions)
      ).toBeUndefined();
      expect(
        resolvePageOrderFromPositions(['a', 'b', 'c'], {
          a: { index: 0 },
          b: { index: 1 },
        })
      ).toBeUndefined();
      expect(
        resolvePageOrderFromPositions(['a', 'b', 'c'], {
          a: { index: 0 },
          b: { index: 0 },
          c: { index: 2 },
        })
      ).toBeUndefined();
      expect(
        resolvePageOrderFromPositions(['a', 'b', 'c'], {
          a: { index: 0 },
          b: { index: 1.5 },
          c: { index: 2 },
        })
      ).toBeUndefined();
    });
  });

  describe('move to position', () => {
    const original = () => [
      page('a', 1),
      page('b', 2),
      page('c', 3),
      page('d', 4),
      page('e', 5),
    ];

    it('moves a page to the first position', () => {
      const result = movePageToPosition(original(), 'd', 1);
      expect(result.map(item => item.id)).toEqual(['d', 'a', 'b', 'c', 'e']);
    });

    it('moves a page to a position in the center', () => {
      const result = movePageToPosition(original(), 'a', 3);
      expect(result.map(item => item.id)).toEqual(['b', 'c', 'a', 'd', 'e']);
    });

    it('moves a page to the final position', () => {
      const result = movePageToPosition(original(), 'b', 5);
      expect(result.map(item => item.id)).toEqual(['a', 'c', 'd', 'e', 'b']);
    });

    it('returns the original array for the same or invalid position', () => {
      const pages = original();
      expect(movePageToPosition(pages, 'b', 2)).toBe(pages);
      expect(movePageToPosition(pages, 'b', 0)).toBe(pages);
      expect(movePageToPosition(pages, 'b', 6)).toBe(pages);
      expect(movePageToPosition(pages, 'b', 2.5)).toBe(pages);
      expect(movePageToPosition(pages, 'b', Number.NaN)).toBe(pages);
      expect(movePageToPosition(pages, 'missing', 1)).toBe(pages);
    });
  });
});
