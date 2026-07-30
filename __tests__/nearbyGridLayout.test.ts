import {
  calculateNearbyGridLayout,
  NEARBY_GRID_COLUMNS,
} from '@/modules/document-composer/utils/nearbyGridLayout';

describe('nearby grid layout', () => {
  it('always calculates three columns within the available area', () => {
    const portrait = calculateNearbyGridLayout(360, 520, 9, 8);
    const landscape = calculateNearbyGridLayout(700, 260, 9, 8);

    expect(NEARBY_GRID_COLUMNS).toBe(3);
    expect(portrait.dimensions.columns).toBe(3);
    expect(portrait.width).toBeLessThanOrEqual(360);
    expect(portrait.height).toBeLessThanOrEqual(520);
    expect(landscape.dimensions.columns).toBe(3);
    expect(landscape.width).toBeLessThanOrEqual(700);
    expect(landscape.height).toBeLessThanOrEqual(260);
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
});
