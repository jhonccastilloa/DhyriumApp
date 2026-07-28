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
import { DOCUMENT_PAGE_ITEM_EXTENT } from '../constants/documentComposerLayout';
import {
  LOCAL_DROP_TARGET,
  resolveLocalAutoScrollDirection,
  resolveLocalDragOutcome,
  resolveLocalDropTarget,
} from '../domain/localPageDragGeometry';
import { MAX_LOCAL_PAGE_MOVE } from '../domain/pageOrder';
import type { LocalPageDragContext } from '../hooks/useLocalPageDrag';

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
const TAP_MAX_DURATION_MS = ACTIVATION_DELAY_MS;
const EDGE_SCROLL_THRESHOLD = 56;
const AUTO_SCROLL_THROTTLE_MS = 80;

// Sortable necesita registrar el contenedor completo. Este gesto mantiene el
// FlatList virtualizado y solo anima la página activa y sus destinos locales.
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
    autoScrollAllowed,
    listBounds,
    layerBounds,
    dropBarHeight,
    dragLayerRef,
    listViewportRef,
    onStart,
    onDraftIndexChange,
    onAutoScroll,
    onFinish,
    onRequestMoveToPosition,
  } = context;

  const gesture = useMemo(() => {
    const dragGesture = Gesture.Pan()
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
        autoScrollAllowed.value = false;
        listBounds.value = {
          x: viewport.pageX,
          y: viewport.pageY,
          width: viewport.width,
          height: viewport.height,
        };
        layerBounds.value = {
          x: layer.pageX,
          y: layer.pageY,
          width: layer.width,
          height: layer.height,
        };
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

        const geometry = {
          x: event.absoluteX,
          y: event.absoluteY,
          listBounds: listBounds.value,
          layerBounds: layerBounds.value,
          dropBarHeight: dropBarHeight.value,
        };
        const outcome = resolveLocalDragOutcome(geometry);
        hoverTarget.value = resolveLocalDropTarget(geometry);
        autoScrollAllowed.value = outcome === 'commitLocal';

        const maximumTranslateY = layerBounds.value
          ? layerBounds.value.height -
            dropBarHeight.value -
            overlayHeight.value -
            overlayOriginY.value
          : event.translationY;
        overlayTranslateY.value = Math.min(
          event.translationY,
          maximumTranslateY
        );
        if (outcome !== 'commitLocal') return;

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

        const now = Date.now();
        if (
          now - lastAutoScrollAt.value <
          AUTO_SCROLL_THROTTLE_MS
        ) {
          return;
        }
        const autoScrollDirection = resolveLocalAutoScrollDirection({
          y: event.absoluteY,
          listBounds: listBounds.value,
          outcome,
          targetIndex: targetIndex.value,
          minTargetIndex,
          maxTargetIndex,
          edgeThreshold: EDGE_SCROLL_THRESHOLD,
        });
        if (autoScrollDirection !== 0) {
          lastAutoScrollAt.value = now;
          scheduleOnRN(onAutoScroll, autoScrollDirection);
        }
      })
      .onEnd(event => {
        'worklet';
        if (!dragActive.value) return;

        const outcome = resolveLocalDragOutcome({
          x: event.absoluteX,
          y: event.absoluteY,
          listBounds: listBounds.value,
          layerBounds: layerBounds.value,
          dropBarHeight: dropBarHeight.value,
        });
        const finalIndex = targetIndex.value;
        dragActive.value = false;
        autoScrollAllowed.value = false;
        hoverTarget.value = LOCAL_DROP_TARGET.none;
        listBounds.value = null;
        layerBounds.value = null;
        scheduleOnRN(onFinish, pageId, finalIndex, outcome);
      })
      .onFinalize((_event, success) => {
        'worklet';
        if (success || !dragActive.value) return;
        dragActive.value = false;
        autoScrollAllowed.value = false;
        hoverTarget.value = LOCAL_DROP_TARGET.none;
        listBounds.value = null;
        layerBounds.value = null;
        scheduleOnRN(
          onFinish,
          pageId,
          targetIndex.value,
          'cancel'
        );
      });

    const tapGesture = Gesture.Tap()
      .maxDuration(TAP_MAX_DURATION_MS)
      .onEnd((_event, success) => {
        'worklet';
        if (success) {
          scheduleOnRN(onRequestMoveToPosition, pageId);
        }
      });

    return Gesture.Exclusive(dragGesture, tapGesture);
  }, [
    autoScrollAllowed,
    dragActive,
    dragLayerRef,
    dropBarHeight,
    hoverTarget,
    lastAutoScrollAt,
    layerBounds,
    listBounds,
    listViewportRef,
    maxTargetIndex,
    minTargetIndex,
    onAutoScroll,
    onDraftIndexChange,
    onFinish,
    onRequestMoveToPosition,
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
