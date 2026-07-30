import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import DocumentPageListItem from '@/modules/document-composer/components/DocumentPageListItem';
import type { ComposerPage } from '@/modules/document-composer/types/documentComposer.types';

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
    const { Pressable, View } = jest.requireActual('react-native');
    return ({
      page,
      onView,
      onMoveToPosition,
      onReorderNearby,
    }: {
      page: ComposerPage;
      onView: (pageId: string) => void;
      onMoveToPosition: (pageId: string) => void;
      onReorderNearby: (pageId: string) => void;
    }) => (
      <View>
        <Pressable
          accessibilityLabel={`Ver página ${page.order}`}
          onPress={() => onView(page.id)}
        />
        <Pressable
          accessibilityLabel={`Mover página ${page.order} a otra posición`}
          onPress={() => onMoveToPosition(page.id)}
        />
        <Pressable
          accessibilityLabel={`Reordenar cerca de la página ${page.order}`}
          onPress={() => onReorderNearby(page.id)}
        />
      </View>
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
        onMoveToPosition={jest.fn()}
        onReorderNearby={onOrder}
      />
    );

    await fireEvent.press(
      screen.getByLabelText('Reordenar cerca de la página 25')
    );

    expect(onOrder).toHaveBeenCalledTimes(1);
    expect(onOrder).toHaveBeenCalledWith('page-25');
  });

  it('opens preview from the page body and numeric moving from its action', async () => {
    const onView = jest.fn();
    const onMoveToPosition = jest.fn();
    const screen = await render(
      <DocumentPageListItem
        page={selectedPage}
        onView={onView}
        onDelete={jest.fn()}
        onMoveToPosition={onMoveToPosition}
        onReorderNearby={jest.fn()}
      />
    );

    await fireEvent.press(screen.getByLabelText('Ver página 25'));
    await fireEvent.press(
      screen.getByLabelText('Mover página 25 a otra posición')
    );

    expect(onView).toHaveBeenCalledWith('page-25');
    expect(onMoveToPosition).toHaveBeenCalledWith('page-25');
  });
});
