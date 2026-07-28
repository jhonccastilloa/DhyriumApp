import React from 'react';
import { act, render } from '@testing-library/react-native';
import LocalPageDragHandle from '@/modules/document-composer/components/LocalPageDragHandle';
import {
  LOCAL_DROP_TARGET,
  type LocalDragBounds,
} from '@/modules/document-composer/domain/localPageDragGeometry';
import type { LocalPageDragContext } from '@/modules/document-composer/hooks/useLocalPageDrag';

type MockGestureCallback = (...args: unknown[]) => void;
type MockGesture = {
  kind: 'pan' | 'tap' | 'exclusive';
  callbacks: Record<string, MockGestureCallback>;
  gestures?: MockGesture[];
};

const mockGestureState: {
  pan?: MockGesture;
  tap?: MockGesture;
  exclusive?: MockGesture;
} = {};
const mockMeasure = jest.fn();

jest.mock('react-native-gesture-handler', () => {
  const createGesture = (kind: 'pan' | 'tap') => {
    const gesture: MockGesture & Record<string, unknown> = {
      kind,
      callbacks: {},
    };
    [
      'activateAfterLongPress',
      'shouldCancelWhenOutside',
      'maxDuration',
    ].forEach(method => {
      gesture[method] = () => gesture;
    });
    ['onStart', 'onUpdate', 'onEnd', 'onFinalize'].forEach(method => {
      gesture[method] = (callback: MockGestureCallback) => {
        gesture.callbacks[method] = callback;
        return gesture;
      };
    });
    mockGestureState[kind] = gesture;
    return gesture;
  };

  return {
    Gesture: {
      Pan: () => createGesture('pan'),
      Tap: () => createGesture('tap'),
      Exclusive: (...gestures: MockGesture[]) => {
        const exclusive: MockGesture = {
          kind: 'exclusive',
          callbacks: {},
          gestures,
        };
        mockGestureState.exclusive = exclusive;
        return exclusive;
      },
    },
    GestureDetector: ({ children }: { children: React.ReactNode }) =>
      children,
  };
});

jest.mock('react-native-reanimated', () => {
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: { View },
    cancelAnimation: jest.fn(),
    measure: (ref: unknown) => mockMeasure(ref),
    useSharedValue: (value: unknown) => ({ value }),
    withTiming: (
      value: number,
      _config: unknown,
      callback?: (finished: boolean) => void
    ) => {
      callback?.(true);
      return value;
    },
  };
});

jest.mock('react-native-worklets', () => ({
  scheduleOnRN: (
    callback: (...args: unknown[]) => void,
    ...args: unknown[]
  ) => callback(...args),
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
      colors: {
        navigation: { active: '#000' },
      },
    },
  }),
}));

jest.mock('@/components/icons/AppIcon', () => () => null);

const shared = <T,>(value: T) => ({ value });
const measuredRef = (
  bounds: LocalDragBounds & { pageX: number; pageY: number }
) => ({ bounds });

const createContext = () => {
  const onStart = jest.fn();
  const onDraftIndexChange = jest.fn();
  const onAutoScroll = jest.fn();
  const onFinish = jest.fn();
  const onRequestMoveToPosition = jest.fn();
  const dragLayerRef = measuredRef({
    x: 0,
    y: 0,
    pageX: 0,
    pageY: 0,
    width: 400,
    height: 800,
  });
  const listViewportRef = measuredRef({
    x: 16,
    y: 100,
    pageX: 16,
    pageY: 100,
    width: 368,
    height: 560,
  });
  const context = {
    dragActive: shared(false),
    hoverTarget: shared(LOCAL_DROP_TARGET.none),
    overlayOriginX: shared(0),
    overlayOriginY: shared(0),
    overlayTranslateY: shared(0),
    overlayWidth: shared(0),
    overlayHeight: shared(138),
    targetIndex: shared(5),
    autoScrollAllowed: shared(false),
    listBounds: shared<LocalDragBounds | null>(null),
    layerBounds: shared<LocalDragBounds | null>(null),
    dropBarHeight: shared(72),
    dragLayerRef,
    listViewportRef,
    onStart,
    onDraftIndexChange,
    onAutoScroll,
    onFinish,
    onRequestMoveToPosition,
  } as unknown as LocalPageDragContext;

  return {
    context,
    dragLayerRef,
    listViewportRef,
    onStart,
    onDraftIndexChange,
    onAutoScroll,
    onFinish,
    onRequestMoveToPosition,
  };
};

const renderHandle = async () => {
  const setup = createContext();
  const rowRef = measuredRef({
    x: 16,
    y: 250,
    pageX: 16,
    pageY: 250,
    width: 368,
    height: 138,
  });
  mockMeasure.mockImplementation(
    (ref: { bounds?: LocalDragBounds }) => ref.bounds
  );
  await render(
    <LocalPageDragHandle
      pageId="page-6"
      pageOrder={6}
      pageIndex={5}
      pageCount={12}
      rowRef={rowRef as never}
      context={setup.context}
    />
  );
  return setup;
};

describe('LocalPageDragHandle gestures', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGestureState.pan = undefined;
    mockGestureState.tap = undefined;
    mockGestureState.exclusive = undefined;
  });

  it('opens move to position on a successful short tap', async () => {
    const { onRequestMoveToPosition, onStart } = await renderHandle();

    await act(() => {
      mockGestureState.tap?.callbacks.onEnd?.({}, true);
    });

    expect(onRequestMoveToPosition).toHaveBeenCalledWith('page-6');
    expect(onStart).not.toHaveBeenCalled();
  });

  it('prioritizes long-press drag and does not also execute the tap', async () => {
    const { onStart, onFinish, onRequestMoveToPosition } =
      await renderHandle();

    expect(mockGestureState.exclusive?.gestures?.map(item => item.kind)).toEqual(
      ['pan', 'tap']
    );
    await act(() => {
      mockGestureState.pan?.callbacks.onStart?.();
      mockGestureState.pan?.callbacks.onEnd?.({
        absoluteX: 200,
        absoluteY: 300,
      });
    });

    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onFinish).toHaveBeenCalledWith(
      'page-6',
      5,
      'commitLocal'
    );
    expect(onRequestMoveToPosition).not.toHaveBeenCalled();
  });

  it('cancels an interrupted drag without opening the form', async () => {
    const { onFinish, onRequestMoveToPosition } = await renderHandle();

    await act(() => {
      mockGestureState.pan?.callbacks.onStart?.();
      mockGestureState.pan?.callbacks.onFinalize?.({}, false);
    });

    expect(onFinish).toHaveBeenCalledWith('page-6', 5, 'cancel');
    expect(onRequestMoveToPosition).not.toHaveBeenCalled();
  });

  it('freezes the draft and autoscroll throughout the bottom bar', async () => {
    const {
      context,
      onAutoScroll,
      onDraftIndexChange,
    } = await renderHandle();

    await act(() => {
      mockGestureState.pan?.callbacks.onStart?.();
      mockGestureState.pan?.callbacks.onUpdate?.({
        absoluteX: 100,
        absoluteY: 750,
        translationY: 300,
      });
    });

    expect(context.hoverTarget.value).toBe(LOCAL_DROP_TARGET.cancel);
    expect(context.targetIndex.value).toBe(5);
    expect(onDraftIndexChange).not.toHaveBeenCalled();
    expect(onAutoScroll).not.toHaveBeenCalled();
  });

  it('autoscrolls once per deliberate edge entry', async () => {
    const { onAutoScroll } = await renderHandle();
    const lowerEdgeEvent = {
      absoluteX: 200,
      absoluteY: 640,
      translationY: 20,
    };

    await act(() => {
      mockGestureState.pan?.callbacks.onStart?.();
      mockGestureState.pan?.callbacks.onUpdate?.(lowerEdgeEvent);
      mockGestureState.pan?.callbacks.onUpdate?.(lowerEdgeEvent);
    });

    expect(onAutoScroll).toHaveBeenCalledTimes(1);
    expect(onAutoScroll).toHaveBeenLastCalledWith(1);

    await act(() => {
      mockGestureState.pan?.callbacks.onUpdate?.({
        ...lowerEdgeEvent,
        absoluteY: 400,
      });
      mockGestureState.pan?.callbacks.onUpdate?.(lowerEdgeEvent);
    });

    expect(onAutoScroll).toHaveBeenCalledTimes(2);
  });
});
