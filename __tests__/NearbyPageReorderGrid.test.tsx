import React from 'react';
import {
  act,
  fireEvent,
  render,
} from '@testing-library/react-native';
import NearbyPageReorderGrid from '@/modules/document-composer/components/NearbyPageReorderGrid';
import type { ComposerPage } from '@/modules/document-composer/types/documentComposer.types';

type MockGridProps = {
  data: ComposerPage[];
  dimensions: { columns?: number };
  scrollEnabled?: boolean;
  itemKeyExtractor: (page: ComposerPage, index: number) => string;
  renderItem: (props: Record<string, unknown>) => React.ReactNode;
};

type MockGridItemProps = {
  id: string;
  activationDelay?: number;
  onDragStart?: (id: string, index: number) => void;
  onDrop?: (
    id: string,
    index: number,
    positions?: Record<string, { index: number }>
  ) => void;
  onMove?: () => void;
  onDragging?: (
    id: string,
    overItemId: string | null,
    x: number,
    y: number
  ) => void;
};

let mockGridProps: MockGridProps | undefined;
const mockGridItems = new Map<string, MockGridItemProps>();
const mockToastSuccess = jest.fn();
const mockToastDismiss = jest.fn();

jest.mock('react-native-reanimated-dnd', () => {
  const { View } = jest.requireActual('react-native');
  return {
    GridStrategy: { Insert: 'insert' },
    SortableGrid: (props: MockGridProps) => {
      mockGridProps = props;
      return (
        <View>
          {props.data.map((item, index) =>
            props.renderItem({
              item,
              index,
              id: item.id,
              positions: { value: {} },
              scrollY: { value: 0 },
              scrollX: { value: 0 },
              autoScrollDirection: { value: 'none' },
              itemsCount: props.data.length,
              dimensions: props.dimensions,
              orientation: 'vertical',
              strategy: 'insert',
            })
          )}
        </View>
      );
    },
    SortableGridItem: ({
      children,
      ...props
    }: MockGridItemProps & { children: React.ReactNode }) => {
      mockGridItems.set(props.id, props);
      return <View>{children}</View>;
    },
  };
});

jest.mock('sonner-native', () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    dismiss: (...args: unknown[]) => mockToastDismiss(...args),
  },
}));

jest.mock('react-native-unistyles', () => ({
  StyleSheet: {
    create: () =>
      new Proxy(
        {},
        {
          get: () => ({}),
        }
      ),
  },
  useUnistyles: () => ({
    theme: {
      spacing: { xs: 4, sm: 8 },
    },
  }),
}));

jest.mock('@/components/typography/AppText', () => {
  const { Text } = jest.requireActual('react-native');
  return ({ children }: { children: React.ReactNode }) => (
    <Text>{children}</Text>
  );
});

jest.mock('@/components/buttons/AppButton', () => {
  const { Pressable, Text } = jest.requireActual('react-native');
  return {
    AppButton: ({
      text,
      onPress,
      testID,
      accessibilityLabel,
    }: {
      text: string;
      onPress: () => void;
      testID?: string;
      accessibilityLabel?: string;
    }) => (
      <Pressable
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
      >
        <Text>{text}</Text>
      </Pressable>
    ),
  };
});

jest.mock(
  '@/modules/document-composer/components/DocumentPageThumbnail',
  () => () => null
);

jest.mock(
  '@/modules/document-composer/hooks/usePageThumbnail',
  () => ({
    usePageThumbnail: () => ({
      thumbnailUri: undefined,
      isLoading: false,
    }),
  })
);

jest.mock(
  '@/modules/document-composer/utils/nearbyGridLayout',
  () => {
    const actual = jest.requireActual(
      '@/modules/document-composer/utils/nearbyGridLayout'
    );
    return {
      ...actual,
      calculateNearbyGridLayout: () => ({
      dimensions: {
        columns: 3,
        itemWidth: 100,
        itemHeight: 120,
        rowGap: 8,
        columnGap: 8,
      },
      width: 316,
      height: 120,
      ready: true,
    }),
    };
  }
);

const page = (id: string, order: number): ComposerPage => ({
  id,
  source: `${id}.jpg`,
  uri: `file:///${id}.jpg`,
  fileName: `${id}.jpg`,
  mimeType: 'image/jpeg',
  order,
  legibilityStatus: 'pending',
  origin: 'scanned',
  createdAt: '2026-07-23T00:00:00.000Z',
  ownedBySession: true,
});

const source = [page('a', 1), page('b', 2), page('c', 3)];
const sourceIds = source.map(item => item.id);

const renderGrid = async (
  pages = source,
  onApplyOrder = jest.fn(),
  onMoveToPosition = jest.fn()
) => {
  const screen = await render(
    <NearbyPageReorderGrid
      pages={pages}
      rangePageIds={sourceIds}
      selectedPageId="b"
      onApplyOrder={onApplyOrder}
      onMoveToPosition={onMoveToPosition}
    />
  );
  return { screen, onApplyOrder, onMoveToPosition };
};

describe('NearbyPageReorderGrid', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGridProps = undefined;
    mockGridItems.clear();
  });

  it('uses a non-scrolling three-column grid with stable IDs', async () => {
    const { screen } = await renderGrid();

    expect(mockGridProps?.data).toHaveLength(3);
    expect(mockGridProps?.dimensions.columns).toBe(3);
    expect(mockGridProps?.scrollEnabled).toBe(false);
    expect(mockGridProps?.itemKeyExtractor(source[1], 1)).toBe('b');
    expect(mockGridItems.get('b')?.activationDelay).toBe(0);
    expect(screen.getByText('Seleccionada')).toBeTruthy();
  });

  it('shows active feedback only during a drag', async () => {
    const { screen } = await renderGrid();

    await act(() => {
      mockGridItems.get('b')?.onDragStart?.('b', 1);
    });
    expect(screen.getByTestId('active-page-b')).toBeTruthy();

    await act(() => {
      mockGridItems.get('b')?.onDrop?.('b', 1, {
        a: { index: 0 },
        b: { index: 1 },
        c: { index: 2 },
      });
    });
    expect(screen.queryByTestId('active-page-b')).toBeNull();
  });

  it('applies one complete update only at the end of a changed drop', async () => {
    const { onApplyOrder } = await renderGrid();
    const item = mockGridItems.get('b');

    expect(item?.onMove).toBeUndefined();
    await act(() => {
      item?.onDragStart?.('b', 1);
      item?.onDragging?.('b', null, 0, 0);
      item?.onDrop?.('b', 0, {
        a: { index: 2 },
        b: { index: 0 },
        c: { index: 1 },
      });
    });

    expect(onApplyOrder).toHaveBeenCalledTimes(1);
    expect(onApplyOrder).toHaveBeenCalledWith(
      sourceIds,
      ['b', 'c', 'a']
    );
  });

  it('opens the numeric move for whichever page is dropped on the action', async () => {
    const onApplyOrder = jest.fn();
    const onMoveToPosition = jest.fn();
    const { screen } = await renderGrid(
      source,
      onApplyOrder,
      onMoveToPosition
    );
    const item = mockGridItems.get('c');

    await act(() => {
      item?.onDragStart?.('c', 2);
      item?.onDragging?.('c', null, 0, 100);
    });
    expect(
      screen.getByText('Suelta aquí para mover la página 3')
    ).toBeTruthy();

    await act(() => {
      item?.onDrop?.('c', 0, {
        a: { index: 1 },
        b: { index: 2 },
        c: { index: 0 },
      });
    });

    expect(onMoveToPosition).toHaveBeenCalledTimes(1);
    expect(onMoveToPosition).toHaveBeenCalledWith('c');
    expect(onApplyOrder).not.toHaveBeenCalled();
  });

  it('cancels a drop outside the grid and the move action', async () => {
    const onApplyOrder = jest.fn();
    const onMoveToPosition = jest.fn();
    await renderGrid(source, onApplyOrder, onMoveToPosition);
    const item = mockGridItems.get('c');

    await act(() => {
      item?.onDragStart?.('c', 2);
      item?.onDragging?.('c', null, 1000, 1000);
      item?.onDrop?.('c', 0, {
        a: { index: 1 },
        b: { index: 2 },
        c: { index: 0 },
      });
    });

    expect(onApplyOrder).not.toHaveBeenCalled();
    expect(onMoveToPosition).not.toHaveBeenCalled();
  });

  it('keeps the move action available by tap for the opening page', async () => {
    const onMoveToPosition = jest.fn();
    const { screen } = await renderGrid(
      source,
      jest.fn(),
      onMoveToPosition
    );

    await fireEvent.press(
      screen.getByTestId('move-to-position-drop-target')
    );

    expect(onMoveToPosition).toHaveBeenCalledWith('b');
  });

  it.each([
    {
      name: 'identical',
      positions: {
        a: { index: 0 },
        b: { index: 1 },
        c: { index: 2 },
      },
    },
    {
      name: 'duplicate',
      positions: {
        a: { index: 0 },
        b: { index: 0 },
        c: { index: 2 },
      },
    },
    {
      name: 'unknown',
      positions: {
        a: { index: 0 },
        b: { index: 1 },
        missing: { index: 2 },
      },
    },
    {
      name: 'incomplete',
      positions: {
        a: { index: 0 },
        b: { index: 1 },
      },
    },
  ])('ignores an $name result', async ({ positions }) => {
    const { onApplyOrder } = await renderGrid();

    await act(() => {
      mockGridItems.get('b')?.onDrop?.(
        'b',
        0,
        positions as unknown as Record<string, { index: number }>
      );
    });

    expect(onApplyOrder).not.toHaveBeenCalled();
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });

  it('undoes only the latest applied drop with one store call', async () => {
    const onApplyOrder = jest.fn();
    const first = await renderGrid(source, onApplyOrder);

    await act(() => {
      mockGridItems.get('b')?.onDragStart?.('b', 1);
      mockGridItems.get('b')?.onDragging?.('b', null, 0, 0);
      mockGridItems.get('b')?.onDrop?.('b', 0, {
        a: { index: 2 },
        b: { index: 0 },
        c: { index: 1 },
      });
    });
    const reordered = [source[1], source[2], source[0]];
    await first.screen.rerender(
      <NearbyPageReorderGrid
        pages={reordered}
        rangePageIds={sourceIds}
        selectedPageId="b"
        onApplyOrder={onApplyOrder}
        onMoveToPosition={jest.fn()}
      />
    );

    await act(() => {
      mockGridItems.get('c')?.onDragStart?.('c', 1);
      mockGridItems.get('c')?.onDragging?.('c', null, 0, 0);
      mockGridItems.get('c')?.onDrop?.('c', 0, {
        a: { index: 2 },
        b: { index: 1 },
        c: { index: 0 },
      });
    });

    expect(onApplyOrder).toHaveBeenCalledTimes(2);
    expect(mockToastSuccess).toHaveBeenCalledTimes(2);
    expect(mockToastSuccess.mock.calls[0][1].id).toBe(
      mockToastSuccess.mock.calls[1][1].id
    );
    const latestUndo =
      mockToastSuccess.mock.calls[1][1].action.onClick;

    onApplyOrder.mockClear();
    await act(() => latestUndo());

    expect(onApplyOrder).toHaveBeenCalledTimes(1);
    expect(onApplyOrder).toHaveBeenCalledWith(sourceIds, [
      'b',
      'c',
      'a',
    ]);
  });

  it('unmounts without applying or reverting another order', async () => {
    const { screen, onApplyOrder } = await renderGrid();

    await screen.unmount();

    expect(onApplyOrder).not.toHaveBeenCalled();
    expect(mockToastDismiss).not.toHaveBeenCalled();
  });
});
