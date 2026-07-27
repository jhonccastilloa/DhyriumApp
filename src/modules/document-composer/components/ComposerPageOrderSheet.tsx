import { type RefObject, useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import AppBottomSheetModal from '@/components/bottom-sheets/AppBottomSheetModal';
import { AppButton } from '@/components/buttons/AppButton';
import AppIcon from '@/components/icons/AppIcon';
import AppTextInput from '@/components/inputs/AppTextInput';
import AppFlex from '@/components/layout/AppFlex';
import AppText from '@/components/typography/AppText';
import type { ComposerPage } from '../types/documentComposer.types';

const MOVE_SHEET_SNAP_POINTS = ['72%'];

type ComposerPageOrderSheetProps = {
  ref: RefObject<BottomSheetModal | null>;
  page: ComposerPage;
  pageCount: number;
  onMoveToPosition: (pageId: string, targetPosition: number) => void;
  onDismiss: () => void;
};

const ComposerPageOrderSheet = ({
  ref,
  page,
  pageCount,
  onMoveToPosition,
  onDismiss,
}: ComposerPageOrderSheetProps) => {
  const { theme } = useUnistyles();
  const [position, setPosition] = useState('');
  const targetPosition = Number(position);
  const hasValidPosition =
    /^\d+$/.test(position) &&
    Number.isInteger(targetPosition) &&
    targetPosition >= 1 &&
    targetPosition <= pageCount;
  const canMove =
    hasValidPosition && targetPosition !== page.order;
  useEffect(() => setPosition(''), [page.id]);

  const close = () => ref.current?.dismiss();
  const move = () => {
    if (!canMove) return;
    onMoveToPosition(page.id, targetPosition);
    close();
  };

  return (
    <AppBottomSheetModal
      ref={ref}
      snapPoints={MOVE_SHEET_SNAP_POINTS}
      enableDynamicSizing={false}
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
            placeholder={`Entre 1 y ${pageCount}`}
          />
          {position.length > 0 && !hasValidPosition ? (
            <AppText variant="text.xs.regular" color="error">
              Introduce un entero entre 1 y {pageCount}.
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
