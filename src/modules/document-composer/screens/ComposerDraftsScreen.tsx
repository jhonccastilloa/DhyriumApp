import { Alert, FlatList, Pressable, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CaretRightIcon, TrashIcon } from 'phosphor-react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import AppHeader from '@/components/navigation/AppHeader';
import AppText from '@/components/typography/AppText';
import type { MainAppNavigatorParamList } from '@/app/navigation/MainAppNavigator';
import { useDocumentComposerStore } from '../state/useDocumentComposerStore';
import type { ComposerSession } from '../types/documentComposer.types';

type Props = NativeStackScreenProps<
  MainAppNavigatorParamList,
  'ComposerDrafts'
>;

const ComposerDraftsScreen = ({ navigation }: Props) => {
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
          onPress: () => void removeDraft(draft.id),
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <AppHeader showBack title="Borradores" count={drafts.length} />
      <FlatList
        data={drafts}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
              accessibilityRole="button"
              accessibilityLabel={`Eliminar borrador ${item.name}`}
              style={styles.delete}
            >
              <TrashIcon size={20} color={theme.colors.text.error} />
            </Pressable>
            <CaretRightIcon
              size={20}
              color={theme.colors.icon.secondary}
            />
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <AppText variant="title.m" color="headings">
              No hay borradores
            </AppText>
            <AppText variant="text.sm.regular" color="details" align="center">
              Los borradores reales aparecerán aquí cuando guardes una sesión.
            </AppText>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create(theme => ({
  screen: { flex: 1, backgroundColor: theme.colors.surface.background.primary },
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
  empty: { flex: 1, minHeight: 260, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.sm },
  pressed: { opacity: theme.opacity.pressed },
}));

export default ComposerDraftsScreen;
