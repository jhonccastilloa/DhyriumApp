import { Alert, Image, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ZoomPdfView } from 'react-native-pdf-light/Zoom';
import { StyleSheet } from 'react-native-unistyles';
import AppHeader from '@/components/navigation/AppHeader';
import { AppButton } from '@/components/buttons/AppButton';
import AppText from '@/components/typography/AppText';
import type { MainAppNavigatorParamList } from '@/app/navigation/MainAppNavigator';
import { useDocumentComposerStore } from '../state/useDocumentComposerStore';

type Props = NativeStackScreenProps<
  MainAppNavigatorParamList,
  'PagePreview'
>;

const PagePreviewScreen = ({ route, navigation }: Props) => {
  const session = useDocumentComposerStore(state => state.session);
  const deletePage = useDocumentComposerStore(state => state.deletePage);
  const markLegible = useDocumentComposerStore(state => state.markLegible);
  const page = session?.pages.find(item => item.id === route.params.pageId);

  if (!session || !page) return <View style={styles.screen} />;

  const confirmDelete = () => {
    Alert.alert(
      'Eliminar página',
      `La página ${page.order} se quitará y las demás se renumerarán.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deletePage(page.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title={`Página ${page.order} de ${session.pages.length}`}
        eyebrow={page.fileName}
        showBack
      />
      <View style={styles.preview}>
        {page.origin === 'scanned' ? (
          <Image
            source={{ uri: page.uri }}
            resizeMode="contain"
            style={styles.image}
          />
        ) : (
          <ZoomPdfView
            source={page.uri}
            page={(page.originalPageNumber || 1) - 1}
            resizeMode="contain"
            maximumZoom={3}
            style={styles.image}
          />
        )}
      </View>
      <View style={styles.footer}>
        <AppText variant="text.sm.regular" color="details" numberOfLines={1}>
          {page.origin === 'scanned'
            ? page.uri.replace(/^.*\//, '…/')
            : `PDF original · página ${page.originalPageNumber}`}
        </AppText>
        <View style={styles.actions}>
          <AppButton
            text="Eliminar"
            variant="ghost"
            style={styles.action}
            onPress={confirmDelete}
          />
          <AppButton
            text={
              page.legibilityStatus === 'legible'
                ? 'Página legible'
                : 'Confirmar legibilidad'
            }
            style={styles.action}
            onPress={() => {
              markLegible(page.id);
              navigation.goBack();
            }}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create(theme => ({
  screen: { flex: 1, backgroundColor: theme.colors.surface.background.primary },
  preview: { flex: 1, padding: theme.spacing.sm },
  image: { width: '100%', height: '100%' },
  footer: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface.background.cards,
    borderTopWidth: theme.border.hairline,
    borderTopColor: theme.colors.border.subtle,
  },
  actions: { flexDirection: 'row', gap: theme.spacing.sm },
  action: { flex: 1 },
}));

export default PagePreviewScreen;
