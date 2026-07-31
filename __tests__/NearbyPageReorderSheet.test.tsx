import React from 'react';
import { render } from '@testing-library/react-native';
import NearbyPageReorderSheet from '@/modules/document-composer/components/NearbyPageReorderSheet';
import type { ComposerPage } from '@/modules/document-composer/types/documentComposer.types';

jest.mock('react-native-unistyles', () => ({
  StyleSheet: {
    create: () =>
      new Proxy({}, { get: () => ({}) }),
  },
  useUnistyles: () => ({
    theme: {
      colors: {
        icon: { secondary: '#000' },
        surface: { background: { elements: '#fff' } },
      },
      radius: { sm: 4 },
    },
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 10, bottom: 10, left: 0, right: 0 }),
}));

jest.mock('@/components/bottom-sheets/AppBottomSheetModal', () => {
  const { View } = jest.requireActual('react-native');
  return ({ children }: { children: React.ReactNode }) => (
    <View>{children}</View>
  );
});

jest.mock('@/components/layout/AppFlex', () => {
  const { View } = jest.requireActual('react-native');
  return ({ children }: { children: React.ReactNode }) => (
    <View>{children}</View>
  );
});

jest.mock('@/components/typography/AppText', () => {
  const { Text } = jest.requireActual('react-native');
  return ({ children }: { children: React.ReactNode }) => (
    <Text>{children}</Text>
  );
});

jest.mock('@/components/icons/AppIcon', () => () => null);

jest.mock(
  '@/modules/document-composer/components/NearbyPageReorderGrid',
  () => {
    const { Text, View } = jest.requireActual('react-native');
    return ({
      pages,
      selectedPageId,
    }: {
      pages: ComposerPage[];
      selectedPageId: string;
    }) => (
      <View testID="nearby-grid">
        <Text>{`${pages.length}:${selectedPageId}`}</Text>
      </View>
    );
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

const pages = Array.from({ length: 5 }, (_, index) =>
  page(`page-${index + 1}`, index + 1)
);

describe('NearbyPageReorderSheet', () => {
  it('renders only the nearby reorder flow', async () => {
    const screen = await render(
      <NearbyPageReorderSheet
        ref={{ current: null }}
        page={pages[2]}
        pages={pages}
        isActive
        onApplyOrder={jest.fn()}
        onDismiss={jest.fn()}
      />
    );

    expect(screen.getByTestId('nearby-grid')).toBeTruthy();
    expect(screen.getByText('Reordenar cerca de la página 3')).toBeTruthy();
    expect(screen.queryByPlaceholderText('Entre 1 y 5')).toBeNull();
  });

});
