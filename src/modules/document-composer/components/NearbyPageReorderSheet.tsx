import { type RefObject, useEffect, useMemo } from 'react';
import { BackHandler, Pressable } from 'react-native';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';
import AppBottomSheetModal from '@/components/bottom-sheets/AppBottomSheetModal';
import AppIcon from '@/components/icons/AppIcon';
import AppFlex from '@/components/layout/AppFlex';
import AppText from '@/components/typography/AppText';
import { getNearbyPages } from '../domain/pageOrder';
import type { ComposerPage } from '../types/documentComposer.types';
import NearbyPageReorderGrid from './NearbyPageReorderGrid';

const SNAP_POINTS = ['100%'];

type NearbyPageReorderSheetProps = {
  ref: RefObject<BottomSheetModal | null>;
  page: ComposerPage;
  pages: ComposerPage[];
  artifactId?: string;
  isActive: boolean;
  onApplyOrder: (rangePageIds: string[], orderedPageIds: string[]) => void;
  onDismiss: () => void;
};

const NearbyPageReorderSheet = ({
  ref,
  page,
  pages,
  artifactId,
  isActive,
  onApplyOrder,
  onDismiss,
}: NearbyPageReorderSheetProps) => {
  const insets = useSafeAreaInsets();
  const { nearbyPages, rangePageIds } = useMemo(() => {
    const selectedPages = getNearbyPages(pages, page.id);

    return {
      nearbyPages: selectedPages,
      rangePageIds: selectedPages.map(item => item.id),
    };
  }, [pages, page.id]);

  useEffect(() => {
    if (!isActive) return;
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        ref.current?.dismiss();
        return true;
      },
    );
    return () => subscription.remove();
  }, [isActive, ref]);

  const close = () => ref.current?.dismiss();

  return (
    <AppBottomSheetModal
      ref={ref}
      snapPoints={SNAP_POINTS}
      topInset={insets.top}
      bottomInset={insets.bottom}
      enableDynamicSizing={false}
      enablePanDownToClose={false}
      enableContentPanningGesture={false}
      enableHandlePanningGesture={false}
      onDismiss={onDismiss}
    >
      <AppFlex flex={1} gap="md" pb="lg">
        <AppFlex
          direction="row"
          align="center"
          justify="space-between"
          gap="sm"
          pt="md"
          ph="md"
          style={styles.sheetHeader}
        >
          <AppFlex flex={1} gap="xs">
            <AppText variant="title.m" color="headings">
              Reordenar cerca de la página {page.order}
            </AppText>
            <AppText variant="text.xs.regular" color="details">
              Mostrando {nearbyPages.length} páginas cercanas.
            </AppText>
          </AppFlex>
          <Pressable
            accessibilityLabel="Cerrar"
            onPress={close}
            style={styles.closeButton}
          >
            <AppIcon name="close" size={20} color="secondary" />
          </Pressable>
        </AppFlex>

        <NearbyPageReorderGrid
          pages={nearbyPages}
          rangePageIds={rangePageIds}
          selectedPageId={page.id}
          artifactId={artifactId}
          onApplyOrder={onApplyOrder}
        />
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
}));

export default NearbyPageReorderSheet;
