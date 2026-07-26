import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getPageThumbnail,
  getPageThumbnailCacheScope,
} from '../services/pageThumbnailService';
import type { ComposerPage } from '../types/documentComposer.types';
import {
  isPageThumbnailPolling,
  type PageThumbnailQueryResult,
} from '../utils/pageThumbnailPolling';

export const usePageThumbnail = (
  page: ComposerPage,
  artifactId?: string
) => {
  const queryClient = useQueryClient();
  const cacheScope = getPageThumbnailCacheScope();
  const pageNumber = page.originalPageNumber;
  const queryKey = [
    'document-composer',
    'thumbnail',
    cacheScope,
    artifactId,
    pageNumber,
  ] as const;
  const enabled =
    page.origin === 'originalPdf' &&
    Boolean(cacheScope) &&
    Boolean(artifactId) &&
    typeof pageNumber === 'number';

  const query = useQuery<PageThumbnailQueryResult>({
    queryKey,
    queryFn: async ({ signal }) => {
      if (!cacheScope || !artifactId || pageNumber === undefined) {
        return { status: 'unavailable' } as const;
      }
      const result = await getPageThumbnail({
        cacheScope,
        artifactId,
        pageNumber,
        signal,
      });
      if (result.status !== 'pending') return result;

      const previous =
        queryClient.getQueryData<PageThumbnailQueryResult>(queryKey);
      return {
        ...result,
        pendingAttempts:
          previous?.status === 'pending'
            ? previous.pendingAttempts + 1
            : 1,
      };
    },
    enabled,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 5000),
    refetchInterval: currentQuery => {
      const result = currentQuery.state.data;
      return isPageThumbnailPolling(result)
        ? result.retryAfterMs
        : false;
    },
  });

  if (page.origin === 'scanned') {
    return { thumbnailUri: page.uri, isLoading: false };
  }
  if (!enabled) return { thumbnailUri: undefined, isLoading: false };
  if (query.data?.status === 'ready') {
    return { thumbnailUri: query.data.uri, isLoading: false };
  }
  if (query.isPending || isPageThumbnailPolling(query.data)) {
    return { thumbnailUri: undefined, isLoading: true };
  }
  return { thumbnailUri: undefined, isLoading: false };
};
