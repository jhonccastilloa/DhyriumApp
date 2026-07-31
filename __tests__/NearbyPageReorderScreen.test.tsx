import React from 'react';
import { Alert } from 'react-native';
import {
  act,
  fireEvent,
  render,
  waitFor,
} from '@testing-library/react-native';
import NearbyPageReorderScreen from '@/modules/document-composer/screens/NearbyPageReorderScreen';
import type {
  ComposerPage,
  ComposerSession,
} from '@/modules/document-composer/types/documentComposer.types';

const mockGoBack = jest.fn();
const mockDispatch = jest.fn();
const mockApplyNearbyPageOrder = jest.fn(() => true);
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();
let mockPreventRemoveEnabled = false;
let mockPreventRemoveCallback:
  | ((options: { data: { action: { type: string } } }) => void)
  | undefined;
let mockSession: ComposerSession;

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
    dispatch: mockDispatch,
  }),
  usePreventRemove: (
    enabled: boolean,
    callback: (options: {
      data: { action: { type: string } };
    }) => void,
  ) => {
    mockPreventRemoveEnabled = enabled;
    mockPreventRemoveCallback = callback;
  },
}));

jest.mock('sonner-native', () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

jest.mock('react-native-unistyles', () => ({
  StyleSheet: {
    create: () => new Proxy({}, { get: () => ({}) }),
  },
}));

jest.mock('@/components/layout/AppFlex', () => {
  const { View } = jest.requireActual('react-native');
  return ({ children }: { children: React.ReactNode }) => (
    <View>{children}</View>
  );
});

jest.mock('@/components/navigation/AppHeader', () => {
  const { Pressable, Text, View } = jest.requireActual('react-native');
  return ({
    title,
    onBack,
  }: {
    title: string;
    onBack?: () => void;
  }) => (
    <View>
      <Text>{title}</Text>
      {onBack ? (
        <Pressable accessibilityLabel="Volver" onPress={onBack} />
      ) : null}
    </View>
  );
});

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
      disabled,
      onPress,
    }: {
      text: string;
      disabled?: boolean;
      onPress: () => void;
    }) => (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={text}
        accessibilityState={{ disabled }}
        testID={`button-${text}`}
        disabled={disabled}
        onPress={onPress}
      >
        <Text>{text}</Text>
      </Pressable>
    ),
  };
});

jest.mock(
  '@/modules/document-composer/components/NearbyPageReorderGrid',
  () => {
    const { Pressable, Text } = jest.requireActual('react-native');
    return ({
      pages,
      onOrderChange,
    }: {
      pages: ComposerPage[];
      onOrderChange: (pageIds: string[]) => void;
    }) => (
      <Pressable
        accessibilityLabel="Mover páginas"
        onPress={() =>
          onOrderChange(pages.map(page => page.id).reverse())
        }
      >
        <Text>Grid</Text>
      </Pressable>
    );
  },
);

jest.mock(
  '@/modules/document-composer/state/useDocumentComposerStore',
  () => ({
    useDocumentComposerStore: (
      selector: (state: {
        session: ComposerSession;
        applyNearbyPageOrder: typeof mockApplyNearbyPageOrder;
      }) => unknown,
    ) =>
      selector({
        session: mockSession,
        applyNearbyPageOrder: mockApplyNearbyPageOrder,
      }),
  }),
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
  createdAt: '2026-07-30T00:00:00.000Z',
  ownedBySession: true,
});

const createSession = (): ComposerSession => ({
  id: 'session',
  mode: 'tool',
  source: 'scanner',
  name: 'Document',
  pages: [page('a', 1), page('b', 2), page('c', 3)],
  status: 'reviewing',
  uploadProgress: 0,
  createdAt: '2026-07-30T00:00:00.000Z',
  updatedAt: '2026-07-30T00:00:00.000Z',
});

const renderScreen = () =>
  render(
    <NearbyPageReorderScreen
      route={{
        params: { pageId: 'b' },
      }}
    />,
  );

describe('NearbyPageReorderScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSession = createSession();
    mockApplyNearbyPageOrder.mockReturnValue(true);
    mockPreventRemoveEnabled = false;
    mockPreventRemoveCallback = undefined;
  });

  it('keeps drops local and applies the final order once on confirm', async () => {
    const screen = await renderScreen();

    expect(
      screen.getByTestId('button-Confirmar').props.accessibilityState,
    ).toEqual({ disabled: true });

    await fireEvent.press(screen.getByLabelText('Mover páginas'));

    expect(mockApplyNearbyPageOrder).not.toHaveBeenCalled();
    expect(mockPreventRemoveEnabled).toBe(true);

    await fireEvent.press(screen.getByTestId('button-Confirmar'));

    expect(mockApplyNearbyPageOrder).toHaveBeenCalledTimes(1);
    expect(mockApplyNearbyPageOrder).toHaveBeenCalledWith(
      ['a', 'b', 'c'],
      ['c', 'b', 'a'],
    );
    expect(mockToastSuccess).toHaveBeenCalledWith('Orden actualizado');
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('asks before discarding a changed local order', async () => {
    const alert = jest.spyOn(Alert, 'alert');
    const screen = await renderScreen();

    await fireEvent.press(screen.getByLabelText('Mover páginas'));
    await act(async () => {
      mockPreventRemoveCallback?.({
        data: { action: { type: 'GO_BACK' } },
      });
    });

    expect(alert).toHaveBeenCalledWith(
      'Descartar cambios',
      'El orden de las páginas todavía no se ha confirmado.',
      expect.any(Array),
    );

    const actions = alert.mock.calls[0][2];
    const discard = actions?.find(action => action.text === 'Descartar');
    await act(async () => {
      discard?.onPress?.();
    });

    expect(mockApplyNearbyPageOrder).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'GO_BACK' });
    });
    alert.mockRestore();
  });

  it('stays on screen when the range can no longer be applied', async () => {
    mockApplyNearbyPageOrder.mockReturnValue(false);
    const screen = await renderScreen();

    await fireEvent.press(screen.getByLabelText('Mover páginas'));
    await fireEvent.press(screen.getByTestId('button-Confirmar'));

    expect(mockToastError).toHaveBeenCalledTimes(1);
    expect(mockGoBack).not.toHaveBeenCalled();
  });
});
