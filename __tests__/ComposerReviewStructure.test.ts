declare const __dirname: string;

const readSource = (relativePath: string) =>
  require('fs').readFileSync(
    `${__dirname}/../${relativePath}`,
    'utf8'
  );

describe('ComposerReview reorder structure', () => {
  const reviewScreen = readSource(
    'src/modules/document-composer/screens/ComposerReviewScreen.tsx'
  );
  const localDragSources = [
    'src/modules/document-composer/components/LocalDraggablePageListItem.tsx',
    'src/modules/document-composer/components/LocalPageDragHandle.tsx',
    'src/modules/document-composer/components/LocalPageDragLayer.tsx',
    'src/modules/document-composer/hooks/useLocalPageDrag.ts',
    'src/modules/document-composer/domain/localPageDragGeometry.ts',
  ].map(readSource);
  const dragHandle = localDragSources[1];

  it('keeps the main document virtualized with FlatList', () => {
    expect(reviewScreen).toContain('<FlatList');
    expect(reviewScreen).toContain('keyExtractor={page => page.id}');
    expect(reviewScreen).toContain('getItemLayout=');
  });

  it('does not mount a global Sortable or use the DnD package', () => {
    expect(reviewScreen).not.toMatch(/<Sortable(?:Grid)?\b/);
    expect(
      [reviewScreen, ...localDragSources].join('\n')
    ).not.toContain('react-native-reanimated-dnd');
  });

  it('does not render PdfView in list or drag components', () => {
    expect(
      [reviewScreen, ...localDragSources].join('\n')
    ).not.toContain('PdfView');
  });

  it('composes short tap after the long-press drag gesture', () => {
    expect(dragHandle).toContain(
      'Gesture.Exclusive(dragGesture, tapGesture)'
    );
    expect(dragHandle).toContain(
      'scheduleOnRN(onRequestMoveToPosition, pageId)'
    );
  });

  it('replaces normal footer actions with one full-width drag target', () => {
    const dragLayer = localDragSources[2];

    expect(reviewScreen).toContain(
      "pointerEvents={isDragging ? 'none' : 'auto'}"
    );
    expect(reviewScreen).toContain(
      'isDragging && styles.hiddenActions'
    );
    expect(dragLayer).toContain('Mover a otra posición');
    expect(dragLayer).not.toContain('Suelta para cancelar');
  });
});
