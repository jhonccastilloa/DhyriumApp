import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
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
import { NEARBY_PAGE_ORDER_TOAST_ID } from '../constants/documentComposerFeedback';
import {
  resolvePageOrderFromPositions,
} from '../domain/pageOrder';
import { usePageThumbnail } from '../hooks/usePageThumbnail';
import type { ComposerPage } from '../types/documentComposer.types';
import {
  calculateNearbyGridLayout,
  resolveNearbyGridDragTarget,
  type NearbyGridDragTarget,
} from '../utils/nearbyGridLayout';
import DocumentPageThumbnail from './DocumentPageThumbnail';

const GRID_ACTIVATION_DELAY_MS = 0;
const MOVE_DROP_TARGET_HEIGHT = 56;
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
  onDragging: (
    pageId: string,
    overPageId: string | null,
    x: number,
    y: number
  ) => void;
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
  onMoveToPosition: (pageId: string) => void;
};

const CompactSortablePage = ({
  item,
  artifactId,
  selectedPageId,
  activePageId,
  containerWidth,
  containerHeight,
  onDragStart,
  onDragging,
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
      onDragging={onDragging}
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
  const [dragTarget, setDragTarget] =
    useState<NearbyGridDragTarget>('outside');
  const [gridRevision, setGridRevision] = useState(0);
  const dragTargetRef = useRef<NearbyGridDragTarget>('outside');
  const [gridArea, setGridArea] = useState<GridAreaSize>({
    width: 0,
    height: 0,
  });
  const pageIds = useMemo(() => pages.map(page => page.id), [pages]);
  const gridLayout = useMemo(
    () =>
      calculateNearbyGridLayout(
        gridArea.width,
        Math.max(
          gridArea.height -
            MOVE_DROP_TARGET_HEIGHT -
            theme.spacing.sm,
          0
        ),
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

  const updateDragTarget = useCallback(
    (nextTarget: NearbyGridDragTarget) => {
      dragTargetRef.current = nextTarget;
      setDragTarget(current =>
        current === nextTarget ? current : nextTarget
      );
    },
    []
  );

  const handleDragStart = useCallback(
    (pageId: string) => {
      setActivePageId(pageId);
      updateDragTarget('grid');
    },
    [updateDragTarget]
  );

  const handleDragging = useCallback(
    (
      _pageId: string,
      _overPageId: string | null,
      x: number,
      y: number
    ) => {
      updateDragTarget(
        resolveNearbyGridDragTarget({
          x,
          y,
          itemWidth: gridLayout.dimensions.itemWidth,
          itemHeight: gridLayout.dimensions.itemHeight,
          gridWidth: gridLayout.width,
          gridHeight: gridLayout.height,
          dropTargetGap: theme.spacing.sm,
          dropTargetHeight: MOVE_DROP_TARGET_HEIGHT,
        })
      );
    },
    [
      gridLayout.dimensions.itemHeight,
      gridLayout.dimensions.itemWidth,
      gridLayout.height,
      gridLayout.width,
      theme.spacing.sm,
      updateDragTarget,
    ]
  );

  const requestMoveToPosition = useCallback(
    (pageId: string) => {
      toast.dismiss(NEARBY_PAGE_ORDER_TOAST_ID);
      onMoveToPosition(pageId);
    },
    [onMoveToPosition]
  );

  const handleDrop = useCallback(
    (
      pageId: string,
      _position: number,
      allPositions?: GridPositions
    ) => {
      const outcome = dragTargetRef.current;
      setActivePageId(undefined);
      updateDragTarget('outside');
      if (outcome === 'moveToPosition') {
        requestMoveToPosition(pageId);
        return;
      }
      if (outcome !== 'grid') {
        setGridRevision(current => current + 1);
        return;
      }

      const orderedPageIds = resolvePageOrderFromPositions(
        pageIds,
        allPositions
      );
      if (
        !orderedPageIds ||
        orderedPageIds.every((id, index) => id === pageIds[index])
      ) {
        if (!orderedPageIds) {
          setGridRevision(current => current + 1);
        }
        return;
      }

      const previousPageIds = [...pageIds];
      onApplyOrder(rangePageIds, orderedPageIds);
      toast.success('Orden actualizado', {
        id: NEARBY_PAGE_ORDER_TOAST_ID,
        duration: 6000,
        action: {
          label: 'Deshacer',
          onClick: () => {
            onApplyOrder(rangePageIds, previousPageIds);
            toast.dismiss(NEARBY_PAGE_ORDER_TOAST_ID);
          },
        },
      });
    },
    [
      onApplyOrder,
      pageIds,
      rangePageIds,
      requestMoveToPosition,
      updateDragTarget,
    ]
  );

  const renderCompactPage = useCallback(
    (props: SortableGridRenderItemProps<ComposerPage>) => (
      <CompactSortablePage
        key={props.id}
        {...props}
        artifactId={artifactId}
        selectedPageId={activePageId ?? selectedPageId}
        activePageId={activePageId}
        containerWidth={gridLayout.width}
        containerHeight={gridLayout.height}
        onDragStart={handleDragStart}
        onDragging={handleDragging}
        onDrop={handleDrop}
      />
    ),
    [
      activePageId,
      artifactId,
      gridLayout.height,
      gridLayout.width,
      handleDrop,
      handleDragStart,
      handleDragging,
      selectedPageId,
    ]
  );

  const actionPageId = activePageId ?? selectedPageId;
  const actionPage = pages.find(page => page.id === actionPageId);
  const dragSurfaceHeight =
    gridLayout.height + theme.spacing.sm + MOVE_DROP_TARGET_HEIGHT;
  const moveActionText = activePageId
    ? dragTarget === 'moveToPosition'
      ? `Suelta aquí para mover la página ${actionPage?.order ?? ''}`
      : `Arrastra aquí para mover la página ${actionPage?.order ?? ''}`
    : `Mover página ${actionPage?.order ?? ''} a otra posición…`;

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
              styles.dragSurface,
              {
                width: gridLayout.width,
                height: dragSurfaceHeight,
              },
            ]}
          >
            <SortableGrid
              key={gridRevision}
              data={pages}
              dimensions={gridLayout.dimensions}
              strategy={GridStrategy.Insert}
              scrollEnabled={false}
              itemKeyExtractor={pageKeyExtractor}
              renderItem={renderCompactPage}
              style={[
                styles.gridViewport,
                {
                  width: gridLayout.width,
                  height: dragSurfaceHeight,
                },
              ]}
            />
            <AppButton
              testID="move-to-position-drop-target"
              text={moveActionText}
              variant="ghost"
              accessibilityLabel={moveActionText}
              onPress={() => requestMoveToPosition(actionPageId)}
              style={[
                styles.moveDropTarget,
                {
                  top: gridLayout.height + theme.spacing.sm,
                },
                dragTarget === 'moveToPosition' &&
                  styles.moveDropTargetActive,
              ]}
            />
          </View>
        ) : null}
      </View>
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
  dragSurface: {
    position: 'relative',
    overflow: 'visible',
  },
  gridViewport: {
    overflow: 'visible',
  },
  moveDropTarget: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: MOVE_DROP_TARGET_HEIGHT,
    zIndex: 2,
    borderWidth: theme.border.hairline,
    borderColor: theme.colors.border.default,
  },
  moveDropTargetActive: {
    borderWidth: theme.border.emphasized,
    borderColor: theme.colors.border.focus,
    backgroundColor: theme.colors.navigation.rail,
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
