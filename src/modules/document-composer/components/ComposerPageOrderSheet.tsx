import {
  type RefObject,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { BackHandler, Pressable } from 'react-native';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import AppBottomSheetModal from '@/components/bottom-sheets/AppBottomSheetModal';
import { AppButton } from '@/components/buttons/AppButton';
import AppIcon from '@/components/icons/AppIcon';
import AppTextInput from '@/components/inputs/AppTextInput';
import AppFlex from '@/components/layout/AppFlex';
import AppText from '@/components/typography/AppText';
import { getNearbyPages } from '../domain/pageOrder';
import type { ComposerPage } from '../types/documentComposer.types';
import NearbyPageReorderGrid from './NearbyPageReorderGrid';

const NEARBY_SHEET_SNAP_POINTS = ['100%'];
const MOVE_SHEET_SNAP_POINTS = ['72%'];

type OrderSheetStage = 'nearby' | 'move';

type ComposerPageOrderSheetProps = {
  ref: RefObject<BottomSheetModal | null>;
  page: ComposerPage;
  pages: ComposerPage[];
  initialStage?: OrderSheetStage;
  artifactId?: string;
  onApplyNearbyOrder: (
    rangePageIds: string[],
    orderedPageIds: string[]
  ) => void;
  onMoveToPosition: (pageId: string, targetPosition: number) => void;
  onDismiss: () => void;
};

const ComposerPageOrderSheet = ({
  ref,
  page,
  pages,
  initialStage = 'nearby',
  artifactId,
  onApplyNearbyOrder,
  onMoveToPosition,
  onDismiss,
}: ComposerPageOrderSheetProps) => {
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();
  const [stage, setStage] =
    useState<OrderSheetStage>(initialStage);
  const [position, setPosition] = useState('');
  const [movePageId, setMovePageId] = useState(page.id);
  const [rangePageIds] = useState(() =>
    initialStage === 'nearby'
      ? getNearbyPages(pages, page.id).map(item => item.id)
      : []
  );
  const rangePageIdSet = useMemo(
    () => new Set(rangePageIds),
    [rangePageIds]
  );
  const nearbyPages = useMemo(
    () =>
      stage === 'nearby'
        ? pages.filter(item => rangePageIdSet.has(item.id))
        : [],
    [pages, rangePageIdSet, stage]
  );
  const movePage =
    pages.find(item => item.id === movePageId) ?? page;
  const snapPoints =
    stage === 'nearby'
      ? NEARBY_SHEET_SNAP_POINTS
      : MOVE_SHEET_SNAP_POINTS;
  const targetPosition = Number(position);
  const hasValidPosition =
    /^\d+$/.test(position) &&
    Number.isInteger(targetPosition) &&
    targetPosition >= 1 &&
    targetPosition <= pages.length;
  const canMove =
    hasValidPosition && targetPosition !== movePage.order;

  useEffect(() => {
    ref.current?.snapToIndex(0);
  }, [ref, stage]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        ref.current?.dismiss();
        return true;
      }
    );
    return () => subscription.remove();
  }, [ref]);

  const close = () => ref.current?.dismiss();
  const openMoveToPosition = (pageId: string) => {
    setMovePageId(pageId);
    setPosition('');
    setStage('move');
  };
  const move = () => {
    if (!canMove) return;
    onMoveToPosition(movePage.id, targetPosition);
    close();
  };

  return (
    <AppBottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      topInset={insets.top}
      bottomInset={insets.bottom}
      enableDynamicSizing={false}
      enablePanDownToClose={stage === 'move'}
      enableContentPanningGesture={stage === 'move'}
      enableHandlePanningGesture={stage === 'move'}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      onDismiss={onDismiss}
    >
      <AppFlex flex={1} p="md" pb="lg" gap="md">
        <AppFlex
          direction="row"
          align="center"
          justify="space-between"
          gap="sm"
          style={styles.sheetHeader}
        >
          <AppFlex flex={1} gap="xs">
            <AppText variant="title.m" color="headings">
              {stage === 'nearby'
                ? `Reordenar cerca de la página ${page.order}`
                : `Mover página ${movePage.order}`}
            </AppText>
            <AppText variant="text.xs.regular" color="details">
              {stage === 'nearby'
                ? `Mostrando ${nearbyPages.length} páginas cercanas.`
                : 'Elige la posición final dentro del documento.'}
            </AppText>
          </AppFlex>
          <Pressable
            accessibilityLabel="Cerrar"
            onPress={close}
            style={styles.closeButton}
          >
            <AppIcon
              name="close"
              size={20}
              mColor={theme.colors.icon.secondary}
            />
          </Pressable>
        </AppFlex>

        {stage === 'nearby' ? (
          <NearbyPageReorderGrid
            pages={nearbyPages}
            rangePageIds={rangePageIds}
            selectedPageId={page.id}
            artifactId={artifactId}
            onApplyOrder={onApplyNearbyOrder}
            onMoveToPosition={openMoveToPosition}
          />
        ) : (
          <AppFlex flex={1} gap="md">
            <AppFlex p="sm" gap="xs" style={styles.pageSummary}>
              <AppText variant="text.xs.regular" color="details">
                Página que se moverá
              </AppText>
              <AppText variant="text.sm.bold" color="headings">
                Página {movePage.order} · {movePage.fileName}
              </AppText>
            </AppFlex>

            <AppFlex gap="xs">
              <AppText variant="text.sm.bold" color="body">
                Nueva posición
              </AppText>
              <AppTextInput
                value={position}
                onChangeValue={setPosition}
                keyboardType="number-pad"
                placeholder={`Entre 1 y ${pages.length}`}
              />
              {position.length > 0 && !hasValidPosition ? (
                <AppText variant="text.xs.regular" color="error">
                  Introduce un entero entre 1 y {pages.length}.
                </AppText>
              ) : null}
              {hasValidPosition &&
              targetPosition === movePage.order ? (
                <AppText variant="text.xs.regular" color="error">
                  La página ya está en esa posición.
                </AppText>
              ) : null}
            </AppFlex>

            <AppFlex p="sm" gap="xs" style={styles.destination}>
              <AppText variant="text.xs.regular" color="details">
                Destino
              </AppText>
              <AppText variant="text.sm.bold" color="body">
                {hasValidPosition
                  ? `La página quedará en la posición ${targetPosition}.`
                  : 'Introduce una posición para ver el destino.'}
              </AppText>
            </AppFlex>

            <AppFlex
              direction="row"
              gap="sm"
              style={styles.sheetActions}
            >
              <AppButton
                text="Cancelar"
                variant="ghost"
                style={styles.sheetAction}
                onPress={close}
              />
              <AppButton
                text="Mover"
                disabled={!canMove}
                style={styles.sheetAction}
                onPress={move}
              />
            </AppFlex>
          </AppFlex>
        )}
      </AppFlex>
    </AppBottomSheetModal>
  );
};

const styles = StyleSheet.create(theme => ({
  sheetHeader: {
    minHeight: 40,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface.background.elements,
  },
  pageSummary: {
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface.background.elements,
  },
  destination: {
    borderRadius: theme.radius.sm,
    borderWidth: theme.border.hairline,
    borderColor: theme.colors.border.subtle,
  },
  sheetActions: {
    marginTop: 'auto',
  },
  sheetAction: { flex: 1 },
}));

export default ComposerPageOrderSheet;
