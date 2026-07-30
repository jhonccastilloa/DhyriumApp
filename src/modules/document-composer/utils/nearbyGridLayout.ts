const NEARBY_GRID_COLUMNS = 3;
const NEARBY_GRID_ROWS = 3;
const PAGE_HEIGHT_TO_WIDTH_RATIO = Math.SQRT2;

export type NearbyGridDragTarget = 'grid' | 'moveToPosition' | 'outside';

type ResolveNearbyGridDragTargetInput = {
  x: number;
  y: number;
  itemWidth: number;
  itemHeight: number;
  gridWidth: number;
  gridHeight: number;
  dropTargetGap: number;
  dropTargetHeight: number;
};

export const resolveNearbyGridDragTarget = ({
  x,
  y,
  itemWidth,
  itemHeight,
  gridWidth,
  gridHeight,
  dropTargetGap,
  dropTargetHeight,
}: ResolveNearbyGridDragTargetInput): NearbyGridDragTarget => {
  const values = [
    x,
    y,
    itemWidth,
    itemHeight,
    gridWidth,
    gridHeight,
    dropTargetGap,
    dropTargetHeight,
  ];
  if (
    values.some(value => !Number.isFinite(value)) ||
    itemWidth <= 0 ||
    itemHeight <= 0 ||
    gridWidth <= 0 ||
    gridHeight <= 0 ||
    dropTargetGap < 0 ||
    dropTargetHeight <= 0
  ) {
    return 'outside';
  }

  const centerX = x + itemWidth / 2;
  const centerY = y + itemHeight / 2;
  if (centerX < 0 || centerX > gridWidth) return 'outside';

  const dropTargetTop = gridHeight + dropTargetGap;
  if (
    centerY >= dropTargetTop &&
    centerY <= dropTargetTop + dropTargetHeight
  ) {
    return 'moveToPosition';
  }
  return centerY >= 0 && centerY <= gridHeight ? 'grid' : 'outside';
};

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
