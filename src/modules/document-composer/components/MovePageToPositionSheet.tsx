import {
  type RefObject,
  useEffect,
  useState,
} from 'react';
import { BackHandler, Pressable } from 'react-native';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import AppBottomSheetModal from '@/components/bottom-sheets/AppBottomSheetModal';
import { AppButton } from '@/components/buttons/AppButton';
import AppIcon from '@/components/icons/AppIcon';
import AppFlex from '@/components/layout/AppFlex';
import AppTextInput from '@/components/inputs/AppTextInput';
import AppText from '@/components/typography/AppText';
import type { ComposerPage } from '../types/documentComposer.types';

const SNAP_POINTS = ['72%'];

type MovePageToPositionSheetProps = {
  ref: RefObject<BottomSheetModal | null>;
  page: ComposerPage;
  pages: ComposerPage[];
  isActive: boolean;
  onMove: (pageId: string, targetPosition: number) => void;
  onDismiss: () => void;
};

const MovePageToPositionSheet = ({
  ref,
  page,
  pages,
  isActive,
  onMove,
  onDismiss,
}: MovePageToPositionSheetProps) => {
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();
  const [position, setPosition] = useState('');
  const targetPosition = Number(position);
  const hasValidPosition =
    /^\d+$/.test(position) &&
    Number.isInteger(targetPosition) &&
    targetPosition >= 1 &&
    targetPosition <= pages.length;
  const canMove =
    hasValidPosition && targetPosition !== page.order;

  useEffect(() => {
    if (isActive) setPosition('');
  }, [isActive, page.id]);

  useEffect(() => {
    if (!isActive) return;
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        ref.current?.dismiss();
        return true;
      }
    );
    return () => subscription.remove();
  }, [isActive, ref]);

  const close = () => ref.current?.dismiss();
  const move = () => {
    if (!canMove) return;
    onMove(page.id, targetPosition);
    close();
  };

  return (
    <AppBottomSheetModal
      ref={ref}
      snapPoints={SNAP_POINTS}
      topInset={insets.top}
      bottomInset={insets.bottom}
      enableDynamicSizing={false}
      enablePanDownToClose
      enableContentPanningGesture
      enableHandlePanningGesture
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
              Mover página {page.order}
            </AppText>
            <AppText variant="text.xs.regular" color="details">
              Elige la posición final dentro del documento.
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

        <AppFlex gap="md">
          <AppFlex p="sm" gap="xs" style={styles.pageSummary}>
            <AppText variant="text.xs.regular" color="details">
              Página que se moverá
            </AppText>
            <AppText variant="text.sm.bold" color="headings">
              Página {page.order} · {page.fileName}
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
            {hasValidPosition && targetPosition === page.order ? (
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
        </AppFlex>

        <AppFlex direction="row" gap="sm" style={styles.sheetActions}>
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

export default MovePageToPositionSheet;
