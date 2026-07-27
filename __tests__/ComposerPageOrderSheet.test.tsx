import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
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

const selectedPage: ComposerPage = {
  id: 'page-3',
  source: 'page-3.jpg',
  uri: 'file:///page-3.jpg',
  fileName: 'page-3.jpg',
  mimeType: 'image/jpeg',
  order: 3,
  legibilityStatus: 'pending',
  origin: 'scanned',
  createdAt: '2026-07-23T00:00:00.000Z',
  ownedBySession: true,
};

describe('ComposerPageOrderSheet', () => {
  it('rejects invalid or unchanged values and confirms once', async () => {
    const onMove = jest.fn();
    const screen = await render(
      <ComposerPageOrderSheet
        ref={{ current: { dismiss: jest.fn() } } as never}
        page={selectedPage}
        pageCount={5}
        onMoveToPosition={onMove}
        onDismiss={jest.fn()}
      />
    );
    const input = screen.getByPlaceholderText('Entre 1 y 5');
    const moveButton = screen.getByText('Mover');

    for (const invalid of ['0', '6', '2.5', 'abc', '3']) {
      await fireEvent.changeText(input, invalid);
      await fireEvent.press(moveButton);
    }
    expect(onMove).not.toHaveBeenCalled();

    await fireEvent.changeText(input, '5');
    expect(
      screen.getByText('La página quedará en la posición 5.')
    ).toBeTruthy();
    await fireEvent.press(moveButton);

    expect(onMove).toHaveBeenCalledTimes(1);
    expect(onMove).toHaveBeenCalledWith('page-3', 5);
  });

  it('cancels without moving the page', async () => {
    const dismiss = jest.fn();
    const onMove = jest.fn();
    const screen = await render(
      <ComposerPageOrderSheet
        ref={{ current: { dismiss } } as never}
        page={selectedPage}
        pageCount={5}
        onMoveToPosition={onMove}
        onDismiss={jest.fn()}
      />
    );

    await fireEvent.press(screen.getByText('Cancelar'));

    expect(dismiss).toHaveBeenCalledTimes(1);
    expect(onMove).not.toHaveBeenCalled();
  });
});
