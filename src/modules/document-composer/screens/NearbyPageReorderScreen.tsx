import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alert } from 'react-native';
import {
  useNavigation,
  usePreventRemove,
  type StaticScreenProps,
} from '@react-navigation/native';
import { StyleSheet } from 'react-native-unistyles';
import { toast } from 'sonner-native';
import type { MainAppNavigatorNavigationProp } from '@/app/navigation/MainAppNavigator';
import { AppButton } from '@/components/buttons/AppButton';
import AppFlex from '@/components/layout/AppFlex';
import AppHeader from '@/components/navigation/AppHeader';
import AppText from '@/components/typography/AppText';
import NearbyPageReorderGrid from '../components/NearbyPageReorderGrid';
import { getNearbyPages } from '../domain/pageOrder';
import { useDocumentComposerStore } from '../state/useDocumentComposerStore';
import type { ComposerPage } from '../types/documentComposer.types';

type Props = StaticScreenProps<{ pageId: string }>;

type NearbyOrderDraft = {
  pages: ComposerPage[];
  initialPageIds: string[];
  rangeStart: number;
  selectedOrder?: number;
};

const createDraft = (
  pages: ComposerPage[],
  selectedPageId: string,
): NearbyOrderDraft => {
  const nearbyPages = getNearbyPages(pages, selectedPageId);
  const selectedPage = pages.find(page => page.id === selectedPageId);

  return {
    pages: nearbyPages,
    initialPageIds: nearbyPages.map(page => page.id),
    rangeStart: nearbyPages[0]?.order ?? 1,
    selectedOrder: selectedPage?.order,
  };
};

const hasSameOrder = (left: string[], right: string[]) =>
  left.length === right.length &&
  left.every((pageId, index) => pageId === right[index]);

const NearbyPageReorderScreen = ({ route }: Props) => {
  const navigation = useNavigation<MainAppNavigatorNavigationProp>();
  const session = useDocumentComposerStore(state => state.session);
  const applyNearbyPageOrder = useDocumentComposerStore(
    state => state.applyNearbyPageOrder,
  );
  const [draft] = useState(() =>
    createDraft(session?.pages ?? [], route.params.pageId),
  );
  const [orderedPageIds, setOrderedPageIds] = useState(
    draft.initialPageIds,
  );
  const [confirmed, setConfirmed] = useState(false);
  const [discarded, setDiscarded] = useState(false);
  const confirming = useRef(false);
  const pendingExitAction = useRef<
    Parameters<typeof navigation.dispatch>[0] | null
  >(null);
  const isDirty = !hasSameOrder(draft.initialPageIds, orderedPageIds);
  const pagesById = useMemo(
    () => new Map(draft.pages.map(page => [page.id, page])),
    [draft.pages],
  );
  const orderedPages = useMemo(
    () =>
      orderedPageIds.flatMap(pageId => {
        const page = pagesById.get(pageId);
        return page ? [page] : [];
      }),
    [orderedPageIds, pagesById],
  );

  usePreventRemove(isDirty && !confirmed && !discarded, ({ data }) => {
    Alert.alert(
      'Descartar cambios',
      'El orden de las páginas todavía no se ha confirmado.',
      [
        { text: 'Seguir editando', style: 'cancel' },
        {
          text: 'Descartar',
          style: 'destructive',
          onPress: () => {
            pendingExitAction.current = data.action;
            setDiscarded(true);
          },
        },
      ],
    );
  });

  useEffect(() => {
    if (confirmed) {
      navigation.goBack();
      return;
    }
    if (discarded && pendingExitAction.current) {
      navigation.dispatch(pendingExitAction.current);
    }
  }, [confirmed, discarded, navigation]);

  const cancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const confirm = useCallback(() => {
    if (!isDirty || confirmed || confirming.current) return;
    confirming.current = true;

    const applied = applyNearbyPageOrder(
      draft.initialPageIds,
      orderedPageIds,
    );
    if (!applied) {
      toast.error(
        'No se pudo actualizar el orden. Vuelve a la revisión e inténtalo nuevamente.',
      );
      confirming.current = false;
      return;
    }

    toast.success('Orden actualizado');
    setConfirmed(true);
  }, [
    applyNearbyPageOrder,
    confirmed,
    draft.initialPageIds,
    isDirty,
    orderedPageIds,
  ]);

  if (
    !session ||
    draft.pages.length === 0 ||
    orderedPages.length !== draft.pages.length
  ) {
    return (
      <AppFlex flex={1} style={styles.screen}>
        <AppHeader title="Reordenar páginas" showBack />
        <AppFlex flex={1} align="center" justify="center" p="lg">
          <AppText
            variant="text.sm.regular"
            color="details"
            align="center"
          >
            Ya no se encuentran disponibles las páginas de este rango.
          </AppText>
        </AppFlex>
      </AppFlex>
    );
  }

  return (
    <AppFlex flex={1} style={styles.screen}>
      <AppHeader
        title="Reordenar páginas"
        eyebrow={
          draft.selectedOrder
            ? `Cerca de la página ${draft.selectedOrder}`
            : undefined
        }
        count={orderedPages.length}
        showBack
        onBack={cancel}
      />

      <AppFlex flex={1} p="md" gap="sm">
        <NearbyPageReorderGrid
          pages={orderedPages}
          rangeStart={draft.rangeStart}
          selectedPageId={route.params.pageId}
          pdfSources={session.pdfSources}
          onOrderChange={setOrderedPageIds}
        />
      </AppFlex>

      <AppFlex direction="row" p="md" gap="sm" style={styles.footer}>
        <AppButton
          text="Cancelar"
          variant="ghost"
          style={styles.action}
          onPress={cancel}
        />
        <AppButton
          text="Confirmar"
          style={styles.action}
          disabled={!isDirty || confirmed}
          isLoading={confirmed}
          onPress={confirm}
        />
      </AppFlex>
    </AppFlex>
  );
};

const styles = StyleSheet.create(theme => ({
  screen: {
    backgroundColor: theme.colors.surface.background.primary,
  },
  footer: {
    backgroundColor: theme.colors.surface.background.cards,
    borderTopWidth: theme.border.hairline,
    borderTopColor: theme.colors.border.subtle,
  },
  action: { flex: 1 },
}));

export default NearbyPageReorderScreen;
