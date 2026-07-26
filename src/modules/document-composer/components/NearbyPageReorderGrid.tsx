import { useCallback, useMemo, useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import {
  GridStrategy,
  SortableGrid,
  SortableGridItem,
  type GridPositions,
  type SortableGridRenderItemProps,
} from 'react-native-reanimated-dnd';
import { StyleSheet } from 'react-native-unistyles';
import { AppButton } from '@/components/buttons/AppButton';
import AppText from '@/components/typography/AppText';
import { usePageThumbnail } from '../hooks/usePageThumbnail';
import type { ComposerPage } from '../types/documentComposer.types';
import { calculateNearbyGridLayout } from '../utils/nearbyGridLayout';
import DocumentPageThumbnail from './DocumentPageThumbnail';

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
  selectedPageId: string;
  artifactId?: string;
  onCancel: () => void;
  onSave: (orderedPageIds: string[]) => void;
};

type GridAreaSize = {
  width: number;
  height: number;
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
      activationDelay={180}
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
        {active ? <View style={styles.activeIndicator} /> : null}
      </View>
    </SortableGridItem>
  );
};

const NearbyPageReorderGrid = ({
  pages,
  selectedPageId,
  artifactId,
  onCancel,
  onSave,
}: NearbyPageReorderGridProps) => {
  const [orderedPages, setOrderedPages] = useState(pages);
  const [activePageId, setActivePageId] = useState<string>();
  const [gridArea, setGridArea] = useState<GridAreaSize>({
    width: 0,
    height: 0,
  });
  const gridLayout = useMemo(
    () =>
      calculateNearbyGridLayout(
        gridArea.width,
        gridArea.height,
        orderedPages.length
      ),
    [gridArea.height, gridArea.width, orderedPages.length]
  );

  const handleGridAreaLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setGridArea(current =>
      current.width === width && current.height === height
        ? current
        : { width, height }
    );
  }, []);

  const handleDrop = useCallback(
    (
      _pageId: string,
      _position: number,
      allPositions?: GridPositions
    ) => {
      setActivePageId(undefined);
      if (!allPositions) return;
      const pagesById = new Map(
        orderedPages.map(page => [page.id, page])
      );
      const next = Object.entries(allPositions)
        .sort(([, left], [, right]) => left.index - right.index)
        .map(([id]) => pagesById.get(id))
        .filter((page): page is ComposerPage => Boolean(page));
      if (next.length === orderedPages.length) setOrderedPages(next);
    },
    [orderedPages]
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

  return (
    <View style={styles.content}>
      <AppText variant="text.sm.regular" color="details">
        Mantén pulsada una página y arrástrala. Esta vista no se desplaza.
      </AppText>
      <View style={styles.gridArea} onLayout={handleGridAreaLayout}>
        {gridLayout.ready ? (
          <View
            style={[
              styles.gridFrame,
              { width: gridLayout.width, height: gridLayout.height },
            ]}
          >
            <SortableGrid
              data={orderedPages}
              dimensions={gridLayout.dimensions}
              strategy={GridStrategy.Insert}
              scrollEnabled={false}
              itemKeyExtractor={item => item.id}
              renderItem={renderCompactPage}
              style={{
                width: gridLayout.width,
                height: gridLayout.height,
              }}
            />
          </View>
        ) : null}
      </View>
      <View style={styles.actions}>
        <AppButton
          text="Cancelar"
          variant="ghost"
          style={styles.action}
          onPress={onCancel}
        />
        <AppButton
          text="Guardar orden"
          style={styles.action}
          onPress={() => onSave(orderedPages.map(page => page.id))}
        />
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
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  action: { flex: 1 },
}));

export default NearbyPageReorderGrid;
