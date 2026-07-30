import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import DocumentPageListItem from '@/modules/document-composer/components/DocumentPageListItem';
import type { ComposerPage } from '@/modules/document-composer/types/documentComposer.types';

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
      colors: { navigation: { active: '#000' } },
    },
  }),
}));

jest.mock('@/components/icons/AppIcon', () => () => null);

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
  '@/modules/document-composer/components/AppDocumentPageCard',
  () => {
    const { View } = jest.requireActual('react-native');
    return ({ orderControl }: { orderControl: React.ReactNode }) => (
      <View>{orderControl}</View>
    );
  }
);

const selectedPage: ComposerPage = {
  id: 'page-25',
  source: 'page-25.jpg',
  uri: 'file:///page-25.jpg',
  fileName: 'page-25.jpg',
  mimeType: 'image/jpeg',
  order: 25,
  legibilityStatus: 'pending',
  origin: 'scanned',
  createdAt: '2026-07-23T00:00:00.000Z',
  ownedBySession: true,
};

describe('DocumentPageListItem', () => {
  it('opens nearby ordering from one short press on the six-dot control', async () => {
    const onOrder = jest.fn();
    const screen = await render(
      <DocumentPageListItem
        page={selectedPage}
        onView={jest.fn()}
        onDelete={jest.fn()}
        onOrder={onOrder}
      />
    );

    await fireEvent.press(
      screen.getByLabelText('Reordenar cerca de la página 25')
    );

    expect(onOrder).toHaveBeenCalledTimes(1);
    expect(onOrder).toHaveBeenCalledWith('page-25');
  });
});
