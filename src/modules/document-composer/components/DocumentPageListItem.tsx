import { memo } from 'react';
import AppDocumentPageCard from './AppDocumentPageCard';
import { usePageThumbnail } from '../hooks/usePageThumbnail';
import type { ComposerPage } from '../types/documentComposer.types';

type DocumentPageListItemProps = {
  page: ComposerPage;
  artifactId?: string;
  onView: (pageId: string) => void;
  onDelete: (pageId: string) => void;
  onOrder: (pageId: string) => void;
};

const DocumentPageListItem = ({
  page,
  artifactId,
  onView,
  onDelete,
  onOrder,
}: DocumentPageListItemProps) => {
  const thumbnail = usePageThumbnail(page, artifactId);

  return (
    <AppDocumentPageCard
      page={page}
      thumbnailUri={thumbnail.thumbnailUri}
      isThumbnailLoading={thumbnail.isLoading}
      onView={onView}
      onDelete={onDelete}
      onOrder={onOrder}
    />
  );
};

export default memo(DocumentPageListItem);
