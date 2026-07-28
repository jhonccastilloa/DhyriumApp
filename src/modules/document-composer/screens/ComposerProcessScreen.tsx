import { useCallback, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { AxiosError } from 'axios';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { AppButton } from '@/components/buttons/AppButton';
import AppHeader from '@/components/navigation/AppHeader';
import AppIcon from '@/components/icons/AppIcon';
import AppProgressBar from '@/components/feedback/AppProgressBar';
import AppFlex from '@/components/layout/AppFlex';
import AppText from '@/components/typography/AppText';
import type { IconName } from '@/components/icons/iconRegistry';
import type { MainAppNavigatorNavigationProp } from '@/app/navigation/MainAppNavigator';
import ContractsService from '@/modules/contracts/services/ContractsService';
import DocumentComposerService from '../services/DocumentComposerService';
import { useDocumentComposerStore } from '../state/useDocumentComposerStore';

const ComposerProcessScreen = () => {
  const navigation = useNavigation<MainAppNavigatorNavigationProp>();
  const { theme } = useUnistyles();
  const started = useRef(false);
  const session = useDocumentComposerStore(state => state.session);
  const updateProcess = useDocumentComposerStore(state => state.updateProcess);

  const run = useCallback(async () => {
    const current = useDocumentComposerStore.getState().session;
    if (!current) return;
    try {
      let artifact = current.artifact;
      const canUseOriginalDirectly =
        current.mode === 'contract' &&
        !current.isEditingExisting &&
        current.pages.every(
          (page, index) =>
            page.origin === 'originalPdf' &&
            page.originalPageNumber === index + 1
        );

      if (!artifact) {
        if (canUseOriginalDirectly && current.sourceArtifact) {
          artifact = current.sourceArtifact;
        } else {
          updateProcess({
            status: 'transferring',
            uploadProgress: 0,
            errorCode: undefined,
            errorMessage: undefined,
          });
          artifact = await DocumentComposerService.compose(
            current,
            progress =>
              updateProcess({
                uploadProgress: progress,
                status: progress >= 100 ? 'processing' : 'transferring',
              })
          );
        }
        updateProcess({ artifact, status: 'generated', uploadProgress: 100 });
      }

      if (current.mode === 'contract' && current.destination) {
        updateProcess({ status: 'associating', artifact });
        if (current.destination.currentVersionId) {
          await ContractsService.replaceArtifact({
            contractId: current.destination.contractId,
            levelCode: current.destination.levelCode,
            artifactId: artifact.id,
            expectedCurrentVersionId:
              current.destination.currentVersionId,
          });
        } else {
          await ContractsService.attachArtifact(
            current.destination.contractId,
            current.destination.levelCode,
            artifact.id
          );
        }
        updateProcess({ status: 'uploaded', artifact });
      }
      navigation.replace('ComposerResult');
    } catch (error) {
      const latest = useDocumentComposerStore.getState().session;
      const response = (error as AxiosError<{
        code?: string;
        message?: string;
      }>).response?.data;
      const associationFailed =
        latest?.artifact !== undefined &&
        latest.mode === 'contract';
      updateProcess({
        status: associationFailed ? 'associationError' : 'generationError',
        errorCode: response?.code,
        errorMessage:
          response?.message ||
          (error instanceof Error
            ? error.message
            : 'No se pudo completar el proceso.'),
      });
    }
  }, [navigation, updateProcess]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void run();
  }, [run]);

  if (!session) return <AppFlex flex={1} style={styles.screen} />;
  const failed =
    session.status === 'generationError' ||
    session.status === 'associationError';

  const stages: {
    key: string;
    label: string;
    complete: boolean;
    active: boolean;
    icon: IconName;
  }[] = [
    {
      key: 'transfer',
      label: 'Transferir archivos',
      complete: !['transferring', 'generationError'].includes(session.status),
      active: session.status === 'transferring',
      icon: 'cloudArrowUp',
    },
    {
      key: 'generate',
      label: 'Generar y validar PDF',
      complete: Boolean(session.artifact),
      active: session.status === 'processing',
      icon: 'filePdf',
    },
    ...(session.mode === 'contract'
      ? [
          {
            key: 'associate',
            label: 'Asociar al contrato',
            complete: session.status === 'uploaded',
            active: session.status === 'associating',
            icon: 'linkSimple' as IconName,
          },
        ]
      : []),
  ];

  return (
    <AppFlex flex={1} style={styles.screen}>
      <AppHeader
        title="Preparando documento"
        eyebrow={session.name}
        showBack={failed}
      />
      <AppFlex flex={1} p="lg" justify="center" gap="xl">
        <AppFlex align="center" gap="md">
          {failed ? (
            <AppIcon
              name="warningCircle"
              size={58}
              mColor={theme.colors.text.error}
            />
          ) : (
            <AppIcon
              name="circleNotch"
              size={58}
              mColor={theme.colors.navigation.active}
            />
          )}
          <AppText variant="title.xl" color={failed ? 'error' : 'headings'} align="center">
            {failed
              ? session.status === 'associationError'
                ? 'El PDF está listo, falta asociarlo'
                : 'No pudimos generar el PDF'
              : 'Estamos procesando tus páginas'}
          </AppText>
          <AppText variant="text.sm.regular" color="details" align="center">
            {failed
              ? session.errorMessage
              : 'Puedes distinguir la transferencia del procesamiento del servidor.'}
          </AppText>
        </AppFlex>

        {session.status === 'transferring' ? (
          <AppFlex p="md" gap="sm" style={styles.progress}>
            <AppFlex direction="row" justify="space-between">
              <AppText variant="text.sm.bold" color="body">
                Subida
              </AppText>
              <AppText variant="text.sm.bold" color="link">
                {session.uploadProgress}%
              </AppText>
            </AppFlex>
            <AppProgressBar value={session.uploadProgress} />
          </AppFlex>
        ) : null}

        <AppFlex p="md" gap="sm" style={styles.stages}>
          {stages.map(stage => {
            return (
              <AppFlex
                key={stage.key}
                direction="row"
                align="center"
                gap="md"
                style={styles.stage}
              >
                <AppFlex width={30} align="center">
                  {stage.complete ? (
                    <AppIcon
                      name="checkCircle"
                      size={24}
                      mColor={theme.colors.text.success}
                      variant="active"
                    />
                  ) : (
                    <AppIcon
                      name={stage.icon}
                      size={24}
                      mColor={
                        stage.active
                          ? theme.colors.navigation.active
                          : theme.colors.icon.disabled
                      }
                    />
                  )}
                </AppFlex>
                <AppText
                  variant="text.md.bold"
                  color={stage.complete || stage.active ? 'body' : 'details'}
                >
                  {stage.label}
                </AppText>
              </AppFlex>
            );
          })}
        </AppFlex>

        {failed ? (
          <AppButton
            text={
              session.status === 'associationError'
                ? 'Reintentar asociación'
                : 'Intentar nuevamente'
            }
            onPress={() => {
              started.current = true;
              void run();
            }}
          />
        ) : null}
      </AppFlex>
    </AppFlex>
  );
};

const styles = StyleSheet.create(theme => ({
  screen: { backgroundColor: theme.colors.surface.background.primary },
  progress: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface.background.cards,
  },
  stages: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface.background.cards,
    borderWidth: theme.border.hairline,
    borderColor: theme.colors.border.subtle,
  },
  stage: { minHeight: 48 },
}));

export default ComposerProcessScreen;
