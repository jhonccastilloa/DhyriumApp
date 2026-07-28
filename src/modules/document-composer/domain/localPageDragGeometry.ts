export const LOCAL_DROP_TARGET = {
  none: 0,
  moveToPosition: 1,
  cancel: 2,
} as const;

export type LocalDropTarget =
  (typeof LOCAL_DROP_TARGET)[keyof typeof LOCAL_DROP_TARGET];
export type LocalPageDragOutcome =
  | 'commitLocal'
  | 'moveToPosition'
  | 'cancel';

export type LocalDragBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type ResolveLocalDragOutcomeInput = {
  x: number;
  y: number;
  listBounds: LocalDragBounds | null;
  layerBounds: LocalDragBounds | null;
  dropBarHeight: number;
};

type ValidLocalDragOutcomeInput = ResolveLocalDragOutcomeInput & {
  listBounds: LocalDragBounds;
  layerBounds: LocalDragBounds;
};

type ResolveLocalAutoScrollInput = {
  y: number;
  listBounds: LocalDragBounds | null;
  outcome: LocalPageDragOutcome;
  targetIndex: number;
  minTargetIndex: number;
  maxTargetIndex: number;
  edgeThreshold: number;
};

type ResolveLocalPageShiftInput = {
  pageIndex: number;
  originalIndex: number;
  targetIndex: number;
  itemExtent: number;
};

type ResolveLocalTargetIndexInput = {
  movement: number;
  originalIndex: number;
  currentIndex: number;
  minTargetIndex: number;
  maxTargetIndex: number;
  itemExtent: number;
  hysteresis: number;
};

const isFiniteNumber = (value: number) => {
  'worklet';
  return Number.isFinite(value);
};

const isValidBounds = (
  bounds: LocalDragBounds | null
): bounds is LocalDragBounds => {
  'worklet';
  return Boolean(
    bounds &&
      isFiniteNumber(bounds.x) &&
      isFiniteNumber(bounds.y) &&
      isFiniteNumber(bounds.width) &&
      isFiniteNumber(bounds.height) &&
      bounds.width > 0 &&
      bounds.height > 0
  );
};

const containsPoint = (
  bounds: LocalDragBounds,
  x: number,
  y: number
) => {
  'worklet';
  return (
    x >= bounds.x &&
    x <= bounds.x + bounds.width &&
    y >= bounds.y &&
    y <= bounds.y + bounds.height
  );
};

const hasValidGeometry = (
  input: ResolveLocalDragOutcomeInput
): input is ValidLocalDragOutcomeInput => {
  'worklet';
  const { x, y, listBounds, layerBounds, dropBarHeight } = input;
  return (
    isFiniteNumber(x) &&
    isFiniteNumber(y) &&
    isValidBounds(listBounds) &&
    isValidBounds(layerBounds) &&
    isFiniteNumber(dropBarHeight) &&
    dropBarHeight > 0 &&
    dropBarHeight <= layerBounds.height &&
    containsPoint(layerBounds, x, y)
  );
};

const resolveValidDropTarget = ({
  x,
  y,
  layerBounds,
  dropBarHeight,
}: ValidLocalDragOutcomeInput): LocalDropTarget => {
  'worklet';
  const dropBarTop =
    layerBounds.y + layerBounds.height - dropBarHeight;
  if (y < dropBarTop) return LOCAL_DROP_TARGET.none;

  const midpoint = layerBounds.x + layerBounds.width / 2;
  return x < midpoint
    ? LOCAL_DROP_TARGET.cancel
    : LOCAL_DROP_TARGET.moveToPosition;
};

export const resolveLocalDropTarget = (
  input: ResolveLocalDragOutcomeInput
): LocalDropTarget => {
  'worklet';
  return hasValidGeometry(input)
    ? resolveValidDropTarget(input)
    : LOCAL_DROP_TARGET.none;
};

export const resolveLocalDragOutcome = (
  input: ResolveLocalDragOutcomeInput
): LocalPageDragOutcome => {
  'worklet';
  if (!hasValidGeometry(input)) return 'cancel';

  const dropTarget = resolveValidDropTarget(input);
  if (dropTarget === LOCAL_DROP_TARGET.cancel) return 'cancel';
  if (dropTarget === LOCAL_DROP_TARGET.moveToPosition) {
    return 'moveToPosition';
  }
  return containsPoint(input.listBounds, input.x, input.y)
    ? 'commitLocal'
    : 'cancel';
};

export const resolveLocalAutoScrollDirection = ({
  y,
  listBounds,
  outcome,
  targetIndex,
  minTargetIndex,
  maxTargetIndex,
  edgeThreshold,
}: ResolveLocalAutoScrollInput): -1 | 0 | 1 => {
  'worklet';
  if (
    outcome !== 'commitLocal' ||
    !isFiniteNumber(y) ||
    !isValidBounds(listBounds) ||
    !isFiniteNumber(edgeThreshold) ||
    edgeThreshold <= 0
  ) {
    return 0;
  }
  if (
    y <= listBounds.y + edgeThreshold &&
    targetIndex > minTargetIndex
  ) {
    return -1;
  }
  if (
    y >= listBounds.y + listBounds.height - edgeThreshold &&
    targetIndex < maxTargetIndex
  ) {
    return 1;
  }
  return 0;
};

export const resolveLocalTargetIndex = ({
  movement,
  originalIndex,
  currentIndex,
  minTargetIndex,
  maxTargetIndex,
  itemExtent,
  hysteresis,
}: ResolveLocalTargetIndexInput) => {
  'worklet';
  if (
    !isFiniteNumber(movement) ||
    !Number.isInteger(originalIndex) ||
    !Number.isInteger(currentIndex) ||
    !Number.isInteger(minTargetIndex) ||
    !Number.isInteger(maxTargetIndex) ||
    minTargetIndex > maxTargetIndex ||
    !isFiniteNumber(itemExtent) ||
    itemExtent <= 0 ||
    !isFiniteNumber(hysteresis) ||
    hysteresis < 0
  ) {
    return currentIndex;
  }

  const proposedIndex = Math.min(
    maxTargetIndex,
    Math.max(
      minTargetIndex,
      Math.round(originalIndex + movement / itemExtent)
    )
  );
  if (proposedIndex === currentIndex) return currentIndex;

  const boundary =
    proposedIndex > currentIndex
      ? (proposedIndex - originalIndex - 0.5) * itemExtent +
        hysteresis
      : (proposedIndex - originalIndex + 0.5) * itemExtent -
        hysteresis;

  return proposedIndex > currentIndex
    ? movement >= boundary
      ? proposedIndex
      : currentIndex
    : movement <= boundary
      ? proposedIndex
      : currentIndex;
};

export const resolveLocalPageShift = ({
  pageIndex,
  originalIndex,
  targetIndex,
  itemExtent,
}: ResolveLocalPageShiftInput) => {
  'worklet';
  if (
    !Number.isInteger(pageIndex) ||
    !Number.isInteger(originalIndex) ||
    !Number.isInteger(targetIndex) ||
    !isFiniteNumber(itemExtent) ||
    itemExtent <= 0
  ) {
    return 0;
  }
  if (pageIndex === originalIndex) {
    return (targetIndex - originalIndex) * itemExtent;
  }
  if (
    targetIndex > originalIndex &&
    pageIndex > originalIndex &&
    pageIndex <= targetIndex
  ) {
    return -itemExtent;
  }
  if (
    targetIndex < originalIndex &&
    pageIndex >= targetIndex &&
    pageIndex < originalIndex
  ) {
    return itemExtent;
  }
  return 0;
};
