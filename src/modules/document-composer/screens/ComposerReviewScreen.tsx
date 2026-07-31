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
import {
  useNavigation,
  usePreventRemove,
} from '@react-navigation/native';
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
import ComposerSourceSheet from '../components/ComposerSourceSheet';
import DocumentPageListItem from '../components/DocumentPageListItem';
import MovePageToPositionSheet from '../components/MovePageToPositionSheet';
import {
  DOCUMENT_PAGE_CARD_GAP,
  DOCUMENT_PAGE_CARD_HEIGHT,
  DOCUMENT_PAGE_ITEM_EXTENT,
} from '../constants/documentComposerLayout';
import {
  getPageArtifactId,
  hasUnsavedComposerChanges,
} from '../domain/composerSources';
import DocumentComposerService from '../services/DocumentComposerService';
import {
  pickPdfDocument,
  removePickedPdfCopy,
} from '../services/documentPickerService';
import { scanDocuments } from '../services/scannerService';
import { useDocumentComposerStore } from '../state/useDocumentComposerStore';
import type {
  ComposerArtifact,
  ComposerDestination,
  ComposerEntrySource,
  ComposerPage,
} from '../types/documentComposer.types';

type Props = StaticScreenProps<{
  mode: 'tool' | 'contract';
  source: ComposerEntrySource;
  destination?: ComposerDestination;
  useCurrent?: boolean;
  resumeSessionId?: string;
}>;

type SourceActionMode = 'append' | 'replace';
type SourceKind = 'scanner' | 'pdf' | 'current';
type SourceResult = 'success' | 'cancel' | 'error';

const PageSeparator = () => <View style={styles.pageSeparator} />;

const ComposerReviewScreen = ({ route }: Props) => {
  const navigation = useNavigation<MainAppNavigatorNavigationProp>();
  const { theme } = useUnistyles();
  const started = useRef(false);
  const listRef = useRef<FlatList<ComposerPage>>(null);
  const moveToPositionSheetRef = useRef<BottomSheetModal>(null);
  const sourceSheetRef = useRef<BottomSheetModal>(null);
  const pendingExitAction = useRef<
    Parameters<typeof navigation.dispatch>[0] | null
  >(null);
  const [movePageId, setMovePageId] = useState<string>();
  const [sourceActionMode, setSourceActionMode] =
    useState<SourceActionMode>('append');
  const [lastSourceAction, setLastSourceAction] = useState<{
    kind: SourceKind;
    mode: SourceActionMode;
  }>();
  const [exitApproved, setExitApproved] = useState(false);
  const session = useDocumentComposerStore(state => state.session);
  const createSession = useDocumentComposerStore(state => state.createSession);
  const appendPdfSource = useDocumentComposerStore(
    state => state.appendPdfSource,
  );
  const replaceWithPdfSource = useDocumentComposerStore(
    state => state.replaceWithPdfSource,
  );
  const refreshPdfSourceArtifact = useDocumentComposerStore(
    state => state.refreshPdfSourceArtifact,
  );
  const addScannedPaths = useDocumentComposerStore(
    state => state.addScannedPaths,
  );
  const replaceWithScannedPaths = useDocumentComposerStore(
    state => state.replaceWithScannedPaths,
  );
  const moveToPosition = useDocumentComposerStore(
    state => state.moveToPosition,
  );
  const deletePage = useDocumentComposerStore(state => state.deletePage);
  const setName = useDocumentComposerStore(state => state.setName);
  const updateProcess = useDocumentComposerStore(state => state.updateProcess);
  const saveDraft = useDocumentComposerStore(state => state.saveDraft);
  const loadDraft = useDocumentComposerStore(state => state.loadDraft);
  const discardSession = useDocumentComposerStore(
    state => state.discardSession,
  );
  const hasUnsavedChanges = hasUnsavedComposerChanges(session);

  const openNearbyOrder = useCallback(
    (pageId: string) => {
      navigation.navigate('NearbyPageReorder', { pageId });
    },
    [navigation],
  );

  const openMoveToPosition = useCallback((pageId: string) => {
    setMovePageId(pageId);
  }, []);

  const markSourceError = useCallback(
    (error: unknown) => {
      updateProcess({
        status: 'transferError',
        uploadProgress: 0,
        errorMessage:
          error instanceof Error
            ? error.message
            : 'No se pudo preparar el contenido.',
      });
    },
    [updateProcess],
  );

  const choosePdf = useCallback(
    async (mode: SourceActionMode): Promise<SourceResult> => {
      const selected = await pickPdfDocument();
      if (selected.status === 'cancel') return 'cancel';
      let registeredArtifact: ComposerArtifact | undefined;

      try {
        updateProcess({ status: 'transferring', uploadProgress: 0 });
        const artifact = await DocumentComposerService.registerPdf({
          uri: selected.uri,
          fileName: selected.fileName,
          idempotencyKey: `source-${Date.now()}-${selected.fileName}`,
          onProgress: progress => updateProcess({ uploadProgress: progress }),
        });
        registeredArtifact = artifact;
        const input = {
          uri: selected.uri,
          fileName: selected.fileName,
          artifact,
        };
        if (mode === 'replace') await replaceWithPdfSource(input);
        else await appendPdfSource(input);
        updateProcess({ status: 'reviewing', uploadProgress: 0 });
        return 'success';
      } catch (error) {
        if (registeredArtifact) {
          await DocumentComposerService.cleanupTemporaryArtifacts([
            registeredArtifact,
          ]);
        }
        await removePickedPdfCopy(selected.uri);
        markSourceError(error);
        return 'error';
      }
    },
    [
      appendPdfSource,
      markSourceError,
      replaceWithPdfSource,
      updateProcess,
    ],
  );

  const loadCurrentPdf = useCallback(async (): Promise<SourceResult> => {
    const destination = route.params.destination;
    if (!destination) return 'error';
    try {
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
      await replaceWithPdfSource({
        uri: asFileUri(localPath),
        fileName: source.artifact.name,
        artifact,
      });
      updateProcess({ status: 'reviewing' });
      return 'success';
    } catch (error) {
      markSourceError(error);
      return 'error';
    }
  }, [
    markSourceError,
    replaceWithPdfSource,
    route.params.destination,
    updateProcess,
  ]);

  const startScanner = useCallback(
    async (mode: SourceActionMode): Promise<SourceResult> => {
      try {
        const result = await scanDocuments();
        if (result.status === 'cancel') return 'cancel';
        if (mode === 'replace') {
          await replaceWithScannedPaths(result.paths);
        } else {
          await addScannedPaths(result.paths);
        }
        updateProcess({ status: 'reviewing', uploadProgress: 0 });
        return 'success';
      } catch (error) {
        markSourceError(error);
        return 'error';
      }
    },
    [
      addScannedPaths,
      markSourceError,
      replaceWithScannedPaths,
      updateProcess,
    ],
  );

  const runSourceAction = useCallback(
    async (kind: SourceKind, mode: SourceActionMode) => {
      setLastSourceAction({ kind, mode });
      if (kind === 'current') return loadCurrentPdf();
      return kind === 'scanner' ? startScanner(mode) : choosePdf(mode);
    },
    [choosePdf, loadCurrentPdf, startScanner],
  );

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const initialize = async () => {
      if (route.params.resumeSessionId) {
        loadDraft(route.params.resumeSessionId);
        const draft = useDocumentComposerStore.getState().session;
        if (!draft) return;
        try {
          const refreshed =
            await DocumentComposerService.refreshExpiredPdfSources(
              draft,
              progress =>
                updateProcess({
                  status: 'transferring',
                  uploadProgress: progress,
                }),
            );
          refreshed.forEach(({ sourceId, artifact }) =>
            refreshPdfSourceArtifact(sourceId, artifact),
          );
          updateProcess({ status: 'reviewing', uploadProgress: 0 });
        } catch (error) {
          markSourceError(error);
        }
        return;
      }

      createSession({
        mode: route.params.mode,
        source: route.params.source,
        destination: route.params.destination,
        isEditingExisting: route.params.useCurrent,
      });
      const result = route.params.useCurrent
        ? await runSourceAction('current', 'replace')
        : await runSourceAction(route.params.source, 'append');
      if (result === 'cancel') {
        await discardSession();
        navigation.goBack();
      }
    };

    initialize().catch(() => undefined);
  }, [
    createSession,
    discardSession,
    loadCurrentPdf,
    loadDraft,
    markSourceError,
    navigation,
    refreshPdfSourceArtifact,
    route.params,
    runSourceAction,
    updateProcess,
  ]);

  usePreventRemove(
    hasUnsavedChanges && !exitApproved,
    ({ data }) => {
      const current = useDocumentComposerStore.getState().session;
      Alert.alert(
        '¿Guardar antes de salir?',
        'Hay cambios que todavía no están guardados en un borrador.',
        [
          { text: 'Continuar editando', style: 'cancel' },
          {
            text: 'Descartar',
            style: 'destructive',
            onPress: () => {
              (async () => {
                if (current) {
                  const savedDraft =
                    useDocumentComposerStore
                      .getState()
                      .drafts.find(draft => draft.id === current.id);
                  const savedArtifactIds = new Set(
                    savedDraft?.pdfSources.map(
                      source => source.artifact.id,
                    ) ?? [],
                  );
                  await DocumentComposerService.cleanupTemporarySources(
                    current.pdfSources.filter(
                      source =>
                        !savedArtifactIds.has(source.artifact.id),
                    ),
                  );
                }
                await discardSession();
                pendingExitAction.current = data.action;
                setExitApproved(true);
              })().catch(() => undefined);
            },
          },
          {
            text: 'Guardar borrador',
            onPress: () => {
              saveDraft();
              toast.success('Borrador guardado');
              pendingExitAction.current = data.action;
              setExitApproved(true);
            },
          },
        ],
      );
    },
  );

  useEffect(() => {
    if (exitApproved && pendingExitAction.current) {
      navigation.dispatch(pendingExitAction.current);
      pendingExitAction.current = null;
    }
  }, [exitApproved, navigation]);

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
            onPress: () => {
              deletePage(pageId).catch(() => undefined);
            },
          },
        ],
      );
    },
    [deletePage],
  );

  const viewPage = useCallback(
    (pageId: string) => {
      navigation.navigate('PagePreview', { pageId });
    },
    [navigation],
  );

  useEffect(() => {
    if (movePageId) moveToPositionSheetRef.current?.present();
  }, [movePageId]);

  const handleMoveToPositionDismiss = useCallback(() => {
    setMovePageId(undefined);
  }, []);

  const openSourceSheet = useCallback((mode: SourceActionMode) => {
    setSourceActionMode(mode);
    requestAnimationFrame(() => sourceSheetRef.current?.present());
  }, []);

  const confirmReplace = useCallback(() => {
    Alert.alert(
      'Reemplazar todo el contenido',
      'Las páginas actuales se conservarán hasta que completes el nuevo escaneo o selecciones otro PDF.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          style: 'destructive',
          onPress: () => openSourceSheet('replace'),
        },
      ],
    );
  }, [openSourceSheet]);

  const renderPage: ListRenderItem<ComposerPage> = useCallback(
    ({ item }) => (
      <DocumentPageListItem
        page={item}
        artifactId={getPageArtifactId(session, item)}
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
      session,
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

  const saveAndExit = useCallback(() => {
    saveDraft();
    toast.success('Borrador guardado');
    setExitApproved(true);
    requestAnimationFrame(() => navigation.goBack());
  }, [navigation, saveDraft]);

  if (!session) return <AppFlex flex={1} style={styles.screen} />;
  const busy =
    session.status === 'transferring' || session.status === 'processing';
  const orderPage = movePageId
    ? session.pages.find(page => page.id === movePageId)
    : undefined;

  return (
    <AppFlex flex={1} style={styles.screen}>
      <AppHeader
        showBack
        eyebrow={
          session.mode === 'contract'
            ? session.destination?.contractLabel
            : 'Crear y editar PDF'
        }
        title="Editar PDF"
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
            Contenido actual
          </AppText>
          <AppText variant="text.xs.bold" color="body" numberOfLines={1}>
            {session.pages.length > 0
              ? `${session.pages.length} ${
                  session.pages.length === 1 ? 'página' : 'páginas'
                } · ${
                  session.source === 'mixed'
                    ? 'PDF y escaneos'
                    : session.source === 'pdf'
                    ? 'PDF'
                    : 'Escaneo'
                }`
              : 'Sin páginas'}
          </AppText>
        </AppFlex>
      </AppFlex>

      {session.status === 'transferError' ? (
        <AppFlex p="md" gap="sm" style={styles.error}>
          <AppText variant="text.sm.bold" color="error">
            {session.errorMessage || 'No se pudo preparar el contenido.'}
          </AppText>
          <AppButton
            text={
              lastSourceAction
                ? 'Intentar nuevamente'
                : 'Elegir otra fuente'
            }
            variant="ghost"
            size="sm"
            align="left"
            onPress={() => {
              if (lastSourceAction) {
                runSourceAction(
                    lastSourceAction.kind,
                    lastSourceAction.mode,
                  ).catch(() => undefined);
              } else {
                openSourceSheet('append');
              }
            }}
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
            disabled={busy}
            onPress={() => openSourceSheet('append')}
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
            disabled={busy || session.pages.length === 0}
            onPress={confirmReplace}
            style={styles.secondaryButton}
          >
            <AppIcon
              name="arrowClockwise"
              size={19}
              mColor={theme.colors.icon.secondary}
            />
            <AppText variant="text.sm.bold" color="body">
              Reemplazar todo
            </AppText>
          </Pressable>
        </AppFlex>
        <AppFlex direction="row" gap="sm">
          <AppButton
            text="Guardar borrador"
            variant="ghost"
            align="left"
            style={styles.draftButton}
            disabled={session.pages.length === 0 || busy}
            onPress={saveAndExit}
          />
          <AppButton
            text={session.mode === 'contract' ? 'Continuar' : 'Generar PDF'}
            leftIcon="none"
            style={styles.generateButton}
            disabled={
              busy ||
              session.pages.length === 0 ||
              session.name.trim().length === 0
            }
            onPress={() => {
              navigation.navigate('ComposerProcess');
            }}
          />
        </AppFlex>
      </AppFlex>

      {session.pages[0] ? (
        <MovePageToPositionSheet
          ref={moveToPositionSheetRef}
          page={orderPage ?? session.pages[0]}
          pages={session.pages}
          isActive={Boolean(movePageId)}
          onMove={handleMoveToPosition}
          onDismiss={handleMoveToPositionDismiss}
        />
      ) : null}

      <ComposerSourceSheet
        sheetRef={sourceSheetRef}
        mode={sourceActionMode}
        onScan={() => {
          runSourceAction('scanner', sourceActionMode).catch(
            () => undefined,
          );
        }}
        onChoosePdf={() => {
          runSourceAction('pdf', sourceActionMode).catch(
            () => undefined,
          );
        }}
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
