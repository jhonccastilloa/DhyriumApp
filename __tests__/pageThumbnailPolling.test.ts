import {
  isPageThumbnailPolling,
  MAX_THUMBNAIL_POLL_ATTEMPTS,
  shouldPollPageThumbnail,
} from '@/modules/document-composer/utils/pageThumbnailPolling';

describe('document page thumbnail polling', () => {
  const pending = { status: 'pending', retryAfterMs: 1000 } as const;

  it('polls pending thumbnails only up to the configured limit', () => {
    expect(shouldPollPageThumbnail(pending, 1)).toBe(true);
    expect(
      shouldPollPageThumbnail(pending, MAX_THUMBNAIL_POLL_ATTEMPTS)
    ).toBe(false);
  });

  it('does not poll ready or unavailable thumbnails', () => {
    expect(
      shouldPollPageThumbnail({ status: 'ready', uri: 'file:///page.webp' }, 1)
    ).toBe(false);
    expect(shouldPollPageThumbnail({ status: 'unavailable' }, 1)).toBe(false);
  });

  it('reads the attempt count from cached query data', () => {
    expect(
      isPageThumbnailPolling({ ...pending, pendingAttempts: 2 })
    ).toBe(true);
    expect(
      isPageThumbnailPolling({
        ...pending,
        pendingAttempts: MAX_THUMBNAIL_POLL_ATTEMPTS,
      })
    ).toBe(false);
  });
});
