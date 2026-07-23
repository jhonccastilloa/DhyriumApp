import type { ComposerPage } from '../types/documentComposer.types';

export const normalizePageOrder = (pages: ComposerPage[]) =>
  pages.map((page, index) => ({ ...page, order: index + 1 }));

export const appendPages = (
  current: ComposerPage[],
  added: ComposerPage[]
) => normalizePageOrder([...current, ...added]);

export const removePage = (pages: ComposerPage[], pageId: string) =>
  normalizePageOrder(pages.filter(page => page.id !== pageId));

export const movePage = (
  pages: ComposerPage[],
  fromIndex: number,
  toIndex: number
) => {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= pages.length ||
    toIndex >= pages.length
  ) {
    return normalizePageOrder(pages);
  }
  const next = [...pages];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return normalizePageOrder(next);
};
