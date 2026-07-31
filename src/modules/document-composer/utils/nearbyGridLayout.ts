const NEARBY_GRID_COLUMNS = 3;
const NEARBY_GRID_ROWS = 3;
const PAGE_HEIGHT_TO_WIDTH_RATIO = Math.SQRT2;

export const calculateNearbyGridLayout = (
  availableWidth: number,
  availableHeight: number,
  itemCount: number,
  gap: number
) => {
  const validGap = Number.isFinite(gap) ? Math.max(gap, 0) : 0;
  const maximumItemWidth = Math.floor(
    Math.max(
      availableWidth - validGap * (NEARBY_GRID_COLUMNS - 1),
      0
    ) / NEARBY_GRID_COLUMNS
  );
  const maximumItemHeight = Math.floor(
    Math.max(
      availableHeight - validGap * (NEARBY_GRID_ROWS - 1),
      0
    ) / NEARBY_GRID_ROWS
  );
  const itemWidth = Math.floor(
    Math.min(
      maximumItemWidth,
      maximumItemHeight / PAGE_HEIGHT_TO_WIDTH_RATIO
    )
  );
  const itemHeight = Math.floor(itemWidth * PAGE_HEIGHT_TO_WIDTH_RATIO);
  const rowCount = Math.ceil(itemCount / NEARBY_GRID_COLUMNS);

  return {
    dimensions: {
      columns: NEARBY_GRID_COLUMNS,
      itemWidth,
      itemHeight,
      rowGap: validGap,
      columnGap: validGap,
    },
    width:
      NEARBY_GRID_COLUMNS * itemWidth +
      (NEARBY_GRID_COLUMNS - 1) * validGap,
    height:
      rowCount * itemHeight + Math.max(rowCount - 1, 0) * validGap,
    ready: itemCount > 0 && itemWidth > 0 && itemHeight > 0,
  };
};
