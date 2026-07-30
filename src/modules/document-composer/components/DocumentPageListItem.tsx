import { memo } from 'react';
import { Pressable } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import AppIcon from '@/components/icons/AppIcon';
import { usePageThumbnail } from '../hooks/usePageThumbnail';
import type { ComposerPage } from '../types/documentComposer.types';
import AppDocumentPageCard from './AppDocumentPageCard';

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
  const { theme } = useUnistyles();
  const thumbnail = usePageThumbnail(page, artifactId);

  return (
    <AppDocumentPageCard
      page={page}
      thumbnailUri={thumbnail.thumbnailUri}
      isThumbnailLoading={thumbnail.isLoading}
      onView={onView}
      onDelete={onDelete}
      orderControl={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Reordenar cerca de la página ${page.order}`}
          accessibilityHint="Abre una cuadrícula con las páginas cercanas."
          onPress={() => onOrder(page.id)}
          style={styles.orderButton}
        >
          <AppIcon
            name="dotsSixVertical"
            size={22}
            mColor={theme.colors.navigation.active}
          />
        </Pressable>
      }
    />
  );
};

const styles = StyleSheet.create(theme => ({
  orderButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.navigation.rail,
  },
}));

export default memo(DocumentPageListItem);
