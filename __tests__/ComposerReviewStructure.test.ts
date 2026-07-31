declare const __dirname: string;

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const readSource = (relativePath: string) =>
  fs.readFileSync(path.join(root, relativePath), 'utf8');
const collectSources = (directory: string): string[] =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap(
    (entry: { isDirectory: () => boolean; name: string }) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return collectSources(entryPath);
      return /\.[jt]sx?$/.test(entry.name) ? [entryPath] : [];
    }
  );

describe('ComposerReview reorder structure', () => {
  const reviewPath =
    'src/modules/document-composer/screens/ComposerReviewScreen.tsx';
  const listItemPath =
    'src/modules/document-composer/components/DocumentPageListItem.tsx';
  const cardPath =
    'src/modules/document-composer/components/AppDocumentPageCard.tsx';
  const nearbySheetPath =
    'src/modules/document-composer/components/NearbyPageReorderSheet.tsx';
  const moveSheetPath =
    'src/modules/document-composer/components/MovePageToPositionSheet.tsx';
  const gridPath =
    'src/modules/document-composer/components/NearbyPageReorderGrid.tsx';
  const thumbnailPath =
    'src/modules/document-composer/components/DocumentPageThumbnail.tsx';
  const reviewScreen = readSource(reviewPath);
  const listItem = readSource(listItemPath);
  const card = readSource(cardPath);
  const nearbySheet = readSource(nearbySheetPath);
  const moveSheet = readSource(moveSheetPath);
  const grid = readSource(gridPath);
  const thumbnail = readSource(thumbnailPath);
  const featureSources = collectSources(
    path.join(root, 'src/modules/document-composer')
  );

  it('keeps the main document virtualized with a normal FlatList', () => {
    expect(reviewScreen).toContain('<FlatList');
    expect(reviewScreen).toContain('keyExtractor={page => page.id}');
    expect(reviewScreen).toContain('getItemLayout=');
    expect(reviewScreen).toContain('maxToRenderPerBatch={5}');
    expect(reviewScreen).toContain('windowSize={5}');
    expect(reviewScreen).not.toMatch(/<Sortable(?:Grid)?\b/);
  });

  it('uses the DnD dependency only inside the nearby grid', () => {
    const dndSources = featureSources.filter(sourcePath =>
      fs
        .readFileSync(sourcePath, 'utf8')
        .includes('react-native-reanimated-dnd')
    );

    expect(dndSources).toEqual([path.join(root, gridPath)]);
    expect(grid).toContain('<SortableGrid');
    expect(grid).toContain('<SortableGridItem');
    expect(grid).toContain('strategy={GridStrategy.Insert}');
    expect(grid).toContain('scrollEnabled={false}');
  });

  it('opens the grid from a short press without a main-list gesture', () => {
    expect(card).toContain(
      'onPress={() => onReorderNearby(page.id)}'
    );
    expect(card).toContain('name="gridNine"');
    expect(card).not.toContain('name="dotsSixVertical"');
    expect(listItem).not.toContain('onLongPress');
    expect(listItem).not.toContain('Gesture');
    expect(nearbySheet).toContain('NearbyPageReorderGrid');
    expect(moveSheet).toContain('AppTextInput');
    expect(nearbySheet).not.toContain('MovePageToPositionSheet');
    expect(moveSheet).not.toContain('NearbyPageReorderGrid');
  });

  it('opens preview from the card body and moving directly from its action', () => {
    expect(card).toContain('onPress={() => onView(page.id)}');
    expect(card).toContain(
      'onPress={() => onMoveToPosition(page.id)}'
    );
    expect(card).not.toContain('name="eye"');
    expect(reviewScreen).toContain(
      "setPageOrderRequest({ pageId, type: 'move' })"
    );
    expect(reviewScreen).toContain(
      'ref={nearbyOrderSheetRef}'
    );
    expect(reviewScreen).toContain(
      'ref={moveToPositionSheetRef}'
    );
  });

  it('does not keep the replaced local drag implementation', () => {
    [
      'src/modules/document-composer/components/LocalPageDragHandle.tsx',
      'src/modules/document-composer/components/LocalPageDragLayer.tsx',
      'src/modules/document-composer/components/LocalDraggablePageListItem.tsx',
      'src/modules/document-composer/hooks/useLocalPageDrag.ts',
      'src/modules/document-composer/domain/localPageDragGeometry.ts',
    ].forEach(relativePath => {
      expect(fs.existsSync(path.join(root, relativePath))).toBe(false);
    });
  });

  it('keeps the page card presentational', () => {
    expect(card).toContain(
      'onReorderNearby: (pageId: string) => void'
    );
    expect(card).not.toContain('react-native-reanimated-dnd');
    expect(card).not.toContain('useDocumentComposerStore');
    expect(card).not.toContain('SortableGridItem');
  });

  it('does not render PdfView or a save-order step in list/grid UI', () => {
    expect(
      [
        reviewScreen,
        listItem,
        card,
        nearbySheet,
        moveSheet,
        grid,
      ].join('\n')
    ).not.toContain('PdfView');
    expect(grid).not.toContain('Guardar orden');
    expect(nearbySheet).not.toContain('Guardar orden');
    expect(moveSheet).not.toContain('Guardar orden');
  });

  it('preserves the document aspect ratio in thumbnails', () => {
    expect(thumbnail).toContain("resizeMode: 'contain'");
  });
});
