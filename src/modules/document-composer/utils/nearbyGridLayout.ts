const GRID_COLUMNS = 3;
const GRID_ROWS = 3;
const GRID_GAP = 8;

export const calculateNearbyGridLayout = (
  availableWidth: number,
  availableHeight: number,
  itemCount: number
) => {
  const itemWidth = Math.floor(
    Math.max(availableWidth - GRID_GAP * (GRID_COLUMNS - 1), 0) /
      GRID_COLUMNS
  );
  const maximumItemHeight = Math.floor(
    Math.max(availableHeight - GRID_GAP * (GRID_ROWS - 1), 0) /
      GRID_ROWS
  );
  const itemHeight = Math.floor(
    Math.min(itemWidth * 1.08, maximumItemHeight)
  );
  const rowCount = Math.ceil(itemCount / GRID_COLUMNS);

  return {
    dimensions: {
      columns: GRID_COLUMNS,
      itemWidth,
      itemHeight,
      rowGap: GRID_GAP,
      columnGap: GRID_GAP,
    },
    width:
      GRID_COLUMNS * itemWidth + (GRID_COLUMNS - 1) * GRID_GAP,
    height:
      rowCount * itemHeight + Math.max(rowCount - 1, 0) * GRID_GAP,
    ready: itemWidth > 0 && itemHeight > 0,
  };
};
