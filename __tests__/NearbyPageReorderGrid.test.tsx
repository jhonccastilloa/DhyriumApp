import React from 'react';
import {
  act,
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
  onDrop?: (
    id: string,
    index: number,
    positions?: Record<string, { index: number }>
  ) => void;
  onMove?: () => void;
};

let mockGridProps: MockGridProps | undefined;
const mockGridItems = new Map<string, MockGridItemProps>();

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

const renderGrid = async (
  pages = source,
  onOrderChange = jest.fn()
) => {
  const screen = await render(
    <NearbyPageReorderGrid
      pages={pages}
      rangeStart={1}
      selectedPageId="b"
      pdfSources={[]}
      onOrderChange={onOrderChange}
    />
  );
  return { screen, onOrderChange };
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

  it('emits one complete local order only at the end of a changed drop', async () => {
    const { onOrderChange } = await renderGrid();
    const item = mockGridItems.get('b');

    expect(item?.onMove).toBeUndefined();
    await act(() => {
      item?.onDrop?.('b', 0, {
        a: { index: 2 },
        b: { index: 0 },
        c: { index: 1 },
      });
    });

    expect(onOrderChange).toHaveBeenCalledTimes(1);
    expect(onOrderChange).toHaveBeenCalledWith(['b', 'c', 'a']);
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
    const { onOrderChange } = await renderGrid();

    await act(() => {
      mockGridItems.get('b')?.onDrop?.(
        'b',
        0,
        positions as unknown as Record<string, { index: number }>
      );
    });

    expect(onOrderChange).not.toHaveBeenCalled();
  });

  it('shows the proposed absolute positions after a local reorder', async () => {
    const screen = await render(
      <NearbyPageReorderGrid
        pages={[source[1], source[2], source[0]]}
        rangeStart={10}
        selectedPageId="b"
        pdfSources={[]}
        onOrderChange={jest.fn()}
      />
    );

    expect(screen.getByText('10')).toBeTruthy();
    expect(screen.getByText('11')).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();
  });

  it('accepts a parent-provided local order without applying global state', async () => {
    const onOrderChange = jest.fn();
    const first = await renderGrid(source, onOrderChange);
    const reordered = [source[1], source[2], source[0]];
    await first.screen.rerender(
      <NearbyPageReorderGrid
        pages={reordered}
        rangeStart={1}
        selectedPageId="b"
        pdfSources={[]}
        onOrderChange={onOrderChange}
      />
    );

    await act(() => {
      mockGridItems.get('c')?.onDrop?.('c', 0, {
        a: { index: 2 },
        b: { index: 1 },
        c: { index: 0 },
      });
    });

    expect(onOrderChange).toHaveBeenCalledTimes(1);
    expect(onOrderChange).toHaveBeenCalledWith(['c', 'b', 'a']);
  });

  it('unmounts without emitting another order', async () => {
    const { screen, onOrderChange } = await renderGrid();

    await screen.unmount();

    expect(onOrderChange).not.toHaveBeenCalled();
  });
});
