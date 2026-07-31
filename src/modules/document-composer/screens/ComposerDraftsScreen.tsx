import { Alert, FlatList, Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import AppHeader from '@/components/navigation/AppHeader';
import AppIcon from '@/components/icons/AppIcon';
import AppFlex from '@/components/layout/AppFlex';
import AppText from '@/components/typography/AppText';
import type { MainAppNavigatorNavigationProp } from '@/app/navigation/MainAppNavigator';
import DocumentComposerService from '../services/DocumentComposerService';
import { useDocumentComposerStore } from '../state/useDocumentComposerStore';
import type { ComposerSession } from '../types/documentComposer.types';

const DraftSeparator = () => <View style={styles.separator} />;

const ComposerDraftsScreen = () => {
  const navigation = useNavigation<MainAppNavigatorNavigationProp>();
  const { theme } = useUnistyles();
  const drafts = useDocumentComposerStore(state => state.drafts);
  const removeDraft = useDocumentComposerStore(state => state.removeDraft);

  const confirmRemove = (draft: ComposerSession) => {
    Alert.alert(
      'Eliminar borrador',
      `Se eliminarán ${draft.pages.length} páginas locales de “${draft.name}”.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            (async () => {
              await DocumentComposerService.cleanupTemporarySources(
                draft.pdfSources,
              );
              await removeDraft(draft.id);
            })().catch(() => undefined);
          },
        },
      ]
    );
  };

  return (
    <AppFlex flex={1} style={styles.screen}>
      <AppHeader
        showBack
        title="Documentos en progreso"
        count={drafts.length}
      />
      <FlatList
        data={drafts}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={DraftSeparator}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.navigate('ComposerReview', {
                mode: item.mode,
                source: item.source === 'mixed' ? 'scanner' : item.source,
                destination: item.destination,
                resumeSessionId: item.id,
              })
            }
            style={({ pressed }) => [
              styles.card,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.copy}>
              <AppText variant="text.md.bold" color="headings" numberOfLines={1}>
                {item.name}
              </AppText>
              <AppText variant="text.sm.regular" color="details">
                {item.pages.length} páginas · guardado{' '}
                {new Date(item.updatedAt).toLocaleDateString('es-PE')}
              </AppText>
            </View>
            <Pressable
              onPress={() => confirmRemove(item)}
              style={styles.delete}
            >
              <AppIcon
                name="trash"
                size={20}
                mColor={theme.colors.text.error}
              />
            </Pressable>
            <AppIcon
              name="caretRight"
              size={20}
              mColor={theme.colors.icon.secondary}
            />
          </Pressable>
        )}
        ListEmptyComponent={
          <AppFlex
            flex={1}
            align="center"
            justify="center"
            gap="sm"
            style={styles.empty}
          >
            <AppText variant="title.m" color="headings">
              No hay documentos en progreso
            </AppText>
            <AppText variant="text.sm.regular" color="details" align="center">
              Los documentos aparecerán aquí cuando guardes un borrador.
            </AppText>
          </AppFlex>
        }
      />
    </AppFlex>
  );
};

const styles = StyleSheet.create(theme => ({
  screen: { backgroundColor: theme.colors.surface.background.primary },
  content: { padding: theme.spacing.md, flexGrow: 1 },
  separator: { height: theme.spacing.sm },
  card: {
    minHeight: 78,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface.background.cards,
    borderWidth: theme.border.hairline,
    borderColor: theme.colors.border.subtle,
  },
  copy: { flex: 1, gap: theme.spacing.xs },
  delete: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface.status.error,
  },
  empty: { minHeight: 260 },
  pressed: { opacity: theme.opacity.pressed },
}));

export default ComposerDraftsScreen;
