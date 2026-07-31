import { useEffect } from 'react';
import { Pressable, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from '@/components/navigation/AppHeader';
import AppCard from '@/components/layout/AppCard';
import AppFlex from '@/components/layout/AppFlex';
import AppIcon from '@/components/icons/AppIcon';
import AppText from '@/components/typography/AppText';
import type { MainAppNavigatorNavigationProp } from '@/app/navigation/MainAppNavigator';
import { useDocumentComposerStore } from '@/modules/document-composer/state/useDocumentComposerStore';

const ToolsScreen = () => {
  const navigation = useNavigation<MainAppNavigatorNavigationProp>();
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();
  const drafts = useDocumentComposerStore(state => state.drafts);
  const pruneMissingDrafts = useDocumentComposerStore(
    state => state.pruneMissingDrafts
  );

  useEffect(() => {
    pruneMissingDrafts().catch(() => undefined);
  }, [pruneMissingDrafts]);

  const openComposer = (source: 'scanner' | 'pdf') =>
    navigation.navigate('ComposerReview', { mode: 'tool', source });

  return (
    <AppFlex flex={1} style={styles.screen}>
      <AppHeader title="Herramientas" eyebrow="Documentos" />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        <AppFlex gap="xs" style={styles.intro}>
          <AppText variant="title.l" color="headings">
            Crea y organiza archivos PDF
          </AppText>
          <AppText variant="text.sm.regular" color="details">
            Flujos reutilizables, sin asociarlos a un contrato.
          </AppText>
        </AppFlex>
        <AppCard emphasized style={styles.composerCard}>
          <AppFlex gap="xs">
            <AppText variant="title.m" color="headings">
              Crear y editar PDF
            </AppText>
            <AppText variant="text.sm.regular" color="details">
              Combina escaneos y archivos PDF en un solo documento.
            </AppText>
          </AppFlex>
          <AppFlex gap="sm">
            <Pressable
              onPress={() => openComposer('scanner')}
              style={({ pressed }) => [
                styles.sourceAction,
                pressed && styles.pressed,
              ]}
            >
              <AppFlex
                size={46}
                align="center"
                justify="center"
                style={styles.iconSurface}
              >
                <AppIcon
                  name="scan"
                  size={25}
                  mColor={theme.colors.navigation.active}
                />
              </AppFlex>
              <AppFlex flex={1} gap="xs">
                <AppText variant="text.md.bold" color="headings">
                  Escanear páginas
                </AppText>
                <AppText variant="text.sm.regular" color="details">
                  Empieza capturando un documento con la cámara.
                </AppText>
              </AppFlex>
              <AppIcon
                name="caretRight"
                size={20}
                mColor={theme.colors.navigation.active}
              />
            </Pressable>
            <Pressable
              onPress={() => openComposer('pdf')}
              style={({ pressed }) => [
                styles.sourceAction,
                pressed && styles.pressed,
              ]}
            >
              <AppFlex
                size={46}
                align="center"
                justify="center"
                style={styles.iconSurface}
              >
                <AppIcon
                  name="filePdf"
                  size={25}
                  mColor={theme.colors.icon.secondary}
                  variant="featured"
                />
              </AppFlex>
              <AppFlex flex={1} gap="xs">
                <AppText variant="text.md.bold" color="headings">
                  Elegir un PDF
                </AppText>
                <AppText variant="text.sm.regular" color="details">
                  Organiza un archivo y agrega más páginas.
                </AppText>
              </AppFlex>
              <AppIcon
                name="caretRight"
                size={20}
                mColor={theme.colors.icon.secondary}
              />
            </Pressable>
          </AppFlex>
        </AppCard>

        {drafts.length > 0 ? (
          <AppFlex gap="sm" style={styles.drafts}>
            <AppText variant="overline" color="details">
              BORRADORES
            </AppText>
            <Pressable
              onPress={() => navigation.navigate('ComposerDrafts')}
              style={({ pressed }) => [
                styles.draftsButton,
                pressed && styles.pressed,
              ]}
            >
              <AppIcon
                name="files"
                size={22}
                mColor={theme.colors.icon.secondary}
              />
              <AppText
                variant="text.md.bold"
                color="body"
                style={styles.toolCopy}
              >
                Documentos en progreso
              </AppText>
              <AppFlex
                height={26}
                align="center"
                justify="center"
                style={styles.count}
              >
                <AppText variant="text.xs.bold" color="link">
                  {drafts.length}
                </AppText>
              </AppFlex>
            </Pressable>
          </AppFlex>
        ) : null}
      </ScrollView>
    </AppFlex>
  );
};

const styles = StyleSheet.create(theme => ({
  screen: {
    backgroundColor: theme.colors.surface.background.primary,
  },
  content: { padding: theme.spacing.md, gap: theme.spacing.md },
  intro: { marginBottom: theme.spacing.sm },
  composerCard: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  sourceAction: {
    minHeight: 78,
    padding: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface.background.elements,
  },
  iconSurface: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.navigation.rail,
  },
  toolCopy: { flex: 1 },
  drafts: { marginTop: theme.spacing.md },
  draftsButton: {
    minHeight: theme.control.height.large,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface.background.cards,
    borderWidth: theme.border.hairline,
    borderColor: theme.colors.border.subtle,
  },
  count: {
    minWidth: 28,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface.background.submenu,
  },
  pressed: { opacity: theme.opacity.pressed },
}));

export default ToolsScreen;
