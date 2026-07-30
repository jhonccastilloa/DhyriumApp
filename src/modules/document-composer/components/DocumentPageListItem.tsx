import { memo } from 'react';
import { usePageThumbnail } from '../hooks/usePageThumbnail';
import type { ComposerPage } from '../types/documentComposer.types';
import AppDocumentPageCard from './AppDocumentPageCard';

type DocumentPageListItemProps = {
  page: ComposerPage;
  artifactId?: string;
  onView: (pageId: string) => void;
  onDelete: (pageId: string) => void;
  onMoveToPosition: (pageId: string) => void;
  onReorderNearby: (pageId: string) => void;
};

const DocumentPageListItem = ({
  page,
  artifactId,
  onView,
  onDelete,
  onMoveToPosition,
  onReorderNearby,
}: DocumentPageListItemProps) => {
  const thumbnail = usePageThumbnail(page, artifactId);

  return (
    <AppDocumentPageCard
      page={page}
      thumbnailUri={thumbnail.thumbnailUri}
      isThumbnailLoading={thumbnail.isLoading}
      onView={onView}
      onMoveToPosition={onMoveToPosition}
      onDelete={onDelete}
      onReorderNearby={onReorderNearby}
    />
  );
};

export default memo(DocumentPageListItem);
