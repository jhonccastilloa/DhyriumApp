import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import MovePageToPositionSheet from '@/modules/document-composer/components/MovePageToPositionSheet';
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
      border: { hairline: 1 },
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

describe('MovePageToPositionSheet', () => {
  it('validates and submits the selected page position', async () => {
    const onMove = jest.fn();
    const screen = await render(
      <MovePageToPositionSheet
        ref={{ current: null }}
        page={pages[2]}
        pages={pages}
        isActive
        onMove={onMove}
        onDismiss={jest.fn()}
      />
    );
    const input = screen.getByPlaceholderText('Entre 1 y 5');

    await fireEvent.changeText(input, '5');
    expect(
      screen.getByText('La página quedará en la posición 5.')
    ).toBeTruthy();
    await fireEvent.press(screen.getByText('Mover'));

    expect(onMove).toHaveBeenCalledWith('page-3', 5);
  });

  it('rejects the current position', async () => {
    const onMove = jest.fn();
    const screen = await render(
      <MovePageToPositionSheet
        ref={{ current: null }}
        page={pages[2]}
        pages={pages}
        isActive
        onMove={onMove}
        onDismiss={jest.fn()}
      />
    );

    await fireEvent.changeText(
      screen.getByPlaceholderText('Entre 1 y 5'),
      '3'
    );
    await fireEvent.press(screen.getByText('Mover'));

    expect(screen.getByText('La página ya está en esa posición.')).toBeTruthy();
    expect(onMove).not.toHaveBeenCalled();
  });
});
