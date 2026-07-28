import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
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
import Animated from 'react-native-reanimated';
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
import ComposerPageOrderSheet from '../components/ComposerPageOrderSheet';
import LocalDraggablePageListItem from '../components/LocalDraggablePageListItem';
import LocalPageDragLayer from '../components/LocalPageDragLayer';
import {
  DOCUMENT_PAGE_CARD_GAP,
  DOCUMENT_PAGE_CARD_HEIGHT,
  DOCUMENT_PAGE_ITEM_EXTENT,
} from '../constants/documentComposerLayout';
import DocumentComposerService from '../services/DocumentComposerService';
import { pickPdfDocument } from '../services/documentPickerService';
import { scanDocuments } from '../services/scannerService';
import { useLocalPageDrag } from '../hooks/useLocalPageDrag';
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

const EMPTY_PAGES: ComposerPage[] = [];
const PageSeparator = () => <View style={styles.pageSeparator} />;

const ComposerReviewScreen = ({ route }: Props) => {
  const navigation = useNavigation<MainAppNavigatorNavigationProp>();
  const { theme } = useUnistyles();
  const started = useRef(false);
  const orderSheetRef = useRef<BottomSheetModal>(null);
  const [orderPageId, setOrderPageId] = useState<string>();
  const session = useDocumentComposerStore(state => state.session);
  const createSession = useDocumentComposerStore(state => state.createSession);
  const setSourcePdf = useDocumentComposerStore(state => state.setSourcePdf);
  const addScannedPaths = useDocumentComposerStore(
    state => state.addScannedPaths
  );
  const replaceWithScannedPaths = useDocumentComposerStore(
    state => state.replaceWithScannedPaths
  );
  const applyLocalPageMove = useDocumentComposerStore(
    state => state.applyLocalPageMove
  );
  const moveToPosition = useDocumentComposerStore(
    state => state.moveToPosition
  );
  const deletePage = useDocumentComposerStore(state => state.deletePage);
  const setName = useDocumentComposerStore(state => state.setName);
  const updateProcess = useDocumentComposerStore(state => state.updateProcess);
  const saveDraft = useDocumentComposerStore(state => state.saveDraft);
  const loadDraft = useDocumentComposerStore(state => state.loadDraft);
  const clearSession = useDocumentComposerStore(state => state.clearSession);

  const requestMoveToPosition = useCallback((pageId: string) => {
    setOrderPageId(pageId);
  }, []);
  const localDrag = useLocalPageDrag({
    pages: session?.pages ?? EMPTY_PAGES,
    contentPadding: theme.spacing.md,
    onCommit: applyLocalPageMove,
    onRequestMoveToPosition: requestMoveToPosition,
  });

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
      destination.levelCode
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
    [addScannedPaths, replaceWithScannedPaths]
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

  const confirmDelete = useCallback((pageId: string) => {
    const page = session?.pages.find(item => item.id === pageId);
    Alert.alert(
      'Eliminar página',
      `¿Quieres eliminar la página ${page?.order || ''}? El resto se renumerará.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => void deletePage(pageId),
        },
      ]
    );
  }, [deletePage, session?.pages]);

  const viewPage = useCallback(
    (pageId: string) => navigation.navigate('PagePreview', { pageId }),
    [navigation]
  );

  useEffect(() => {
    if (orderPageId) orderSheetRef.current?.present();
  }, [orderPageId]);

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
      ]
    );
  };

  const renderPage: ListRenderItem<ComposerPage> = useCallback(
    ({ item, index }) => {
      const activeDrag = localDrag.dragSession;
      const isPlaceholder = activeDrag?.pageId === item.id;
      return (
        <LocalDraggablePageListItem
          page={item}
          pageIndex={index}
          pageCount={session?.pages.length ?? 0}
          artifactId={session?.sourceArtifact?.id}
          isPlaceholder={isPlaceholder}
          isHighlighted={localDrag.highlightedPageId === item.id}
          activeOriginalIndex={activeDrag?.originalIndex}
          placeholderPosition={
            isPlaceholder ? activeDrag.draftIndex + 1 : undefined
          }
          dragContext={localDrag.dragContext}
          onView={viewPage}
          onDelete={confirmDelete}
        />
      );
    },
    [
      confirmDelete,
      localDrag.dragContext,
      localDrag.dragSession,
      localDrag.highlightedPageId,
      session?.pages.length,
      session?.sourceArtifact?.id,
      viewPage,
    ]
  );

  const handleMoveToPosition = useCallback(
    (pageId: string, targetPosition: number) => {
      moveToPosition(pageId, targetPosition);
      requestAnimationFrame(() => {
        localDrag.listRef.current?.scrollToIndex({
          index: targetPosition - 1,
          animated: true,
          viewPosition: 0.5,
        });
      });
    },
    [localDrag.listRef, moveToPosition]
  );

  if (!session) return <AppFlex flex={1} style={styles.screen} />;
  const busy =
    session.status === 'transferring' || session.status === 'processing';
  const orderPage = orderPageId
    ? session.pages.find(page => page.id === orderPageId)
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

      <Animated.View
        ref={localDrag.dragContext.listViewportRef}
        collapsable={false}
        onLayout={localDrag.onListLayout}
        style={styles.listViewport}
      >
        <FlatList
          ref={localDrag.listRef}
          data={session.pages}
          extraData={
            localDrag.dragSession ?? localDrag.highlightedPageId
          }
          keyExtractor={page => page.id}
          renderItem={renderPage}
          getItemLayout={(_data, index) => ({
            length: DOCUMENT_PAGE_CARD_HEIGHT,
            offset:
              theme.spacing.md + DOCUMENT_PAGE_ITEM_EXTENT * index,
            index,
          })}
          ItemSeparatorComponent={PageSeparator}
          initialNumToRender={6}
          maxToRenderPerBatch={5}
          windowSize={5}
          updateCellsBatchingPeriod={50}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          scrollEnabled={!localDrag.dragSession}
          scrollEventThrottle={32}
          onScroll={localDrag.onListScroll}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      </Animated.View>

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
          <Pressable
            onPress={repeatAll}
            style={styles.secondaryButton}
          >
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
            onPress={() => navigation.navigate('ComposerProcess')}
          />
        </AppFlex>
      </AppFlex>

      {orderPage ? (
        <ComposerPageOrderSheet
          ref={orderSheetRef}
          page={orderPage}
          pageCount={session.pages.length}
          onMoveToPosition={handleMoveToPosition}
          onDismiss={() => setOrderPageId(undefined)}
        />
      ) : null}
      <LocalPageDragLayer
        context={localDrag.dragContext}
        session={localDrag.dragSession}
      />
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
  listViewport: { flex: 1 },
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
