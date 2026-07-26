import { useState } from 'react';
import { View } from 'react-native';
import Share from 'react-native-share';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { toast } from 'sonner-native';
import { AppButton } from '@/components/buttons/AppButton';
import AppHeader from '@/components/navigation/AppHeader';
import AppIcon from '@/components/icons/AppIcon';
import AppText from '@/components/typography/AppText';
import type { MainAppNavigatorParamList } from '@/app/navigation/MainAppNavigator';
import DocumentComposerService from '../services/DocumentComposerService';
import { useDocumentComposerStore } from '../state/useDocumentComposerStore';

type Props = NativeStackScreenProps<
  MainAppNavigatorParamList,
  'ComposerResult'
>;

const formatBytes = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.ceil(bytes / 1024)} KB`;

const ComposerResultScreen = ({ navigation }: Props) => {
  const { theme } = useUnistyles();
  const [sharing, setSharing] = useState(false);
  const session = useDocumentComposerStore(state => state.session);
  const clearSession = useDocumentComposerStore(state => state.clearSession);
  const artifact = session?.artifact;

  if (!session || !artifact) return <View style={styles.screen} />;

  const sharePdf = async () => {
    setSharing(true);
    try {
      const path = await DocumentComposerService.downloadArtifact(artifact);
      await Share.open({
        url: `file://${path}`,
        type: 'application/pdf',
        filename: artifact.name,
        failOnCancel: false,
      });
    } finally {
      setSharing(false);
    }
  };

  const finish = () => {
    const destination = session.destination;
    clearSession();
    if (destination) {
      navigation.navigate('MainTabs', {
        screen: 'Inicio',
        params: {
          screen: 'ContractDetail',
          params: { contractId: destination.contractId },
        },
      });
    } else {
      navigation.navigate('MainTabs', { screen: 'Herramientas' });
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader title="Documento listo" eyebrow="Resultado" />
      <View style={styles.content}>
        <View style={styles.hero}>
          <AppIcon
            name="checkCircle"
            size={66}
            mColor={theme.colors.text.success}
            variant="featured"
          />
          <AppText variant="title.xl" color="headings" align="center">
            {session.mode === 'contract'
              ? 'PDF publicado correctamente'
              : 'Tu PDF está listo'}
          </AppText>
          <AppText variant="text.sm.regular" color="details" align="center">
            {session.mode === 'contract'
              ? `${session.destination?.levelCode} · ${session.destination?.levelName}`
              : 'Puedes verlo, guardarlo o compartirlo desde tu dispositivo.'}
          </AppText>
        </View>

        <View style={styles.fileCard}>
          <View style={styles.fileIcon}>
            <AppIcon
              name="filePdf"
              size={30}
              mColor={theme.colors.navigation.active}
              variant="featured"
            />
          </View>
          <View style={styles.fileCopy}>
            <AppText variant="text.md.bold" color="headings" numberOfLines={2}>
              {artifact.name}
            </AppText>
            <AppText variant="text.sm.regular" color="details">
              {artifact.pageCount} páginas · {formatBytes(artifact.sizeBytes)}
            </AppText>
          </View>
        </View>

        <AppButton
          text="Ver PDF"
          variant="ghost"
          onPress={() =>
            navigation.navigate('GeneratedPdfViewer', { artifact })
          }
        />
        <AppButton
          text="Guardar o compartir"
          leftIcon="none"
          isLoading={sharing}
          onPress={() =>
            void sharePdf().catch(() =>
              toast.error('No se pudo compartir el PDF.')
            )
          }
        >
          <View style={styles.shareContent}>
            <AppIcon
              name="shareNetwork"
              size={20}
              mColor={theme.colors.text.button}
            />
            <AppText variant="button" color="button">
              Guardar o compartir
            </AppText>
          </View>
        </AppButton>
        <AppButton
          text={
            session.mode === 'contract'
              ? 'Volver al contrato'
              : 'Crear otro PDF'
          }
          variant="link"
          onPress={finish}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create(theme => ({
  screen: { flex: 1, backgroundColor: theme.colors.surface.background.primary },
  content: { flex: 1, padding: theme.spacing.lg, justifyContent: 'center', gap: theme.spacing.md },
  hero: { alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.md },
  fileCard: {
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface.background.cards,
    borderWidth: theme.border.hairline,
    borderColor: theme.colors.border.subtle,
  },
  fileIcon: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.navigation.rail,
  },
  fileCopy: { flex: 1, gap: theme.spacing.xs },
  shareContent: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
}));

export default ComposerResultScreen;
