import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  FlatList,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
} from 'react-native';
import {
  useAnimatedRef,
  useSharedValue,
  withTiming,
  type AnimatedRef,
  type SharedValue,
} from 'react-native-reanimated';
import {
  DOCUMENT_PAGE_CARD_GAP,
  DOCUMENT_PAGE_CARD_HEIGHT,
  DOCUMENT_PAGE_ITEM_EXTENT,
  LOCAL_PAGE_DROP_AREA_FALLBACK_HEIGHT,
} from '../constants/documentComposerLayout';
import {
  LOCAL_DROP_TARGET,
  type LocalDragBounds,
  type LocalDropTarget,
  type LocalPageDragOutcome,
} from '../domain/localPageDragGeometry';
import { getNearbyPages } from '../domain/pageOrder';
import type { ComposerPage } from '../types/documentComposer.types';

export type LocalPageDragSession = {
  pageId: string;
  page: ComposerPage;
  originalIndex: number;
  draftIndex: number;
  windowPageIds: string[];
  thumbnailUri?: string;
};

export type LocalPageDragContext = {
  dragActive: SharedValue<boolean>;
  hoverTarget: SharedValue<LocalDropTarget>;
  overlayOriginX: SharedValue<number>;
  overlayOriginY: SharedValue<number>;
  overlayTranslateY: SharedValue<number>;
  overlayWidth: SharedValue<number>;
  overlayHeight: SharedValue<number>;
  overlayOpacity: SharedValue<number>;
  overlayScale: SharedValue<number>;
  targetIndex: SharedValue<number>;
  autoScrollAllowed: SharedValue<boolean>;
  listBounds: SharedValue<LocalDragBounds | null>;
  layerBounds: SharedValue<LocalDragBounds | null>;
  dropBarHeight: SharedValue<number>;
  dragLayerRef: AnimatedRef<View>;
  listViewportRef: AnimatedRef<View>;
  onStart: (
    pageId: string,
    originalIndex: number,
    thumbnailUri?: string
  ) => void;
  onDraftIndexChange: (pageId: string, targetIndex: number) => void;
  onAutoScroll: (direction: -1 | 1) => void;
  onFinish: (
    pageId: string,
    targetIndex: number,
    outcome: LocalPageDragOutcome
  ) => void;
  onRequestMoveToPosition: (pageId: string) => void;
};

type UseLocalPageDragInput = {
  pages: ComposerPage[];
  contentPadding: number;
  onCommit: (
    localPageIds: string[],
    pageId: string,
    targetPageId: string
  ) => void;
  onRequestMoveToPosition: (pageId: string) => void;
};

const HIGHLIGHT_DURATION_MS = 700;
const DROP_SETTLE_DURATION_MS = 100;

export const useLocalPageDrag = ({
  pages,
  contentPadding,
  onCommit,
  onRequestMoveToPosition,
}: UseLocalPageDragInput) => {
  const listRef = useRef<FlatList<ComposerPage>>(null);
  const pagesRef = useRef(pages);
  const onCommitRef = useRef(onCommit);
  const onRequestMoveRef = useRef(onRequestMoveToPosition);
  const dragSessionRef = useRef<LocalPageDragSession | undefined>(
    undefined
  );
  const scrollOffsetRef = useRef(0);
  const viewportHeightRef = useRef(0);
  const highlightTimerRef = useRef<
    ReturnType<typeof setTimeout> | undefined
  >(undefined);
  const settlingTimerRef = useRef<
    ReturnType<typeof setTimeout> | undefined
  >(undefined);
  const settlingFrameRef = useRef<number | undefined>(undefined);
  const [dragSession, setDragSession] =
    useState<LocalPageDragSession>();
  const [settlingSession, setSettlingSession] =
    useState<LocalPageDragSession>();
  const [highlightedPageId, setHighlightedPageId] = useState<string>();

  pagesRef.current = pages;
  onCommitRef.current = onCommit;
  onRequestMoveRef.current = onRequestMoveToPosition;

  const dragActive = useSharedValue(false);
  const hoverTarget = useSharedValue<LocalDropTarget>(
    LOCAL_DROP_TARGET.none
  );
  const overlayOriginX = useSharedValue(0);
  const overlayOriginY = useSharedValue(0);
  const overlayTranslateY = useSharedValue(0);
  const overlayWidth = useSharedValue(0);
  const overlayHeight = useSharedValue(DOCUMENT_PAGE_CARD_HEIGHT);
  const overlayOpacity = useSharedValue(0);
  const overlayScale = useSharedValue(1);
  const targetIndex = useSharedValue(0);
  const autoScrollAllowed = useSharedValue(false);
  const listBounds = useSharedValue<LocalDragBounds | null>(null);
  const layerBounds = useSharedValue<LocalDragBounds | null>(null);
  const dropBarHeight = useSharedValue(
    LOCAL_PAGE_DROP_AREA_FALLBACK_HEIGHT
  );
  const dragLayerRef = useAnimatedRef<View>();
  const listViewportRef = useAnimatedRef<View>();

  const handleStart = useCallback(
    (
      pageId: string,
      originalIndex: number,
      thumbnailUri?: string
    ) => {
      const currentPages = pagesRef.current;
      const verifiedIndex = currentPages.findIndex(
        page => page.id === pageId
      );
      if (verifiedIndex < 0 || verifiedIndex !== originalIndex) return;

      if (settlingTimerRef.current) {
        clearTimeout(settlingTimerRef.current);
        settlingTimerRef.current = undefined;
      }
      if (settlingFrameRef.current !== undefined) {
        cancelAnimationFrame(settlingFrameRef.current);
        settlingFrameRef.current = undefined;
      }
      setSettlingSession(undefined);
      const nextSession: LocalPageDragSession = {
        pageId,
        page: currentPages[verifiedIndex],
        originalIndex: verifiedIndex,
        draftIndex: verifiedIndex,
        windowPageIds: getNearbyPages(currentPages, pageId).map(
          page => page.id
        ),
        thumbnailUri,
      };
      dragSessionRef.current = nextSession;
      setDragSession(nextSession);
    },
    []
  );

  const handleDraftIndexChange = useCallback(
    (pageId: string, nextIndex: number) => {
      const current = dragSessionRef.current;
      if (
        !current ||
        current.pageId !== pageId ||
        current.draftIndex === nextIndex
      ) {
        return;
      }

      const next = { ...current, draftIndex: nextIndex };
      dragSessionRef.current = next;
      setDragSession(next);
    },
    []
  );

  const handleAutoScroll = useCallback(
    (direction: -1 | 1) => {
      const current = dragSessionRef.current;
      const currentPages = pagesRef.current;
      const viewportHeight = viewportHeightRef.current;
      if (
        !current ||
        !autoScrollAllowed.value ||
        viewportHeight <= 0
      ) {
        return;
      }

      const firstWindowIndex = currentPages.findIndex(
        page => page.id === current.windowPageIds[0]
      );
      const lastWindowIndex = currentPages.findIndex(
        page =>
          page.id ===
          current.windowPageIds[current.windowPageIds.length - 1]
      );
      if (firstWindowIndex < 0 || lastWindowIndex < firstWindowIndex) {
        return;
      }

      const contentHeight =
        contentPadding * 2 +
        currentPages.length * DOCUMENT_PAGE_CARD_HEIGHT +
        Math.max(0, currentPages.length - 1) * DOCUMENT_PAGE_CARD_GAP;
      const globalMaxOffset = Math.max(0, contentHeight - viewportHeight);
      const localMinOffset = Math.max(
        0,
        firstWindowIndex * DOCUMENT_PAGE_ITEM_EXTENT
      );
      const windowBottom =
        contentPadding +
        lastWindowIndex * DOCUMENT_PAGE_ITEM_EXTENT +
        DOCUMENT_PAGE_CARD_HEIGHT;
      const localMaxOffset = Math.min(
        globalMaxOffset,
        Math.max(localMinOffset, windowBottom - viewportHeight + contentPadding)
      );
      const nextOffset = Math.min(
        localMaxOffset,
        Math.max(
          localMinOffset,
          scrollOffsetRef.current +
            direction * DOCUMENT_PAGE_ITEM_EXTENT
        )
      );
      if (nextOffset === scrollOffsetRef.current) return;

      scrollOffsetRef.current = nextOffset;
      listRef.current?.scrollToOffset({
        offset: nextOffset,
        animated: true,
      });
    },
    [autoScrollAllowed, contentPadding]
  );

  const highlightMovedPage = useCallback((pageId: string) => {
    setHighlightedPageId(pageId);
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    highlightTimerRef.current = setTimeout(
      () => setHighlightedPageId(undefined),
      HIGHLIGHT_DURATION_MS
    );
  }, []);

  const settleOverlay = useCallback(
    (session: LocalPageDragSession) => {
      setSettlingSession(session);
      settlingFrameRef.current = requestAnimationFrame(() => {
        settlingFrameRef.current = undefined;
        overlayScale.value = withTiming(1, {
          duration: DROP_SETTLE_DURATION_MS,
        });
        overlayOpacity.value = withTiming(0, {
          duration: DROP_SETTLE_DURATION_MS,
        });
        settlingTimerRef.current = setTimeout(() => {
          settlingTimerRef.current = undefined;
          setSettlingSession(current =>
            current?.pageId === session.pageId ? undefined : current
          );
        }, DROP_SETTLE_DURATION_MS);
      });
    },
    [overlayOpacity, overlayScale]
  );

  const handleFinish = useCallback(
    (
      pageId: string,
      nextIndex: number,
      outcome: LocalPageDragOutcome
    ) => {
      const current = dragSessionRef.current;
      if (!current || current.pageId !== pageId) return;

      dragSessionRef.current = undefined;
      setDragSession(undefined);

      if (outcome === 'moveToPosition') {
        onRequestMoveRef.current(pageId);
        return;
      }
      if (outcome === 'cancel') return;

      const targetPage = pagesRef.current[nextIndex];
      if (!targetPage) return;
      if (nextIndex === current.originalIndex) return;

      settleOverlay(current);
      onCommitRef.current(
        current.windowPageIds,
        pageId,
        targetPage.id
      );
      highlightMovedPage(pageId);
    },
    [highlightMovedPage, settleOverlay]
  );

  const requestMoveToPosition = useCallback((pageId: string) => {
    onRequestMoveRef.current(pageId);
  }, []);

  const dragContext = useMemo<LocalPageDragContext>(
    () => ({
      dragActive,
      hoverTarget,
      overlayOriginX,
      overlayOriginY,
      overlayTranslateY,
      overlayWidth,
      overlayHeight,
      overlayOpacity,
      overlayScale,
      targetIndex,
      autoScrollAllowed,
      listBounds,
      layerBounds,
      dropBarHeight,
      dragLayerRef,
      listViewportRef,
      onStart: handleStart,
      onDraftIndexChange: handleDraftIndexChange,
      onAutoScroll: handleAutoScroll,
      onFinish: handleFinish,
      onRequestMoveToPosition: requestMoveToPosition,
    }),
    [
      autoScrollAllowed,
      dragActive,
      dragLayerRef,
      dropBarHeight,
      handleAutoScroll,
      handleDraftIndexChange,
      handleFinish,
      handleStart,
      hoverTarget,
      layerBounds,
      listBounds,
      listViewportRef,
      overlayHeight,
      overlayOpacity,
      overlayOriginX,
      overlayOriginY,
      overlayScale,
      overlayTranslateY,
      overlayWidth,
      requestMoveToPosition,
      targetIndex,
    ]
  );

  const handleListScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
    },
    []
  );

  const handleListLayout = useCallback((event: LayoutChangeEvent) => {
    viewportHeightRef.current = event.nativeEvent.layout.height;
  }, []);

  useEffect(
    () => () => {
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
      if (settlingTimerRef.current) clearTimeout(settlingTimerRef.current);
      if (settlingFrameRef.current !== undefined) {
        cancelAnimationFrame(settlingFrameRef.current);
      }
    },
    []
  );

  return {
    listRef,
    dragContext,
    dragSession,
    dragLayerSession: dragSession ?? settlingSession,
    highlightedPageId,
    onListScroll: handleListScroll,
    onListLayout: handleListLayout,
  };
};
