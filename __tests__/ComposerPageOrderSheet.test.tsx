import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { BackHandler } from 'react-native';
import ComposerPageOrderSheet from '@/modules/document-composer/components/ComposerPageOrderSheet';
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
      colors: {
        icon: { secondary: '#000' },
      },
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

jest.mock('@/components/inputs/AppTextInput', () => {
  const { TextInput } = jest.requireActual('react-native');
  return ({
    value,
    onChangeValue,
    placeholder,
  }: {
    value: string;
    onChangeValue: (value: string) => void;
    placeholder: string;
  }) => (
    <TextInput
      value={value}
      onChangeText={onChangeValue}
      placeholder={placeholder}
    />
  );
});

jest.mock('@/components/buttons/AppButton', () => {
  const { Pressable, Text } = jest.requireActual('react-native');
  return {
    AppButton: ({
      text,
      onPress,
      disabled,
    }: {
      text: string;
      onPress: () => void;
      disabled?: boolean;
    }) => (
      <Pressable disabled={disabled} onPress={onPress}>
        <Text>{text}</Text>
      </Pressable>
    ),
  };
});

jest.mock(
  '@/modules/document-composer/components/NearbyPageReorderGrid',
  () => {
    const { Pressable, Text, View } = jest.requireActual('react-native');
    return ({
      pages,
      selectedPageId,
      onMoveToPosition,
    }: {
      pages: ComposerPage[];
      selectedPageId: string;
      onMoveToPosition: (pageId: string) => void;
    }) => (
      <View testID="nearby-grid">
        <Text>{`${pages.length}:${selectedPageId}`}</Text>
        <Pressable
          onPress={() => onMoveToPosition(selectedPageId)}
        >
          <Text>Mover página 3 a otra posición…</Text>
        </Pressable>
        <Pressable
          testID="move-page-4"
          onPress={() => onMoveToPosition(pages[3].id)}
        />
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
const selectedPage = pages[2];

const renderSheet = async (
  onMove = jest.fn(),
  dismiss = jest.fn(),
  initialStage: 'nearby' | 'move' = 'nearby'
) =>
  render(
    <ComposerPageOrderSheet
      ref={
        {
          current: { dismiss, snapToIndex: jest.fn() },
        } as never
      }
      page={selectedPage}
      pages={pages}
      initialStage={initialStage}
      onApplyNearbyOrder={jest.fn()}
      onMoveToPosition={onMove}
      onDismiss={jest.fn()}
    />
  );

describe('ComposerPageOrderSheet', () => {
  it('opens directly in the nearby grid without a method menu', async () => {
    const screen = await renderSheet();

    expect(screen.getByTestId('nearby-grid')).toBeTruthy();
    expect(screen.getByText('5:page-3')).toBeTruthy();
    expect(
      screen.getByText('Reordenar cerca de la página 3')
    ).toBeTruthy();
    expect(screen.queryByText('Reordenar cercanas')).toBeNull();
    expect(screen.queryByPlaceholderText('Entre 1 y 5')).toBeNull();
  });

  it('passes at most nine nearby pages to the temporary grid', async () => {
    const longDocument = Array.from({ length: 20 }, (_, index) =>
      page(`long-${index + 1}`, index + 1)
    );
    const screen = await render(
      <ComposerPageOrderSheet
        ref={
          {
            current: { dismiss: jest.fn(), snapToIndex: jest.fn() },
          } as never
        }
        page={longDocument[9]}
        pages={longDocument}
        onApplyNearbyOrder={jest.fn()}
        onMoveToPosition={jest.fn()}
        onDismiss={jest.fn()}
      />
    );

    expect(screen.getByText('9:long-10')).toBeTruthy();
  });

  it('opens the numeric form directly from the grid action', async () => {
    const screen = await renderSheet();

    await fireEvent.press(
      screen.getByText('Mover página 3 a otra posición…')
    );

    expect(screen.queryByTestId('nearby-grid')).toBeNull();
    expect(screen.getByText('Mover página 3')).toBeTruthy();
    expect(screen.getByPlaceholderText('Entre 1 y 5')).toBeTruthy();
  });

  it('can open directly in the numeric stage from the page action', async () => {
    const screen = await renderSheet(
      jest.fn(),
      jest.fn(),
      'move'
    );

    expect(screen.queryByTestId('nearby-grid')).toBeNull();
    expect(screen.getByText('Mover página 3')).toBeTruthy();
    expect(screen.getByPlaceholderText('Entre 1 y 5')).toBeTruthy();
  });

  it('moves the page chosen from the nearby grid', async () => {
    const onMove = jest.fn();
    const screen = await renderSheet(onMove);

    await fireEvent.press(screen.getByTestId('move-page-4'));
    expect(screen.getByText('Mover página 4')).toBeTruthy();
    expect(
      screen.getByText('Página 4 · page-4.jpg')
    ).toBeTruthy();

    await fireEvent.changeText(
      screen.getByPlaceholderText('Entre 1 y 5'),
      '1'
    );
    await fireEvent.press(screen.getByText('Mover'));

    expect(onMove).toHaveBeenCalledTimes(1);
    expect(onMove).toHaveBeenCalledWith('page-4', 1);
  });

  it('closes the nearby grid from the header without applying an order', async () => {
    const dismiss = jest.fn();
    const screen = await renderSheet(jest.fn(), dismiss);

    await fireEvent.press(screen.getByLabelText('Cerrar'));

    expect(dismiss).toHaveBeenCalledTimes(1);
  });

  it('closes and consumes the Android hardware-back event', async () => {
    const dismiss = jest.fn();
    const addListener = jest.spyOn(BackHandler, 'addEventListener');
    const screen = await renderSheet(jest.fn(), dismiss);
    const lastCall =
      addListener.mock.calls[addListener.mock.calls.length - 1];
    const handler = lastCall?.[1];

    expect(handler?.({} as never)).toBe(true);
    expect(dismiss).toHaveBeenCalledTimes(1);

    await screen.unmount();
    addListener.mockRestore();
  });

  it('rejects invalid or unchanged values and confirms once', async () => {
    const onMove = jest.fn();
    const screen = await renderSheet(onMove);
    await fireEvent.press(
      screen.getByText('Mover página 3 a otra posición…')
    );
    const input = screen.getByPlaceholderText('Entre 1 y 5');
    const moveButton = screen.getByText('Mover');

    for (const invalid of ['0', '6', '2.5', 'abc', '3']) {
      await fireEvent.changeText(input, invalid);
      await fireEvent.press(moveButton);
    }
    expect(onMove).not.toHaveBeenCalled();

    for (const valid of ['1', '2', '5']) {
      await fireEvent.changeText(input, valid);
      expect(
        screen.getByText(
          `La página quedará en la posición ${valid}.`
        )
      ).toBeTruthy();
    }
    await fireEvent.press(moveButton);

    expect(onMove).toHaveBeenCalledTimes(1);
    expect(onMove).toHaveBeenCalledWith('page-3', 5);
  });

  it('cancels the numeric form without moving the page', async () => {
    const dismiss = jest.fn();
    const onMove = jest.fn();
    const screen = await renderSheet(onMove, dismiss);
    await fireEvent.press(
      screen.getByText('Mover página 3 a otra posición…')
    );

    await fireEvent.press(screen.getByText('Cancelar'));

    expect(dismiss).toHaveBeenCalledTimes(1);
    expect(onMove).not.toHaveBeenCalled();
  });
});
