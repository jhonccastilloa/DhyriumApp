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
import AppText from '@/components/typography/AppText';
import { resolvePageOrderFromPositions } from '../domain/pageOrder';
import { usePageThumbnail } from '../hooks/usePageThumbnail';
import type { ComposerPage } from '../types/documentComposer.types';
import { calculateNearbyGridLayout } from '../utils/nearbyGridLayout';
import DocumentPageThumbnail from './DocumentPageThumbnail';

const GRID_ACTIVATION_DELAY_MS = 0;
const pageKeyExtractor = (page: ComposerPage) => page.id;

type GridAreaSize = {
  width: number;
  height: number;
};

type CompactPageProps = SortableGridRenderItemProps<ComposerPage> & {
  artifactId?: string;
  proposedPosition: number;
  selectedPageId: string;
  onDrop: (
    pageId: string,
    position: number,
    allPositions?: GridPositions,
  ) => void;
};

type NearbyPageReorderGridProps = {
  pages: ComposerPage[];
  rangeStart: number;
  selectedPageId: string;
  artifactId?: string;
  onOrderChange: (orderedPageIds: string[]) => void;
};

const CompactSortablePage = ({
  item,
  artifactId,
  proposedPosition,
  selectedPageId,
  onDrop,
  ...gridItemProps
}: CompactPageProps) => {
  const thumbnail = usePageThumbnail(item, artifactId);
  const selected = item.id === selectedPageId;

  return (
    <SortableGridItem
      {...gridItemProps}
      data={item}
      activationDelay={GRID_ACTIVATION_DELAY_MS}
      onDrop={onDrop}
    >
      <View
        style={[
          styles.compactPage,
          selected && styles.compactPageSelected,
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
            {proposedPosition}
          </AppText>
        </View>
        {selected ? (
          <View style={styles.selectedBadge}>
            <AppText variant="menu" color="link">
              Seleccionada
            </AppText>
          </View>
        ) : null}
      </View>
    </SortableGridItem>
  );
};

const NearbyPageReorderGrid = ({
  pages,
  rangeStart,
  selectedPageId,
  artifactId,
  onOrderChange,
}: NearbyPageReorderGridProps) => {
  const { theme } = useUnistyles();
  const [gridRevision, setGridRevision] = useState(0);
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
        theme.spacing.sm,
      ),
    [gridArea.height, gridArea.width, pages.length, theme.spacing.sm],
  );

  const handleGridAreaLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setGridArea(current =>
      current.width === width && current.height === height
        ? current
        : { width, height },
    );
  }, []);

  const handleDrop = useCallback(
    (_pageId: string, _position: number, allPositions?: GridPositions) => {
      const orderedPageIds = resolvePageOrderFromPositions(
        pageIds,
        allPositions,
      );
      if (!orderedPageIds) {
        setGridRevision(current => current + 1);
        return;
      }
      if (orderedPageIds.every((id, index) => id === pageIds[index])) {
        return;
      }

      onOrderChange(orderedPageIds);
    },
    [onOrderChange, pageIds],
  );

  const renderCompactPage = useCallback(
    (props: SortableGridRenderItemProps<ComposerPage>) => (
      <CompactSortablePage
        key={props.id}
        {...props}
        artifactId={artifactId}
        proposedPosition={rangeStart + props.index}
        selectedPageId={selectedPageId}
        onDrop={handleDrop}
      />
    ),
    [
      artifactId,
      handleDrop,
      rangeStart,
      selectedPageId,
    ],
  );


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
                height: gridLayout.height,
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
                  height: gridLayout.height,
                },
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
}));

export default NearbyPageReorderGrid;
