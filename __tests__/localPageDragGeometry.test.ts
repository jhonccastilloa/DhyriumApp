import {
  resolveLocalAutoScrollDirection,
  resolveLocalDragOutcome,
  resolveLocalPageShift,
} from '@/modules/document-composer/domain/localPageDragGeometry';

const layerBounds = { x: 0, y: 0, width: 400, height: 800 };
const listBounds = { x: 16, y: 100, width: 368, height: 560 };
const geometry = {
  x: 200,
  y: 300,
  listBounds,
  layerBounds,
  dropBarHeight: 100,
};

describe('local page drag geometry', () => {
  it('commits only inside the valid list viewport', () => {
    expect(resolveLocalDragOutcome(geometry)).toBe('commitLocal');
  });

  it('resolves the full left and right halves of the bottom bar', () => {
    expect(
      resolveLocalDragOutcome({ ...geometry, x: 100, y: 750 })
    ).toBe('cancel');
    expect(
      resolveLocalDragOutcome({ ...geometry, x: 300, y: 750 })
    ).toBe('moveToPosition');
  });

  it('never treats the visual center of the bottom bar as a local commit', () => {
    expect(
      resolveLocalDragOutcome({ ...geometry, x: 199.9, y: 720 })
    ).toBe('cancel');
    expect(
      resolveLocalDragOutcome({ ...geometry, x: 200, y: 720 })
    ).toBe('moveToPosition');
  });

  it('cancels outside the layer and outside every explicit target', () => {
    expect(
      resolveLocalDragOutcome({ ...geometry, x: -1, y: 300 })
    ).toBe('cancel');
    expect(
      resolveLocalDragOutcome({ ...geometry, x: 200, y: 680 })
    ).toBe('cancel');
  });

  it.each([
    { x: Number.NaN, y: 300 },
    { x: Number.POSITIVE_INFINITY, y: 300 },
    { x: 200, y: Number.NEGATIVE_INFINITY },
  ])('cancels non-finite coordinates: %o', coordinates => {
    expect(
      resolveLocalDragOutcome({ ...geometry, ...coordinates })
    ).toBe('cancel');
  });

  it('cancels missing or zero-sized geometry', () => {
    expect(
      resolveLocalDragOutcome({ ...geometry, listBounds: null })
    ).toBe('cancel');
    expect(
      resolveLocalDragOutcome({ ...geometry, layerBounds: null })
    ).toBe('cancel');
    expect(
      resolveLocalDragOutcome({
        ...geometry,
        listBounds: { ...listBounds, height: 0 },
      })
    ).toBe('cancel');
    expect(
      resolveLocalDragOutcome({
        ...geometry,
        layerBounds: { ...layerBounds, width: 0 },
      })
    ).toBe('cancel');
    expect(
      resolveLocalDragOutcome({ ...geometry, dropBarHeight: 0 })
    ).toBe('cancel');
  });
});

describe('local page drag autoscroll', () => {
  const input = {
    y: listBounds.y + listBounds.height - 1,
    listBounds,
    outcome: 'commitLocal' as const,
    targetIndex: 5,
    minTargetIndex: 1,
    maxTargetIndex: 9,
    edgeThreshold: 56,
  };

  it('stops over both actions in the bottom bar', () => {
    expect(
      resolveLocalAutoScrollDirection({
        ...input,
        outcome: 'cancel',
      })
    ).toBe(0);
    expect(
      resolveLocalAutoScrollDirection({
        ...input,
        outcome: 'moveToPosition',
      })
    ).toBe(0);
  });

  it('scrolls only near a list edge and stops at the local limits', () => {
    expect(resolveLocalAutoScrollDirection(input)).toBe(1);
    expect(
      resolveLocalAutoScrollDirection({
        ...input,
        targetIndex: input.maxTargetIndex,
      })
    ).toBe(0);
    expect(
      resolveLocalAutoScrollDirection({
        ...input,
        y: listBounds.y + 1,
      })
    ).toBe(-1);
    expect(
      resolveLocalAutoScrollDirection({
        ...input,
        y: listBounds.y + 1,
        targetIndex: input.minTargetIndex,
      })
    ).toBe(0);
  });
});

describe('local page drag card shifts', () => {
  const shift = (pageIndex: number, targetIndex: number) =>
    resolveLocalPageShift({
      pageIndex,
      originalIndex: 4,
      targetIndex,
      itemExtent: 146,
    });

  it('moves the placeholder to the provisional slot', () => {
    expect(shift(4, 6)).toBe(292);
    expect(shift(4, 2)).toBe(-292);
  });

  it('shifts crossed cards in the opposite direction', () => {
    expect(shift(5, 6)).toBe(-146);
    expect(shift(6, 6)).toBe(-146);
    expect(shift(2, 2)).toBe(146);
    expect(shift(3, 2)).toBe(146);
  });

  it('leaves unrelated cards in place', () => {
    expect(shift(1, 6)).toBe(0);
    expect(shift(7, 6)).toBe(0);
    expect(shift(3, 4)).toBe(0);
  });
});
