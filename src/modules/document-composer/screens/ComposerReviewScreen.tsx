import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  TextInput,
  View,
  type ListRenderItem,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { StaticScreenProps } from '@react-navigation/native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { toast } from 'sonner-native';
import AppHeader from '@/components/navigation/AppHeader';
import { AppButton } from '@/components/buttons/AppButton';
import AppIcon from '@/components/icons/AppIcon';
import AppFlex from '@/components/layout/AppFlex';
import AppText from '@/components/typography/AppText';
import type { MainAppNavigatorNavigationProp } from '@/app/navigation/MainAppNavigator';
import { asFileUri } from '@/infrastructure/storage/fileSystemUtils';
import ContractsService from '@/modules/contracts/services/ContractsService';
import DocumentPageListItem from '../components/DocumentPageListItem';
import MovePageToPositionSheet from '../components/MovePageToPositionSheet';
import NearbyPageReorderSheet from '../components/NearbyPageReorderSheet';
import {
  DOCUMENT_PAGE_CARD_GAP,
  DOCUMENT_PAGE_CARD_HEIGHT,
  DOCUMENT_PAGE_ITEM_EXTENT,
} from '../constants/documentComposerLayout';
import { NEARBY_PAGE_ORDER_TOAST_ID } from '../constants/documentComposerFeedback';
import DocumentComposerService from '../services/DocumentComposerService';
import { pickPdfDocument } from '../services/documentPickerService';
import { scanDocuments } from '../services/scannerService';
import { useDocumentComposerStore } from '../state/useDocumentComposerStore';
import type {
  ComposerArtifact,
  ComposerDestination,
  ComposerPage,
} from '../types/documentComposer.types';

type Props = StaticScreenProps<{
  mode: 'tool' | 'contract';
  source: 'scanner' | 'pdf';
  destination?: ComposerDestination;
  useCurrent?: boolean;
  resumeSessionId?: string;
}>;

type PageOrderRequest = {
  type: 'nearby' | 'move';
  pageId: string;
};

const PageSeparator = () => <View style={styles.pageSeparator} />;

const ComposerReviewScreen = ({ route }: Props) => {
  const navigation = useNavigation<MainAppNavigatorNavigationProp>();
  const { theme } = useUnistyles();
  const started = useRef(false);
  const listRef = useRef<FlatList<ComposerPage>>(null);
  const nearbyOrderSheetRef = useRef<BottomSheetModal>(null);
  const moveToPositionSheetRef = useRef<BottomSheetModal>(null);
  const [pageOrderRequest, setPageOrderRequest] = useState<PageOrderRequest>();
  const session = useDocumentComposerStore(state => state.session);
  const createSession = useDocumentComposerStore(state => state.createSession);
  const setSourcePdf = useDocumentComposerStore(state => state.setSourcePdf);
  const addScannedPaths = useDocumentComposerStore(
    state => state.addScannedPaths,
  );
  const replaceWithScannedPaths = useDocumentComposerStore(
    state => state.replaceWithScannedPaths,
  );
  const applyNearbyPageOrder = useDocumentComposerStore(
    state => state.applyNearbyPageOrder,
  );
  const moveToPosition = useDocumentComposerStore(
    state => state.moveToPosition,
  );
  const deletePage = useDocumentComposerStore(state => state.deletePage);
  const setName = useDocumentComposerStore(state => state.setName);
  const updateProcess = useDocumentComposerStore(state => state.updateProcess);
  const saveDraft = useDocumentComposerStore(state => state.saveDraft);
  const loadDraft = useDocumentComposerStore(state => state.loadDraft);
  const clearSession = useDocumentComposerStore(state => state.clearSession);

  const dismissNearbyOrderUndo = useCallback(() => {
    toast.dismiss(NEARBY_PAGE_ORDER_TOAST_ID);
  }, []);

  useEffect(() => {
    dismissNearbyOrderUndo();
    return dismissNearbyOrderUndo;
  }, [dismissNearbyOrderUndo]);

  const openNearbyOrder = useCallback((pageId: string) => {
    setPageOrderRequest({ pageId, type: 'nearby' });
  }, []);

  const openMoveToPosition = useCallback((pageId: string) => {
    setPageOrderRequest({ pageId, type: 'move' });
  }, []);

  const choosePdf = useCallback(async () => {
    const selected = await pickPdfDocument();
    if (selected.status === 'cancel') return false;
    updateProcess({ status: 'transferring', uploadProgress: 0 });
    const artifact = await DocumentComposerService.registerPdf({
      uri: selected.uri,
      fileName: selected.fileName,
      idempotencyKey: `source-${Date.now()}-${selected.fileName}`,
      onProgress: progress => updateProcess({ uploadProgress: progress }),
    });
    setSourcePdf({
      uri: selected.uri,
      fileName: selected.fileName,
      artifact,
    });
    updateProcess({ status: 'reviewing', uploadProgress: 0 });
    return true;
  }, [setSourcePdf, updateProcess]);

  const loadCurrentPdf = useCallback(async () => {
    const destination = route.params.destination;
    if (!destination) return false;
    updateProcess({ status: 'processing' });
    const source = await ContractsService.getEditSource(
      destination.contractId,
      destination.levelCode,
    );
    const localPath = await DocumentComposerService.downloadContractPdf({
      contractId: destination.contractId,
      levelCode: destination.levelCode,
      name: source.artifact.name,
    });
    const now = new Date().toISOString();
    const artifact: ComposerArtifact = {
      id: source.artifact.id,
      name: source.artifact.name,
      pageCount: source.artifact.pageCount,
      sizeBytes: source.artifact.sizeBytes,
      downloadUrl: source.artifact.downloadUrl,
      status: source.artifact.status || 'TEMPORARY',
      type: source.artifact.type || 'ORIGINAL_PDF',
      mimeType: source.artifact.mimeType || 'application/pdf',
      createdAt: source.artifact.createdAt || now,
      expiresAt: source.artifact.expiresAt || null,
    };
    setSourcePdf({
      uri: asFileUri(localPath),
      fileName: source.artifact.name,
      artifact,
    });
    updateProcess({ status: 'reviewing' });
    return true;
  }, [route.params.destination, setSourcePdf, updateProcess]);

  const startScanner = useCallback(
    async (append: boolean) => {
      const result = await scanDocuments();
      if (result.status === 'cancel') return false;
      if (append) await addScannedPaths(result.paths);
      else await replaceWithScannedPaths(result.paths);
      return true;
    },
    [addScannedPaths, replaceWithScannedPaths],
  );

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const initialize = async () => {
      if (route.params.resumeSessionId) {
        loadDraft(route.params.resumeSessionId);
        return;
      }
      createSession({
        mode: route.params.mode,
        source: route.params.source,
        destination: route.params.destination,
        isEditingExisting: route.params.useCurrent,
      });
      try {
        const completed =
          route.params.source === 'scanner'
            ? await startScanner(true)
            : route.params.useCurrent
            ? await loadCurrentPdf()
            : await choosePdf();
        if (!completed) {
          clearSession();
          navigation.goBack();
        }
      } catch (error) {
        updateProcess({
          status: 'transferError',
          errorMessage:
            error instanceof Error
              ? error.message
              : 'No se pudo preparar el documento.',
        });
      }
    };
    void initialize();
  }, [
    choosePdf,
    clearSession,
    createSession,
    loadCurrentPdf,
    loadDraft,
    navigation,
    route.params,
    startScanner,
    updateProcess,
  ]);

  const confirmDelete = useCallback(
    (pageId: string) => {
      const page = useDocumentComposerStore
        .getState()
        .session?.pages.find(item => item.id === pageId);
      Alert.alert(
        'Eliminar página',
        `¿Quieres eliminar la página ${
          page?.order || ''
        }? El resto se renumerará.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: () => void deletePage(pageId),
          },
        ],
      );
    },
    [deletePage],
  );

  const viewPage = useCallback(
    (pageId: string) => {
      dismissNearbyOrderUndo();
      navigation.navigate('PagePreview', { pageId });
    },
    [dismissNearbyOrderUndo, navigation],
  );

  useEffect(() => {
    if (!pageOrderRequest) return;
    const sheetRef =
      pageOrderRequest.type === 'nearby'
        ? nearbyOrderSheetRef
        : moveToPositionSheetRef;
    sheetRef.current?.present();
  }, [pageOrderRequest]);

  const handleNearbyOrderDismiss = useCallback(() => {
    setPageOrderRequest(current =>
      current?.type === 'nearby' ? undefined : current
    );
  }, []);

  const handleMoveToPositionDismiss = useCallback(() => {
    setPageOrderRequest(current =>
      current?.type === 'move' ? undefined : current
    );
  }, []);

  const repeatAll = () => {
    Alert.alert(
      'Repetir todo el escaneo',
      'Se descartarán las páginas actuales después de completar el nuevo escaneo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Repetir todo',
          style: 'destructive',
          onPress: () => void startScanner(false),
        },
      ],
    );
  };

  const renderPage: ListRenderItem<ComposerPage> = useCallback(
    ({ item }) => (
      <DocumentPageListItem
        page={item}
        artifactId={session?.sourceArtifact?.id}
        onView={viewPage}
        onDelete={confirmDelete}
        onMoveToPosition={openMoveToPosition}
        onReorderNearby={openNearbyOrder}
      />
    ),
    [
      confirmDelete,
      openMoveToPosition,
      openNearbyOrder,
      session?.sourceArtifact?.id,
      viewPage,
    ],
  );

  const handleMoveToPosition = useCallback(
    (pageId: string, targetPosition: number) => {
      moveToPosition(pageId, targetPosition);
      requestAnimationFrame(() => {
        listRef.current?.scrollToIndex({
          index: targetPosition - 1,
          animated: true,
          viewPosition: 0.5,
        });
      });
    },
    [moveToPosition],
  );

  if (!session) return <AppFlex flex={1} style={styles.screen} />;
  const busy =
    session.status === 'transferring' || session.status === 'processing';
  const orderPage = pageOrderRequest
    ? session.pages.find(page => page.id === pageOrderRequest.pageId)
    : undefined;
  return (
    <AppFlex flex={1} style={styles.screen}>
      <AppHeader
        showBack
        eyebrow={
          session.mode === 'contract'
            ? session.destination?.contractLabel
            : 'Herramientas'
        }
        title="Revisar páginas"
        count={session.pages.length}
      />
      <AppFlex p="md" gap="sm" style={styles.summary}>
        <TextInput
          value={session.name}
          onChangeText={setName}
          editable={!busy}
          placeholder="Nombre del PDF"
          placeholderTextColor={theme.colors.text.details}
          style={styles.nameInput}
        />
        <AppFlex direction="row" justify="space-between" gap="sm">
          <AppText variant="text.xs.regular" color="details">
            Orden final
          </AppText>
          <AppText variant="text.xs.bold" color="body" numberOfLines={1}>
            {session.pages.length > 0
              ? `${session.pages.length} ${
                  session.pages.length === 1 ? 'página' : 'páginas'
                } · Orden personalizado`
              : 'Sin páginas'}
          </AppText>
        </AppFlex>
      </AppFlex>

      {session.status === 'transferError' ? (
        <AppFlex p="md" gap="sm" style={styles.error}>
          <AppText variant="text.sm.bold" color="error">
            {session.errorMessage || 'No se pudo preparar el documento.'}
          </AppText>
          <AppButton
            text="Intentar nuevamente"
            variant="ghost"
            size="sm"
            align="left"
            onPress={() =>
              void (route.params.source === 'scanner'
                ? startScanner(true)
                : choosePdf())
            }
          />
        </AppFlex>
      ) : null}

      <FlatList
        ref={listRef}
        data={session.pages}
        keyExtractor={page => page.id}
        renderItem={renderPage}
        getItemLayout={(_data, index) => ({
          length: DOCUMENT_PAGE_CARD_HEIGHT,
          offset: theme.spacing.md + DOCUMENT_PAGE_ITEM_EXTENT * index,
          index,
        })}
        ItemSeparatorComponent={PageSeparator}
        initialNumToRender={6}
        maxToRenderPerBatch={5}
        windowSize={5}
        updateCellsBatchingPeriod={50}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />

      <AppFlex p="md" gap="sm" style={styles.actions}>
        <AppFlex direction="row" gap="sm">
          <Pressable
            onPress={() => void startScanner(true)}
            style={styles.secondaryButton}
          >
            <AppIcon
              name="plus"
              size={19}
              mColor={theme.colors.navigation.active}
            />
            <AppText variant="text.sm.bold" color="link">
              Agregar páginas
            </AppText>
          </Pressable>
          <Pressable onPress={repeatAll} style={styles.secondaryButton}>
            <AppIcon
              name="arrowClockwise"
              size={19}
              mColor={theme.colors.icon.secondary}
            />
            <AppText variant="text.sm.bold" color="body">
              Repetir todo
            </AppText>
          </Pressable>
        </AppFlex>
        <AppFlex direction="row" gap="sm">
          <AppButton
            text="Guardar borrador"
            variant="ghost"
            align="left"
            style={styles.draftButton}
            disabled={session.pages.length === 0}
            onPress={() => {
              dismissNearbyOrderUndo();
              saveDraft();
              toast.success('Borrador guardado');
              navigation.goBack();
            }}
          />
          <AppButton
            text={session.mode === 'contract' ? 'Continuar' : 'Generar PDF'}
            leftIcon="none"
            style={styles.generateButton}
            disabled={
              session.pages.length === 0 || session.name.trim().length === 0
            }
            onPress={() => {
              dismissNearbyOrderUndo();
              navigation.navigate('ComposerProcess');
            }}
          />
        </AppFlex>
      </AppFlex>

      {session.pages[0] ? (
        <>
          <NearbyPageReorderSheet
            ref={nearbyOrderSheetRef}
            page={orderPage ?? session.pages[0]}
            pages={session.pages}
            artifactId={session.sourceArtifact?.id}
            isActive={pageOrderRequest?.type === 'nearby'}
            onApplyOrder={applyNearbyPageOrder}
            onDismiss={handleNearbyOrderDismiss}
          />
          <MovePageToPositionSheet
            ref={moveToPositionSheetRef}
            page={orderPage ?? session.pages[0]}
            pages={session.pages}
            isActive={pageOrderRequest?.type === 'move'}
            onMove={handleMoveToPosition}
            onDismiss={handleMoveToPositionDismiss}
          />
        </>
      ) : null}
    </AppFlex>
  );
};

const styles = StyleSheet.create(theme => ({
  screen: { backgroundColor: theme.colors.surface.background.primary },
  summary: {
    backgroundColor: theme.colors.surface.background.cards,
    borderBottomWidth: theme.border.hairline,
    borderBottomColor: theme.colors.border.subtle,
  },
  nameInput: {
    minHeight: theme.control.height.default,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: theme.border.hairline,
    borderColor: theme.colors.border.default,
    color: theme.colors.text.headings,
    backgroundColor: theme.colors.surface.background.primary,
    ...theme.typography.text.md.bold,
  },
  error: {
    backgroundColor: theme.colors.surface.status.error,
  },
  list: { flex: 1 },
  listContent: { padding: theme.spacing.md, paddingBottom: theme.spacing.xl },
  pageSeparator: { height: DOCUMENT_PAGE_CARD_GAP },
  actions: {
    backgroundColor: theme.colors.surface.background.cards,
    borderTopWidth: theme.border.hairline,
    borderTopColor: theme.colors.border.subtle,
  },
  secondaryButton: {
    minHeight: 42,
    flex: 1,
    paddingHorizontal: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface.background.elements,
  },
  draftButton: { flex: 1 },
  generateButton: { flex: 1.2 },
}));

export default ComposerReviewScreen;
