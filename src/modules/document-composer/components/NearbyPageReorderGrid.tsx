import { useCallback, useMemo, useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import {
  GridStrategy,
  SortableGrid,
  SortableGridItem,
  type GridPositions,
  type SortableGridRenderItemProps,
} from 'react-native-reanimated-dnd';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { toast } from 'sonner-native';
import { AppButton } from '@/components/buttons/AppButton';
import AppText from '@/components/typography/AppText';
import {
  resolvePageOrderFromPositions,
} from '../domain/pageOrder';
import { usePageThumbnail } from '../hooks/usePageThumbnail';
import type { ComposerPage } from '../types/documentComposer.types';
import { calculateNearbyGridLayout } from '../utils/nearbyGridLayout';
import DocumentPageThumbnail from './DocumentPageThumbnail';

const GRID_ACTIVATION_DELAY_MS = 80;
const ORDER_TOAST_ID = 'document-composer-nearby-order';
const pageKeyExtractor = (page: ComposerPage) => page.id;

type GridAreaSize = {
  width: number;
  height: number;
};

type CompactPageProps = SortableGridRenderItemProps<ComposerPage> & {
  artifactId?: string;
  selectedPageId: string;
  activePageId?: string;
  containerWidth: number;
  containerHeight: number;
  onDragStart: (pageId: string) => void;
  onDrop: (
    pageId: string,
    position: number,
    allPositions?: GridPositions
  ) => void;
};

type NearbyPageReorderGridProps = {
  pages: ComposerPage[];
  rangePageIds: string[];
  selectedPageId: string;
  artifactId?: string;
  onApplyOrder: (
    rangePageIds: string[],
    orderedPageIds: string[]
  ) => void;
  onMoveToPosition: () => void;
};

const CompactSortablePage = ({
  item,
  artifactId,
  selectedPageId,
  activePageId,
  containerWidth,
  containerHeight,
  onDragStart,
  onDrop,
  ...gridItemProps
}: CompactPageProps) => {
  const thumbnail = usePageThumbnail(item, artifactId);
  const selected = item.id === selectedPageId;
  const active = item.id === activePageId;

  return (
    <SortableGridItem
      {...gridItemProps}
      data={item}
      containerWidth={containerWidth}
      containerHeight={containerHeight}
      activationDelay={GRID_ACTIVATION_DELAY_MS}
      onDragStart={onDragStart}
      onDrop={onDrop}
    >
      <View
        style={[
          styles.compactPage,
          selected && styles.compactPageSelected,
          active && styles.compactPageActive,
        ]}
      >
        <DocumentPageThumbnail
          compact
          page={item}
          thumbnailUri={thumbnail.thumbnailUri}
          isLoading={thumbnail.isLoading}
        />
        <View style={styles.compactNumber}>
          <AppText variant="text.xs.bold" color="button">
            {item.order}
          </AppText>
        </View>
        {selected ? (
          <View style={styles.selectedBadge}>
            <AppText variant="menu" color="link">
              Seleccionada
            </AppText>
          </View>
        ) : null}
        {active ? (
          <View
            testID={`active-page-${item.id}`}
            style={styles.activeIndicator}
          />
        ) : null}
      </View>
    </SortableGridItem>
  );
};

const NearbyPageReorderGrid = ({
  pages,
  rangePageIds,
  selectedPageId,
  artifactId,
  onApplyOrder,
  onMoveToPosition,
}: NearbyPageReorderGridProps) => {
  const { theme } = useUnistyles();
  const [activePageId, setActivePageId] = useState<string>();
  const [gridArea, setGridArea] = useState<GridAreaSize>({
    width: 0,
    height: 0,
  });
  const pageIds = useMemo(() => pages.map(page => page.id), [pages]);
  const gridLayout = useMemo(
    () =>
      calculateNearbyGridLayout(
        gridArea.width,
        gridArea.height,
        pages.length,
        theme.spacing.sm
      ),
    [
      gridArea.height,
      gridArea.width,
      pages.length,
      theme.spacing.sm,
    ]
  );

  const handleGridAreaLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      setGridArea(current =>
        current.width === width && current.height === height
          ? current
          : { width, height }
      );
    },
    []
  );

  const handleDrop = useCallback(
    (
      _pageId: string,
      _position: number,
      allPositions?: GridPositions
    ) => {
      setActivePageId(undefined);
      const orderedPageIds = resolvePageOrderFromPositions(
        pageIds,
        allPositions
      );
      if (
        !orderedPageIds ||
        orderedPageIds.every((id, index) => id === pageIds[index])
      ) {
        return;
      }

      const previousPageIds = [...pageIds];
      onApplyOrder(rangePageIds, orderedPageIds);
      toast.success('Orden actualizado', {
        id: ORDER_TOAST_ID,
        duration: 6000,
        action: {
          label: 'Deshacer',
          onClick: () => {
            onApplyOrder(rangePageIds, previousPageIds);
            toast.dismiss(ORDER_TOAST_ID);
          },
        },
      });
    },
    [onApplyOrder, pageIds, rangePageIds]
  );

  const renderCompactPage = useCallback(
    (props: SortableGridRenderItemProps<ComposerPage>) => (
      <CompactSortablePage
        key={props.id}
        {...props}
        artifactId={artifactId}
        selectedPageId={selectedPageId}
        activePageId={activePageId}
        containerWidth={gridLayout.width}
        containerHeight={gridLayout.height}
        onDragStart={setActivePageId}
        onDrop={handleDrop}
      />
    ),
    [
      activePageId,
      artifactId,
      gridLayout.height,
      gridLayout.width,
      handleDrop,
      selectedPageId,
    ]
  );

  const moveToPosition = () => {
    toast.dismiss(ORDER_TOAST_ID);
    onMoveToPosition();
  };

  return (
    <View style={styles.content}>
      <AppText variant="text.sm.regular" color="details">
        Arrastra una página para cambiar su posición en este rango.
      </AppText>
      <View
        testID="nearby-page-grid-area"
        style={styles.gridArea}
        onLayout={handleGridAreaLayout}
      >
        {gridLayout.ready ? (
          <View
            style={[
              styles.gridFrame,
              {
                width: gridLayout.width,
                height: gridLayout.height,
              },
            ]}
          >
            <SortableGrid
              data={pages}
              dimensions={gridLayout.dimensions}
              strategy={GridStrategy.Insert}
              scrollEnabled={false}
              itemKeyExtractor={pageKeyExtractor}
              renderItem={renderCompactPage}
              style={{
                width: gridLayout.width,
                height: gridLayout.height,
              }}
            />
          </View>
        ) : null}
      </View>
      <AppButton
        text={`Mover página ${
          pages.find(page => page.id === selectedPageId)?.order ?? ''
        } a otra posición…`}
        variant="ghost"
        onPress={moveToPosition}
      />
    </View>
  );
};

const styles = StyleSheet.create(theme => ({
  content: { flex: 1, gap: theme.spacing.sm },
  gridArea: {
    minHeight: 0,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridFrame: {
    overflow: 'hidden',
  },
  compactPage: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: theme.radius.sm,
    borderWidth: theme.border.hairline,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.surface.background.elements,
  },
  compactPageSelected: {
    borderWidth: theme.border.emphasized,
    borderColor: theme.colors.border.focus,
  },
  compactPageActive: {
    borderWidth: theme.border.emphasized,
    borderColor: theme.colors.navigation.active,
    opacity: theme.opacity.pressed,
  },
  compactNumber: {
    position: 'absolute',
    top: theme.spacing.xs,
    left: theme.spacing.xs,
    minWidth: 24,
    height: 24,
    paddingHorizontal: theme.spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.button.fill.primary,
  },
  selectedBadge: {
    position: 'absolute',
    left: theme.spacing.xs,
    right: theme.spacing.xs,
    bottom: theme.spacing.xs,
    minHeight: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.navigation.rail,
  },
  activeIndicator: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: theme.spacing.xs,
    width: 10,
    height: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.navigation.active,
  },
}));

export default NearbyPageReorderGrid;
