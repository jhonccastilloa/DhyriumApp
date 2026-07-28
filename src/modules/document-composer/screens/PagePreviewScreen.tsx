import { Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StaticScreenProps } from '@react-navigation/native';
import { ZoomPdfView } from 'react-native-pdf-light/Zoom';
import { StyleSheet } from 'react-native-unistyles';
import AppHeader from '@/components/navigation/AppHeader';
import { AppButton } from '@/components/buttons/AppButton';
import AppFlex from '@/components/layout/AppFlex';
import AppText from '@/components/typography/AppText';
import type { MainAppNavigatorNavigationProp } from '@/app/navigation/MainAppNavigator';
import { useDocumentComposerStore } from '../state/useDocumentComposerStore';

type Props = StaticScreenProps<{ pageId: string }>;

const PagePreviewScreen = ({ route }: Props) => {
  const navigation = useNavigation<MainAppNavigatorNavigationProp>();
  const session = useDocumentComposerStore(state => state.session);
  const deletePage = useDocumentComposerStore(state => state.deletePage);
  const markLegible = useDocumentComposerStore(state => state.markLegible);
  const page = session?.pages.find(item => item.id === route.params.pageId);

  if (!session || !page) return <AppFlex flex={1} style={styles.screen} />;

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
    <AppFlex flex={1} style={styles.screen}>
      <AppHeader
        title={`Página ${page.order} de ${session.pages.length}`}
        eyebrow={page.fileName}
        showBack
      />
      <AppFlex flex={1} p="sm">
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
      </AppFlex>
      <AppFlex p="md" gap="md" style={styles.footer}>
        <AppText variant="text.sm.regular" color="details" numberOfLines={1}>
          {page.origin === 'scanned'
            ? page.uri.replace(/^.*\//, '…/')
            : `PDF original · página ${page.originalPageNumber}`}
        </AppText>
        <AppFlex direction="row" gap="sm">
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
        </AppFlex>
      </AppFlex>
    </AppFlex>
  );
};

const styles = StyleSheet.create(theme => ({
  screen: { backgroundColor: theme.colors.surface.background.primary },
  image: { width: '100%', height: '100%' },
  footer: {
    backgroundColor: theme.colors.surface.background.cards,
    borderTopWidth: theme.border.hairline,
    borderTopColor: theme.colors.border.subtle,
  },
  action: { flex: 1 },
}));

export default PagePreviewScreen;
