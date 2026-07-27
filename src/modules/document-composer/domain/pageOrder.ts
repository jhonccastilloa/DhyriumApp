import type { ComposerPage } from '../types/documentComposer.types';

export const NEARBY_PAGE_LIMIT = 9;
export const MAX_LOCAL_PAGE_MOVE = 4;

export const normalizePageOrder = (pages: ComposerPage[]) => {
  let changed = false;
  const normalized = pages.map((page, index) => {
    const order = index + 1;
    if (page.order === order) return page;
    changed = true;
    return { ...page, order };
  });
  return changed ? normalized : pages;
};

export const appendPages = (
  current: ComposerPage[],
  added: ComposerPage[]
) => normalizePageOrder([...current, ...added]);

export const removePage = (pages: ComposerPage[], pageId: string) =>
  normalizePageOrder(pages.filter(page => page.id !== pageId));

export const getNearbyPages = (
  pages: ComposerPage[],
  selectedPageId: string,
  limit = NEARBY_PAGE_LIMIT
) => {
  const selectedIndex = pages.findIndex(page => page.id === selectedPageId);
  if (selectedIndex < 0 || limit <= 0 || pages.length === 0) return [];

  const windowSize = Math.min(Math.floor(limit), pages.length);
  const pagesBefore = Math.floor((windowSize - 1) / 2);
  const start = Math.min(
    Math.max(selectedIndex - pagesBefore, 0),
    pages.length - windowSize
  );

  return pages.slice(start, start + windowSize);
};

type ContiguousPageRange = {
  start: number;
  pages: ComposerPage[];
  pageIds: Set<string>;
};

const resolveContiguousPageRange = (
  pages: ComposerPage[],
  pageIds: string[]
): ContiguousPageRange | undefined => {
  const uniqueIds = new Set(pageIds);
  if (pageIds.length === 0 || uniqueIds.size !== pageIds.length) {
    return undefined;
  }

  const indexes = pageIds
    .map(id => pages.findIndex(page => page.id === id))
    .sort((left, right) => left - right);
  if (indexes.some(index => index < 0)) return undefined;

  const start = indexes[0];
  if (!indexes.every((index, offset) => index === start + offset)) {
    return undefined;
  }

  const rangePages = pages.slice(start, start + pageIds.length);
  if (rangePages.some(page => !uniqueIds.has(page.id))) {
    return undefined;
  }
  return { start, pages: rangePages, pageIds: uniqueIds };
};

const applyResolvedPageRangeOrder = (
  pages: ComposerPage[],
  range: ContiguousPageRange,
  orderedPageIds: string[]
) => {
  if (
    range.pages.every(
      (page, offset) => page.id === orderedPageIds[offset]
    )
  ) {
    return pages;
  }

  const pagesById = new Map(range.pages.map(page => [page.id, page]));
  const reordered: ComposerPage[] = [];
  for (const id of orderedPageIds) {
    const page = pagesById.get(id);
    if (!page) return pages;
    reordered.push(page);
  }

  const next = [...pages];
  reordered.forEach((page, offset) => {
    next[range.start + offset] = page;
  });
  return normalizePageOrder(next);
};

export const replacePageRangeByIds = (
  pages: ComposerPage[],
  rangePageIds: string[],
  orderedPageIds: string[]
) => {
  const range = resolveContiguousPageRange(pages, rangePageIds);
  const orderedIds = new Set(orderedPageIds);
  if (
    !range ||
    orderedPageIds.length !== range.pages.length ||
    orderedIds.size !== orderedPageIds.length ||
    orderedPageIds.some(id => !range.pageIds.has(id))
  ) {
    return pages;
  }
  return applyResolvedPageRangeOrder(pages, range, orderedPageIds);
};

export const movePageWithinRangeByIds = (
  pages: ComposerPage[],
  localPageIds: string[],
  movingPageId: string,
  targetPageId: string,
  maxDistance = MAX_LOCAL_PAGE_MOVE
) => {
  if (
    movingPageId === targetPageId ||
    localPageIds.length === 0 ||
    localPageIds.length > NEARBY_PAGE_LIMIT ||
    !Number.isInteger(maxDistance) ||
    maxDistance < 0
  ) {
    return pages;
  }

  const range = resolveContiguousPageRange(pages, localPageIds);
  if (
    !range ||
    !range.pageIds.has(movingPageId) ||
    !range.pageIds.has(targetPageId)
  ) {
    return pages;
  }

  const currentRangeIds = range.pages.map(page => page.id);
  const movingIndex = currentRangeIds.indexOf(movingPageId);
  const targetIndex = currentRangeIds.indexOf(targetPageId);
  if (
    movingIndex < 0 ||
    targetIndex < 0 ||
    Math.abs(targetIndex - movingIndex) > maxDistance
  ) {
    return pages;
  }

  const orderedIds = [...currentRangeIds];
  const [movingId] = orderedIds.splice(movingIndex, 1);
  orderedIds.splice(targetIndex, 0, movingId);

  return applyResolvedPageRangeOrder(pages, range, orderedIds);
};

export const movePageToPosition = (
  pages: ComposerPage[],
  movingPageId: string,
  targetPosition: number
) => {
  if (
    !Number.isInteger(targetPosition) ||
    targetPosition < 1 ||
    targetPosition > pages.length
  ) {
    return pages;
  }

  const movingIndex = pages.findIndex(page => page.id === movingPageId);
  if (movingIndex < 0 || movingIndex === targetPosition - 1) return pages;

  const next = [...pages];
  const [movingPage] = next.splice(movingIndex, 1);
  next.splice(targetPosition - 1, 0, movingPage);
  return normalizePageOrder(next);
};
