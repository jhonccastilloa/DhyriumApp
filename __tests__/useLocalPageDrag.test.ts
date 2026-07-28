import { act, renderHook } from '@testing-library/react-native';
import { resolveLocalDragOutcome } from '@/modules/document-composer/domain/localPageDragGeometry';
import { useLocalPageDrag } from '@/modules/document-composer/hooks/useLocalPageDrag';
import type { ComposerPage } from '@/modules/document-composer/types/documentComposer.types';

jest.mock('react-native-reanimated', () => ({
  useAnimatedRef: () => ({ current: null }),
  useSharedValue: (value: unknown) => ({ value }),
}));

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

const pages = (count: number) =>
  Array.from({ length: count }, (_, index) =>
    page(`page-${index + 1}`, index + 1)
  );

const renderLocalPageDrag = async (source: ComposerPage[]) => {
  const onCommit = jest.fn();
  const onMoveToPosition = jest.fn();
  const hook = await renderHook(() =>
    useLocalPageDrag({
      pages: source,
      contentPadding: 16,
      onCommit,
      onRequestMoveToPosition: onMoveToPosition,
    })
  );
  return { ...hook, onCommit, onMoveToPosition };
};

describe('useLocalPageDrag completion state', () => {
  it('commits a local draft exactly once with at most nine stable IDs', async () => {
    const source = pages(1000);
    const { result, onCommit } = await renderLocalPageDrag(source);

    await act(() => {
      result.current.dragContext.onStart('page-500', 499);
      result.current.dragContext.onDraftIndexChange('page-500', 503);
      result.current.dragContext.onFinish(
        'page-500',
        503,
        'commitLocal'
      );
    });

    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit.mock.calls[0][0]).toHaveLength(9);
    expect(onCommit).toHaveBeenCalledWith(
      expect.arrayContaining(['page-500']),
      'page-500',
      'page-504'
    );
  });

  it('cancels without committing or changing the source pages', async () => {
    const source = pages(12);
    const sourceIds = source.map(item => item.id);
    const sourceReferences = [...source];
    const { result, onCommit, onMoveToPosition } =
      await renderLocalPageDrag(source);

    await act(() => {
      result.current.dragContext.onStart('page-6', 5);
    });
    expect(result.current.dragSession?.page).toBe(source[5]);

    await act(() => {
      result.current.dragContext.onDraftIndexChange('page-6', 7);
      result.current.dragContext.onFinish('page-6', 7, 'cancel');
    });

    expect(onCommit).not.toHaveBeenCalled();
    expect(onMoveToPosition).not.toHaveBeenCalled();
    expect(source.map(item => item.id)).toEqual(sourceIds);
    expect(source).toEqual(sourceReferences);
    source.forEach((item, index) => {
      expect(item).toBe(sourceReferences[index]);
    });
    expect(result.current.dragSession).toBeUndefined();
  });

  it('opens move to position without applying the local draft', async () => {
    const source = pages(12);
    const { result, onCommit, onMoveToPosition } =
      await renderLocalPageDrag(source);

    await act(() => {
      result.current.dragContext.onStart('page-6', 5);
      result.current.dragContext.onDraftIndexChange('page-6', 8);
      result.current.dragContext.onFinish(
        'page-6',
        8,
        'moveToPosition'
      );
    });

    expect(onCommit).not.toHaveBeenCalled();
    expect(onMoveToPosition).toHaveBeenCalledTimes(1);
    expect(onMoveToPosition).toHaveBeenCalledWith('page-6');
  });

  it('treats invalid drop geometry as cancel and never commits', async () => {
    const source = pages(12);
    const { result, onCommit, onMoveToPosition } =
      await renderLocalPageDrag(source);
    const outcome = resolveLocalDragOutcome({
      x: Number.NaN,
      y: 300,
      listBounds: null,
      layerBounds: null,
      dropBarHeight: 72,
    });

    await act(() => {
      result.current.dragContext.onStart('page-6', 5);
      result.current.dragContext.onDraftIndexChange('page-6', 7);
      result.current.dragContext.onFinish('page-6', 7, outcome);
    });

    expect(outcome).toBe('cancel');
    expect(onCommit).not.toHaveBeenCalled();
    expect(onMoveToPosition).not.toHaveBeenCalled();
    expect(result.current.dragSession).toBeUndefined();
  });

  it('does not change the provisional destination during autoscroll', async () => {
    const source = pages(12);
    const { result, onCommit } = await renderLocalPageDrag(source);

    await act(() => {
      result.current.dragContext.onStart('page-6', 5);
    });
    await act(() => {
      result.current.dragContext.targetIndex.value = 6;
      result.current.dragContext.autoScrollAllowed.value = true;
      result.current.dragContext.onAutoScroll(1);
    });

    expect(result.current.dragContext.targetIndex.value).toBe(6);
    expect(result.current.dragSession?.draftIndex).toBe(5);
    expect(onCommit).not.toHaveBeenCalled();
  });
});
