import { memo } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedRef } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';
import AppText from '@/components/typography/AppText';
import { DOCUMENT_PAGE_CARD_HEIGHT } from '../constants/documentComposerLayout';
import { usePageThumbnail } from '../hooks/usePageThumbnail';
import type { LocalPageDragContext } from '../hooks/useLocalPageDrag';
import type { ComposerPage } from '../types/documentComposer.types';
import AppDocumentPageCard from './AppDocumentPageCard';
import LocalPageDragHandle from './LocalPageDragHandle';

type LocalDraggablePageListItemProps = {
  page: ComposerPage;
  pageIndex: number;
  pageCount: number;
  artifactId?: string;
  isPlaceholder: boolean;
  isHighlighted: boolean;
  insertionEdge?: 'before' | 'after';
  dragContext: LocalPageDragContext;
  onView: (pageId: string) => void;
  onDelete: (pageId: string) => void;
};

const LocalDraggablePageListItem = ({
  page,
  pageIndex,
  pageCount,
  artifactId,
  isPlaceholder,
  isHighlighted,
  insertionEdge,
  dragContext,
  onView,
  onDelete,
}: LocalDraggablePageListItemProps) => {
  const rowRef = useAnimatedRef<View>();
  const thumbnail = usePageThumbnail(page, artifactId);

  return (
    <Animated.View
      ref={rowRef}
      collapsable={false}
      style={styles.row}
    >
      <AppDocumentPageCard
        page={page}
        thumbnailUri={thumbnail.thumbnailUri}
        isThumbnailLoading={thumbnail.isLoading}
        onView={onView}
        onDelete={onDelete}
        dragHandle={
          <LocalPageDragHandle
            pageId={page.id}
            pageOrder={page.order}
            pageIndex={pageIndex}
            pageCount={pageCount}
            thumbnailUri={thumbnail.thumbnailUri}
            rowRef={rowRef}
            context={dragContext}
          />
        }
        style={[
          isPlaceholder && styles.hiddenCard,
          isHighlighted && styles.highlightedCard,
        ]}
      />
      {isPlaceholder ? (
        <View
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={styles.placeholder}
        >
          <AppText
            variant="text.sm.bold"
            color="link"
            numberOfLines={1}
          >
            Página {page.order} se insertará aquí
          </AppText>
        </View>
      ) : null}
      {insertionEdge ? (
        <View
          pointerEvents="none"
          style={[
            styles.insertionLine,
            insertionEdge === 'before'
              ? styles.insertionLineBefore
              : styles.insertionLineAfter,
          ]}
        />
      ) : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create(theme => ({
  row: {
    height: DOCUMENT_PAGE_CARD_HEIGHT,
  },
  hiddenCard: {
    opacity: 0,
  },
  highlightedCard: {
    borderWidth: theme.border.emphasized,
    borderColor: theme.colors.border.focus,
    backgroundColor: theme.colors.navigation.rail,
  },
  placeholder: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: theme.border.emphasized,
    borderStyle: 'dashed',
    borderColor: theme.colors.border.focus,
    backgroundColor: theme.colors.navigation.rail,
  },
  insertionLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 2,
    height: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.navigation.active,
  },
  insertionLineBefore: {
    top: -theme.spacing.xs,
  },
  insertionLineAfter: {
    bottom: -theme.spacing.xs,
  },
}));

export default memo(LocalDraggablePageListItem);
