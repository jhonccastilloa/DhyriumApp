import { useMemo } from 'react';
import { View, type AccessibilityActionEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  measure,
  useSharedValue,
  type AnimatedRef,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import AppIcon from '@/components/icons/AppIcon';
import {
  DOCUMENT_PAGE_ITEM_EXTENT,
} from '../constants/documentComposerLayout';
import { MAX_LOCAL_PAGE_MOVE } from '../domain/pageOrder';
import {
  LOCAL_DROP_TARGET,
  type LocalDropTarget,
  type LocalPageDragContext,
  type LocalPageDragOutcome,
} from '../hooks/useLocalPageDrag';

type LocalPageDragHandleProps = {
  pageId: string;
  pageOrder: number;
  pageIndex: number;
  pageCount: number;
  thumbnailUri?: string;
  rowRef: AnimatedRef<View>;
  context: LocalPageDragContext;
};

const ACTIVATION_DELAY_MS = 220;
const EDGE_SCROLL_THRESHOLD = 56;
const AUTO_SCROLL_THROTTLE_MS = 80;

// Sortable necesita registrar el contenedor completo. Este gesto mantiene el
// FlatList virtualizado y solo anima la página activa y sus destinos locales.
const containsPoint = (
  x: number,
  y: number,
  ref: AnimatedRef<View>
) => {
  'worklet';
  const bounds = measure(ref);
  return Boolean(
    bounds &&
      x >= bounds.pageX &&
      x <= bounds.pageX + bounds.width &&
      y >= bounds.pageY &&
      y <= bounds.pageY + bounds.height
  );
};

const getDropTarget = (
  x: number,
  y: number,
  moveTargetRef: AnimatedRef<View>,
  cancelTargetRef: AnimatedRef<View>
): LocalDropTarget => {
  'worklet';
  if (containsPoint(x, y, moveTargetRef)) {
    return LOCAL_DROP_TARGET.moveToPosition;
  }
  if (containsPoint(x, y, cancelTargetRef)) {
    return LOCAL_DROP_TARGET.cancel;
  }
  return LOCAL_DROP_TARGET.none;
};

const LocalPageDragHandle = ({
  pageId,
  pageOrder,
  pageIndex,
  pageCount,
  thumbnailUri,
  rowRef,
  context,
}: LocalPageDragHandleProps) => {
  const { theme } = useUnistyles();
  const lastAutoScrollAt = useSharedValue(0);
  const minTargetIndex = Math.max(
    0,
    pageIndex - MAX_LOCAL_PAGE_MOVE
  );
  const maxTargetIndex = Math.min(
    pageCount - 1,
    pageIndex + MAX_LOCAL_PAGE_MOVE
  );
  const {
    dragActive,
    hoverTarget,
    overlayOriginX,
    overlayOriginY,
    overlayTranslateY,
    overlayWidth,
    overlayHeight,
    scrollOffset,
    startScrollOffset,
    targetIndex,
    dragLayerRef,
    listViewportRef,
    moveTargetRef,
    cancelTargetRef,
    onStart,
    onDraftIndexChange,
    onAutoScroll,
    onFinish,
  } = context;

  const gesture = useMemo(() => {
    return Gesture.Pan()
      .activateAfterLongPress(ACTIVATION_DELAY_MS)
      .shouldCancelWhenOutside(false)
      .onStart(() => {
        'worklet';
        const row = measure(rowRef);
        const layer = measure(dragLayerRef);
        const viewport = measure(listViewportRef);
        if (!row || !layer || !viewport) return;

        overlayOriginX.value = row.pageX - layer.pageX;
        overlayOriginY.value = row.pageY - layer.pageY;
        overlayTranslateY.value = 0;
        overlayWidth.value = row.width;
        overlayHeight.value = row.height;
        startScrollOffset.value = scrollOffset.value;
        targetIndex.value = pageIndex;
        hoverTarget.value = LOCAL_DROP_TARGET.none;
        dragActive.value = true;
        scheduleOnRN(
          onStart,
          pageId,
          pageIndex,
          thumbnailUri
        );
      })
      .onUpdate(event => {
        'worklet';
        if (!dragActive.value) return;

        overlayTranslateY.value = event.translationY;
        const scrollDelta = scrollOffset.value - startScrollOffset.value;
        const logicalMovement = event.translationY + scrollDelta;
        const proposedIndex = Math.round(
          pageIndex + logicalMovement / DOCUMENT_PAGE_ITEM_EXTENT
        );
        const nextIndex = Math.min(
          maxTargetIndex,
          Math.max(minTargetIndex, proposedIndex)
        );
        if (nextIndex !== targetIndex.value) {
          targetIndex.value = nextIndex;
          scheduleOnRN(
            onDraftIndexChange,
            pageId,
            nextIndex
          );
        }

        hoverTarget.value = getDropTarget(
          event.absoluteX,
          event.absoluteY,
          moveTargetRef,
          cancelTargetRef
        );

        const viewport = measure(listViewportRef);
        if (
          !viewport ||
          hoverTarget.value !== LOCAL_DROP_TARGET.none
        ) {
          return;
        }

        const now = Date.now();
        if (
          now - lastAutoScrollAt.value <
          AUTO_SCROLL_THROTTLE_MS
        ) {
          return;
        }
        if (
          event.absoluteY <= viewport.pageY + EDGE_SCROLL_THRESHOLD &&
          targetIndex.value > minTargetIndex
        ) {
          lastAutoScrollAt.value = now;
          scheduleOnRN(onAutoScroll, -1);
        } else if (
          event.absoluteY >=
            viewport.pageY + viewport.height - EDGE_SCROLL_THRESHOLD &&
          targetIndex.value < maxTargetIndex
        ) {
          lastAutoScrollAt.value = now;
          scheduleOnRN(onAutoScroll, 1);
        }
      })
      .onEnd(event => {
        'worklet';
        if (!dragActive.value) return;

        const dropTarget = getDropTarget(
          event.absoluteX,
          event.absoluteY,
          moveTargetRef,
          cancelTargetRef
        );
        let outcome: LocalPageDragOutcome = 'commitLocal';
        if (dropTarget === LOCAL_DROP_TARGET.moveToPosition) {
          outcome = 'moveToPosition';
        } else if (dropTarget === LOCAL_DROP_TARGET.cancel) {
          outcome = 'cancel';
        }

        const finalIndex = targetIndex.value;
        dragActive.value = false;
        hoverTarget.value = LOCAL_DROP_TARGET.none;
        scheduleOnRN(onFinish, pageId, finalIndex, outcome);
      })
      .onFinalize((_event, success) => {
        'worklet';
        if (success || !dragActive.value) return;
        dragActive.value = false;
        hoverTarget.value = LOCAL_DROP_TARGET.none;
        scheduleOnRN(
          onFinish,
          pageId,
          targetIndex.value,
          'cancel'
        );
      });
  }, [
    cancelTargetRef,
    dragActive,
    dragLayerRef,
    hoverTarget,
    lastAutoScrollAt,
    listViewportRef,
    maxTargetIndex,
    minTargetIndex,
    moveTargetRef,
    onAutoScroll,
    onDraftIndexChange,
    onFinish,
    onStart,
    pageIndex,
    overlayHeight,
    overlayOriginX,
    overlayOriginY,
    overlayTranslateY,
    overlayWidth,
    pageId,
    rowRef,
    scrollOffset,
    startScrollOffset,
    targetIndex,
    thumbnailUri,
  ]);

  const handleAccessibilityAction = (
    event: AccessibilityActionEvent
  ) => {
    if (event.nativeEvent.actionName === 'activate') {
      context.onRequestMoveToPosition(pageId);
    }
  };

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        accessible
        accessibilityRole="button"
        accessibilityLabel={`Reordenar página ${pageOrder}`}
        accessibilityHint="Mantén pulsado y arrastra. Activa para mover a una posición exacta."
        accessibilityActions={[
          { name: 'activate', label: 'Mover a posición exacta' },
        ]}
        onAccessibilityAction={handleAccessibilityAction}
        collapsable={false}
        style={styles.handle}
      >
        <AppIcon
          name="dotsSixVertical"
          size={22}
          mColor={theme.colors.navigation.active}
        />
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create(theme => ({
  handle: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.navigation.rail,
  },
}));

export default LocalPageDragHandle;
