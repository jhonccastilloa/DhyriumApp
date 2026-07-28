import { memo } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedRef,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';
import AppText from '@/components/typography/AppText';
import {
  DOCUMENT_PAGE_CARD_HEIGHT,
  DOCUMENT_PAGE_ITEM_EXTENT,
} from '../constants/documentComposerLayout';
import { resolveLocalPageShift } from '../domain/localPageDragGeometry';
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
  activeOriginalIndex?: number;
  placeholderPosition?: number;
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
  activeOriginalIndex,
  placeholderPosition,
  dragContext,
  onView,
  onDelete,
}: LocalDraggablePageListItemProps) => {
  const rowRef = useAnimatedRef<View>();
  const thumbnail = usePageThumbnail(page, artifactId);
  const shiftStyle = useAnimatedStyle(() => {
    if (activeOriginalIndex === undefined) {
      return { transform: [{ translateY: 0 }] };
    }
    const translateY = resolveLocalPageShift({
      pageIndex,
      originalIndex: activeOriginalIndex,
      targetIndex: dragContext.targetIndex.value,
      itemExtent: DOCUMENT_PAGE_ITEM_EXTENT,
    });
    return {
      transform: [
        {
          translateY: withSpring(translateY, {
            damping: 21,
            stiffness: 250,
            mass: 0.72,
          }),
        },
      ],
    };
  }, [activeOriginalIndex, pageIndex]);

  return (
    <Animated.View
      ref={rowRef}
      collapsable={false}
      style={[
        styles.row,
        isPlaceholder && styles.dragSourceRow,
        shiftStyle,
      ]}
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
            Página {page.order} · posición{' '}
            {placeholderPosition ?? page.order}
          </AppText>
        </View>
      ) : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create(theme => ({
  row: {
    height: DOCUMENT_PAGE_CARD_HEIGHT,
  },
  dragSourceRow: {
    zIndex: 2,
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
}));

export default memo(LocalDraggablePageListItem);
