import {
  calculateNearbyGridLayout,
  resolveNearbyGridDragTarget,
} from '@/modules/document-composer/utils/nearbyGridLayout';

describe('nearby grid layout', () => {
  it('always calculates three columns within the available area', () => {
    const portrait = calculateNearbyGridLayout(360, 520, 9, 8);
    const landscape = calculateNearbyGridLayout(700, 260, 9, 8);

    expect(portrait.dimensions.columns).toBe(3);
    expect(portrait.width).toBeLessThanOrEqual(360);
    expect(portrait.height).toBeLessThanOrEqual(520);
    expect(portrait.dimensions.itemHeight).toBeGreaterThan(
      portrait.dimensions.itemWidth
    );
    expect(
      portrait.dimensions.itemHeight / portrait.dimensions.itemWidth
    ).toBeCloseTo(Math.SQRT2, 1);
    expect(landscape.dimensions.columns).toBe(3);
    expect(landscape.width).toBeLessThanOrEqual(700);
    expect(landscape.height).toBeLessThanOrEqual(260);
    expect(landscape.dimensions.itemHeight).toBeGreaterThan(
      landscape.dimensions.itemWidth
    );
    expect(
      landscape.dimensions.itemHeight / landscape.dimensions.itemWidth
    ).toBeCloseTo(Math.SQRT2, 1);
  });

  it('does not become ready without positive usable dimensions', () => {
    expect(
      calculateNearbyGridLayout(0, 400, 9, 8).ready
    ).toBe(false);
    expect(
      calculateNearbyGridLayout(400, 0, 9, 8).ready
    ).toBe(false);
    expect(
      calculateNearbyGridLayout(400, 400, 0, 8).ready
    ).toBe(false);
  });

  it.each([
    { name: 'grid', x: 10, y: 10, expected: 'grid' },
    {
      name: 'move action',
      x: 10,
      y: 100,
      expected: 'moveToPosition',
    },
    { name: 'gap', x: 10, y: 74, expected: 'outside' },
    { name: 'side', x: 400, y: 10, expected: 'outside' },
  ])('resolves a drag over the $name', ({ x, y, expected }) => {
    expect(
      resolveNearbyGridDragTarget({
        x,
        y,
        itemWidth: 100,
        itemHeight: 100,
        gridWidth: 316,
        gridHeight: 120,
        dropTargetGap: 8,
        dropTargetHeight: 56,
      })
    ).toBe(expected);
  });

  it('safely rejects invalid drag geometry', () => {
    expect(
      resolveNearbyGridDragTarget({
        x: Number.NaN,
        y: 0,
        itemWidth: 100,
        itemHeight: 100,
        gridWidth: 316,
        gridHeight: 120,
        dropTargetGap: 8,
        dropTargetHeight: 56,
      })
    ).toBe('outside');
  });
});
