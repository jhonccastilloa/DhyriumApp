import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import NearbyPageReorderGrid from '@/modules/document-composer/components/NearbyPageReorderGrid';
import type { ComposerPage } from '@/modules/document-composer/types/documentComposer.types';

jest.mock('react-native-unistyles', () => ({
  StyleSheet: {
    create: () => ({
      content: {},
      gridArea: {},
      gridFrame: {},
      compactPage: {},
      compactPageSelected: {},
      compactPageActive: {},
      compactNumber: {},
      selectedBadge: {},
      activeIndicator: {},
      actions: {},
      action: {},
    }),
  },
}));

jest.mock('react-native-reanimated-dnd', () => ({
  GridStrategy: { Insert: 'insert' },
  SortableGrid: () => null,
  SortableGridItem: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/components/buttons/AppButton', () => {
  const { Pressable, Text } = jest.requireActual('react-native');
  return {
    AppButton: ({
      text,
      onPress,
    }: {
      text: string;
      onPress: () => void;
    }) => (
      <Pressable onPress={onPress}>
        <Text>{text}</Text>
      </Pressable>
    ),
  };
});

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

describe('NearbyPageReorderGrid', () => {
  it('closes without committing the local order when canceled', async () => {
    const onCancel = jest.fn();
    const onSave = jest.fn();
    const screen = await render(
      <NearbyPageReorderGrid
        pages={[page('a', 1), page('b', 2), page('c', 3)]}
        selectedPageId="b"
        onCancel={onCancel}
        onSave={onSave}
      />
    );

    fireEvent.press(screen.getByText('Cancelar'));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('commits the complete local ID order once when saved', async () => {
    const onSave = jest.fn();
    const screen = await render(
      <NearbyPageReorderGrid
        pages={[page('a', 1), page('b', 2), page('c', 3)]}
        selectedPageId="b"
        onCancel={jest.fn()}
        onSave={onSave}
      />
    );

    fireEvent.press(screen.getByText('Guardar orden'));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(['a', 'b', 'c']);
  });
});
