import { useEffect } from 'react';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import AppIcon from '@/components/icons/AppIcon';
import AppFlex from '@/components/layout/AppFlex';
import AppText from '@/components/typography/AppText';
import { LOCAL_PAGE_DROP_BAR_HEIGHT } from '../constants/documentComposerLayout';
import {
  LOCAL_DROP_TARGET,
  type LocalDropTarget,
} from '../domain/localPageDragGeometry';
import type {
  LocalPageDragContext,
  LocalPageDragSession,
} from '../hooks/useLocalPageDrag';
import DocumentPageThumbnail from './DocumentPageThumbnail';

type LocalPageDragLayerProps = {
  context: LocalPageDragContext;
  session?: LocalPageDragSession;
};

type LocalPageDropTargetProps = {
  context: LocalPageDragContext;
  target: LocalDropTarget;
};

const LocalPageDropTarget = ({
  context,
  target,
}: LocalPageDropTargetProps) => {
  const { theme } = useUnistyles();
  const isCancel = target === LOCAL_DROP_TARGET.cancel;
  const accentColor =
    isCancel
      ? theme.colors.text.error
      : theme.colors.border.focus;
  const animatedStyle = useAnimatedStyle(() => {
    const active = context.hoverTarget.value === target;
    return {
      borderWidth: active
        ? theme.border.emphasized
        : theme.border.hairline,
      borderColor: active
        ? accentColor
        : theme.colors.border.subtle,
      backgroundColor: active
        ? isCancel
          ? theme.colors.surface.status.error
          : theme.colors.navigation.rail
        : theme.colors.surface.background.elements,
      transform: [{ scale: active ? 1.02 : 1 }],
    };
  });
  const hintStyle = useAnimatedStyle(() => ({
    opacity: context.hoverTarget.value === target ? 1 : 0,
  }));

  return (
    <Animated.View
      style={[styles.dropTarget, animatedStyle]}
    >
      <AppIcon
        name={isCancel ? 'close' : 'sortAscending'}
        size={isCancel ? 19 : 20}
        mColor={accentColor}
      />
      <AppFlex flex={1} align="center">
        <AppText
          variant="text.sm.bold"
          color={isCancel ? 'error' : 'link'}
          numberOfLines={1}
        >
          {isCancel ? 'Cancelar' : 'Mover a posición…'}
        </AppText>
        <Animated.View style={hintStyle}>
          <AppText
            variant="text.xs.regular"
            color={isCancel ? 'error' : 'link'}
            numberOfLines={1}
          >
            {isCancel
              ? 'Suelta para cancelar'
              : 'Suelta para mover a posición'}
          </AppText>
        </Animated.View>
      </AppFlex>
    </Animated.View>
  );
};

const LocalPageDragLayer = ({
  context,
  session,
}: LocalPageDragLayerProps) => {
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();
  const dropBarHeight =
    LOCAL_PAGE_DROP_BAR_HEIGHT + insets.bottom;
  useEffect(() => {
    context.dropBarHeight.value = dropBarHeight;
  }, [context.dropBarHeight, dropBarHeight]);
  const overlayStyle = useAnimatedStyle(() => ({
    width: context.overlayWidth.value,
    height: context.overlayHeight.value,
    opacity: context.dragActive.value ? 1 : 0,
    transform: [
      { translateX: context.overlayOriginX.value },
      {
        translateY:
          context.overlayOriginY.value +
          context.overlayTranslateY.value,
      },
      { scale: context.dragActive.value ? 1.02 : 1 },
    ],
  }));
  return (
    <Animated.View
      ref={context.dragLayerRef}
      pointerEvents="box-none"
      collapsable={false}
      style={styles.layer}
    >
      {session ? (
        <>
          <Animated.View
            pointerEvents="none"
            style={[styles.overlay, overlayStyle]}
          >
            <AppFlex
              width={82}
              height={116}
              style={styles.overlayThumbnail}
            >
              <DocumentPageThumbnail
                page={session.page}
                thumbnailUri={session.thumbnailUri}
                isLoading={false}
              />
            </AppFlex>
            <AppFlex flex={1} gap="xs">
              <AppText
                variant="text.sm.bold"
                color="headings"
                numberOfLines={1}
              >
                Página {session.page.order}
              </AppText>
              <AppText
                variant="text.xs.regular"
                color="details"
                numberOfLines={1}
              >
                {session.page.fileName}
              </AppText>
              <AppText
                variant="text.xs.bold"
                color="link"
                numberOfLines={1}
              >
                Nueva posición: {session.draftIndex + 1}
              </AppText>
            </AppFlex>
            <AppFlex
              width={42}
              height="100%"
              align="center"
              justify="flex-end"
            >
              <AppFlex
                width={38}
                height={38}
                align="center"
                justify="center"
                style={styles.overlayHandle}
              >
                <AppIcon
                  name="dotsSixVertical"
                  size={22}
                  mColor={theme.colors.navigation.active}
                />
              </AppFlex>
            </AppFlex>
          </Animated.View>

          <AppFlex
            direction="row"
            gap="sm"
            p="sm"
            style={[
              styles.dropBar,
              {
                height: dropBarHeight,
                paddingBottom: insets.bottom + theme.spacing.sm,
              },
            ]}
          >
            <LocalPageDropTarget
              context={context}
              target={LOCAL_DROP_TARGET.cancel}
            />
            <LocalPageDropTarget
              context={context}
              target={LOCAL_DROP_TARGET.moveToPosition}
            />
          </AppFlex>
        </>
      ) : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create(theme => ({
  layer: {
    position: 'absolute',
    inset: 0,
    zIndex: 100,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    overflow: 'hidden',
    borderRadius: theme.radius.md,
    borderWidth: theme.border.emphasized,
    borderColor: theme.colors.border.focus,
    backgroundColor: theme.colors.surface.background.cards,
    ...theme.elevation.sheet,
  },
  overlayHandle: {
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.navigation.rail,
  },
  overlayThumbnail: {
    overflow: 'hidden',
    borderRadius: theme.radius.xs,
    backgroundColor: theme.colors.surface.background.elements,
  },
  dropBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.surface.background.cards,
    borderTopWidth: theme.border.hairline,
    borderTopColor: theme.colors.border.strong,
    ...theme.elevation.sheet,
  },
  dropTarget: {
    minWidth: 0,
    minHeight: 56,
    flex: 1,
    paddingHorizontal: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    borderRadius: theme.radius.sm,
  },
}));

export default LocalPageDragLayer;
