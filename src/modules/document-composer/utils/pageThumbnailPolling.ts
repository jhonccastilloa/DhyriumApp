import type { PageThumbnailResult } from '../services/pageThumbnailService';

export const MAX_THUMBNAIL_POLL_ATTEMPTS = 5;

export type PageThumbnailQueryResult =
  | Exclude<PageThumbnailResult, { status: 'pending' }>
  | (Extract<PageThumbnailResult, { status: 'pending' }> & {
      pendingAttempts: number;
    });

export const shouldPollPageThumbnail = (
  result: PageThumbnailResult | undefined,
  pendingAttempts: number
): result is Extract<PageThumbnailResult, { status: 'pending' }> =>
  result?.status === 'pending' &&
  pendingAttempts < MAX_THUMBNAIL_POLL_ATTEMPTS;

export const isPageThumbnailPolling = (
  result: PageThumbnailQueryResult | undefined
): result is Extract<PageThumbnailQueryResult, { status: 'pending' }> =>
  shouldPollPageThumbnail(
    result,
    result?.status === 'pending' ? result.pendingAttempts : 0
  );
