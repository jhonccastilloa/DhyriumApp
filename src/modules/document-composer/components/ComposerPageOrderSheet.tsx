import {
  type RefObject,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Pressable } from 'react-native';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import AppBottomSheetModal from '@/components/bottom-sheets/AppBottomSheetModal';
import { AppButton } from '@/components/buttons/AppButton';
import AppIcon from '@/components/icons/AppIcon';
import AppTextInput from '@/components/inputs/AppTextInput';
import AppFlex from '@/components/layout/AppFlex';
import AppOptionItem from '@/components/options/AppOptionItem';
import AppText from '@/components/typography/AppText';
import {
  getNearbyPages,
  type PagePlacement,
} from '../domain/pageOrder';
import type { ComposerPage } from '../types/documentComposer.types';
import NearbyPageReorderGrid from './NearbyPageReorderGrid';

type OrderSheetStage = 'menu' | 'move' | 'nearby';

type ComposerPageOrderSheetProps = {
  ref: RefObject<BottomSheetModal | null>;
  page: ComposerPage;
  pages: ComposerPage[];
  artifactId?: string;
  onApplyNearbyOrder: (orderedPageIds: string[]) => void;
  onMoveToPosition: (
    pageId: string,
    targetPosition: number,
    placement: PagePlacement
  ) => void;
  onDismiss: () => void;
};

const ComposerPageOrderSheet = ({
  ref,
  page,
  pages,
  artifactId,
  onApplyNearbyOrder,
  onMoveToPosition,
  onDismiss,
}: ComposerPageOrderSheetProps) => {
  const { theme } = useUnistyles();
  const [stage, setStage] = useState<OrderSheetStage>('menu');
  const [position, setPosition] = useState('');
  const [placement, setPlacement] = useState<PagePlacement>('before');
  const targetPosition = Number(position);
  const hasValidPosition =
    /^\d+$/.test(position) &&
    Number.isInteger(targetPosition) &&
    targetPosition >= 1 &&
    targetPosition <= pages.length;
  const targetPage = hasValidPosition
    ? pages[targetPosition - 1]
    : undefined;
  const canMove = Boolean(targetPage && targetPage.id !== page.id);
  const nearbyPages = useMemo(
    () => getNearbyPages(pages, page.id),
    [page.id, pages]
  );
  const snapPoints = useMemo(
    () =>
      stage === 'nearby'
        ? ['100%']
        : stage === 'move'
        ? ['92%']
        : ['42%'],
    [stage]
  );

  const close = () => ref.current?.dismiss();
  const saveNearbyOrder = (orderedPageIds: string[]) => {
    onApplyNearbyOrder(orderedPageIds);
    close();
  };

  useEffect(() => {
    ref.current?.snapToIndex(0);
  }, [ref, stage]);
  const move = () => {
    if (!canMove) return;
    onMoveToPosition(page.id, targetPosition, placement);
    close();
  };

  return (
    <AppBottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={stage !== 'nearby'}
      enableContentPanningGesture={stage !== 'nearby'}
      enableHandlePanningGesture={stage !== 'nearby'}
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
              {stage === 'menu'
                ? `Ordenar página ${page.order}`
                : stage === 'move'
                ? 'Mover a posición'
                : 'Reordenar cercanas'}
            </AppText>
            {stage !== 'menu' ? (
              <AppText variant="text.xs.regular" color="details">
                Página seleccionada: {page.order}
              </AppText>
            ) : null}
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

        {stage === 'menu' ? (
          <AppFlex gap="sm">
            <AppOptionItem
              iconLeft="sortAscending"
              title="Mover a posición"
              description="Para desplazamientos largos dentro del documento."
              onPress={() => setStage('move')}
              style={styles.menuOption}
            />
            <AppOptionItem
              iconLeft="dotsSixVertical"
              title="Reordenar cercanas"
              description="Arrastra hasta 9 páginas sin desplazamiento."
              onPress={() => setStage('nearby')}
              style={styles.menuOption}
            />
          </AppFlex>
        ) : null}

        {stage === 'move' ? (
          <AppFlex flex={1} gap="md">
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
                Posición de referencia (1–{pages.length})
              </AppText>
              <AppTextInput
                value={position}
                onChangeValue={setPosition}
                allowedRegex={/[^0-9]/g}
                keyboardType="number-pad"
                placeholder={`Entre 1 y ${pages.length}`}
              />
              {position.length > 0 && !hasValidPosition ? (
                <AppText variant="text.xs.regular" color="error">
                  Introduce una posición válida entre 1 y {pages.length}.
                </AppText>
              ) : null}
              {targetPage?.id === page.id ? (
                <AppText variant="text.xs.regular" color="error">
                  Elige una página de referencia distinta.
                </AppText>
              ) : null}
            </AppFlex>
            <AppFlex direction="row" p="xs" gap="xs" style={styles.segment}>
              {(['before', 'after'] as const).map(option => {
                const selected = placement === option;
                return (
                  <Pressable
                    key={option}
                    onPress={() => setPlacement(option)}
                    style={[
                      styles.segmentOption,
                      selected && styles.segmentOptionSelected,
                    ]}
                  >
                    <AppText
                      variant="text.sm.bold"
                      color={selected ? 'link' : 'details'}
                    >
                      {option === 'before'
                        ? 'Insertar antes'
                        : 'Insertar después'}
                    </AppText>
                  </Pressable>
                );
              })}
            </AppFlex>
            <AppFlex p="sm" gap="xs" style={styles.destination}>
              <AppText variant="text.xs.regular" color="details">
                Destino
              </AppText>
              <AppText variant="text.sm.bold" color="body">
                {targetPage
                  ? `${placement === 'before' ? 'Antes' : 'Después'} de página ${
                      targetPage.order
                    } · ${targetPage.fileName}`
                  : 'Selecciona una posición para ver el destino.'}
              </AppText>
            </AppFlex>
            <AppFlex direction="row" gap="sm" style={styles.sheetActions}>
              <AppButton
                text="Cancelar"
                variant="ghost"
                style={styles.sheetAction}
                onPress={close}
              />
              <AppButton
                text="Confirmar movimiento"
                disabled={!canMove}
                style={styles.sheetAction}
                onPress={move}
              />
            </AppFlex>
          </AppFlex>
        ) : null}

        {stage === 'nearby' ? (
          <NearbyPageReorderGrid
            pages={nearbyPages}
            selectedPageId={page.id}
            artifactId={artifactId}
            onCancel={close}
            onSave={saveNearbyOrder}
          />
        ) : null}
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
  menuOption: {
    borderWidth: theme.border.hairline,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.background.primary,
  },
  pageSummary: {
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface.background.elements,
  },
  segment: {
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface.background.elements,
  },
  segmentOption: {
    minHeight: 40,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.xs,
  },
  segmentOptionSelected: {
    backgroundColor: theme.colors.surface.background.cards,
    borderWidth: theme.border.hairline,
    borderColor: theme.colors.border.focus,
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
