import type { ComposerPage } from '../types/documentComposer.types';

export type PagePlacement = 'before' | 'after';

export const NEARBY_PAGE_LIMIT = 9;

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

export const replacePageRangeByIds = (
  pages: ComposerPage[],
  orderedPageIds: string[]
) => {
  if (orderedPageIds.length === 0) return normalizePageOrder(pages);

  const uniqueIds = new Set(orderedPageIds);
  if (uniqueIds.size !== orderedPageIds.length) {
    return normalizePageOrder(pages);
  }

  const indexes = orderedPageIds
    .map(id => pages.findIndex(page => page.id === id))
    .sort((a, b) => a - b);
  if (indexes.some(index => index < 0)) return normalizePageOrder(pages);

  const rangeStart = indexes[0];
  const isContiguous = indexes.every(
    (index, offset) => index === rangeStart + offset
  );
  if (!isContiguous) return normalizePageOrder(pages);

  const currentRange = pages.slice(
    rangeStart,
    rangeStart + orderedPageIds.length
  );
  const alreadyOrdered = currentRange.every(
    (page, offset) => page.id === orderedPageIds[offset]
  );
  if (alreadyOrdered) return normalizePageOrder(pages);

  const pagesById = new Map(
    currentRange.map(page => [page.id, page])
  );
  const reordered: ComposerPage[] = [];
  for (const id of orderedPageIds) {
    const page = pagesById.get(id);
    if (!page) return normalizePageOrder(pages);
    reordered.push(page);
  }

  const next = [...pages];
  reordered.forEach((page, offset) => {
    next[rangeStart + offset] = page;
  });
  return normalizePageOrder(next);
};

const movePageRelativeToId = (
  pages: ComposerPage[],
  movingPageId: string,
  targetPageId: string,
  placement: PagePlacement
) => {
  if (
    movingPageId === targetPageId ||
    (placement !== 'before' && placement !== 'after')
  ) {
    return normalizePageOrder(pages);
  }

  const movingIndex = pages.findIndex(page => page.id === movingPageId);
  const targetIndex = pages.findIndex(page => page.id === targetPageId);
  if (movingIndex < 0 || targetIndex < 0) return normalizePageOrder(pages);

  const next = [...pages];
  const [movingPage] = next.splice(movingIndex, 1);
  const adjustedTargetIndex = next.findIndex(page => page.id === targetPageId);
  const insertionIndex =
    adjustedTargetIndex + (placement === 'after' ? 1 : 0);
  next.splice(insertionIndex, 0, movingPage);

  return normalizePageOrder(next);
};

export const movePageToPosition = (
  pages: ComposerPage[],
  movingPageId: string,
  targetPosition: number,
  placement: PagePlacement
) => {
  if (
    !Number.isInteger(targetPosition) ||
    targetPosition < 1 ||
    targetPosition > pages.length
  ) {
    return normalizePageOrder(pages);
  }

  return movePageRelativeToId(
    pages,
    movingPageId,
    pages[targetPosition - 1].id,
    placement
  );
};
