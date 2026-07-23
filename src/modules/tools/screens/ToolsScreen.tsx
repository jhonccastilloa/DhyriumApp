import { useEffect } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  CaretRightIcon,
  FilesIcon,
  FilePdfIcon,
  ScanIcon,
} from 'phosphor-react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from '@/components/navigation/AppHeader';
import AppCard from '@/components/layout/AppCard';
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
    void pruneMissingDrafts();
  }, [pruneMissingDrafts]);

  const openComposer = (source: 'scanner' | 'pdf') =>
    navigation.navigate('ComposerReview', { mode: 'tool', source });

  return (
    <View style={styles.screen}>
      <AppHeader title="Herramientas" eyebrow="Documentos" />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        <View style={styles.intro}>
          <AppText variant="title.l" color="headings">
            Crea y organiza archivos PDF
          </AppText>
          <AppText variant="text.sm.regular" color="details">
            Flujos reutilizables, sin asociarlos a un contrato.
          </AppText>
        </View>
        <AppCard
          emphasized
          onPress={() => openComposer('scanner')}
          style={styles.toolCard}
        >
          <View style={styles.iconSurface}>
            <ScanIcon
              size={27}
              color={theme.colors.navigation.active}
              weight="duotone"
            />
          </View>
          <View style={styles.toolCopy}>
            <AppText variant="title.m" color="headings">
              Escanear a PDF
            </AppText>
            <AppText variant="text.sm.regular" color="details">
              Captura, ordena y genera un PDF.
            </AppText>
          </View>
          <CaretRightIcon
            size={20}
            color={theme.colors.navigation.active}
            weight="bold"
          />
        </AppCard>
        <AppCard onPress={() => openComposer('pdf')} style={styles.toolCard}>
          <View style={styles.iconSurface}>
            <FilePdfIcon
              size={27}
              color={theme.colors.icon.secondary}
              weight="duotone"
            />
          </View>
          <View style={styles.toolCopy}>
            <AppText variant="title.m" color="headings">
              Organizar un PDF
            </AppText>
            <AppText variant="text.sm.regular" color="details">
              Reordena, elimina o agrega páginas.
            </AppText>
          </View>
          <CaretRightIcon size={20} color={theme.colors.icon.secondary} />
        </AppCard>

        {drafts.length > 0 ? (
          <View style={styles.drafts}>
            <AppText variant="overline" color="details">
              BORRADORES
            </AppText>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('ComposerDrafts')}
              style={({ pressed }) => [
                styles.draftsButton,
                pressed && styles.pressed,
              ]}
            >
              <FilesIcon size={22} color={theme.colors.icon.secondary} />
              <AppText
                variant="text.md.bold"
                color="body"
                style={styles.toolCopy}
              >
                Borradores de escaneo
              </AppText>
              <View style={styles.count}>
                <AppText variant="text.xs.bold" color="link">
                  {drafts.length}
                </AppText>
              </View>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create(theme => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface.background.primary,
  },
  content: { padding: theme.spacing.md, gap: theme.spacing.md },
  intro: { marginBottom: theme.spacing.sm, gap: theme.spacing.xs },
  toolCard: {
    minHeight: 108,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  iconSurface: {
    width: 50,
    height: 50,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.navigation.rail,
  },
  toolCopy: { flex: 1, gap: theme.spacing.xs },
  drafts: { marginTop: theme.spacing.md, gap: theme.spacing.sm },
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
    height: 26,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface.background.submenu,
  },
  pressed: { opacity: theme.opacity.pressed },
}));

export default ToolsScreen;
