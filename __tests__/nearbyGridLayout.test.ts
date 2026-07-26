import { calculateNearbyGridLayout } from '@/modules/document-composer/utils/nearbyGridLayout';

describe('nearby reorder grid layout', () => {
  it('fits all three rows inside a short landscape area', () => {
    const layout = calculateNearbyGridLayout(600, 160, 9);

    expect(layout.ready).toBe(true);
    expect(layout.height).toBeLessThanOrEqual(160);
    expect(layout.width).toBeLessThanOrEqual(600);
  });

  it('uses only the rows required by documents with fewer pages', () => {
    const layout = calculateNearbyGridLayout(328, 300, 5);
    const twoRowsHeight =
      layout.dimensions.itemHeight * 2 + layout.dimensions.rowGap;

    expect(layout.height).toBe(twoRowsHeight);
  });

  it('waits for a measurable area before rendering the grid', () => {
    expect(calculateNearbyGridLayout(0, 0, 9).ready).toBe(false);
  });
});
