import { useEffect, useState } from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pdf } from 'react-native-pdf-light';
import { StyleSheet } from 'react-native-unistyles';
import AppHeader from '@/components/navigation/AppHeader';
import AppText from '@/components/typography/AppText';
import type { MainAppNavigatorParamList } from '@/app/navigation/MainAppNavigator';
import DocumentComposerService from '../services/DocumentComposerService';

type Props = NativeStackScreenProps<
  MainAppNavigatorParamList,
  'GeneratedPdfViewer'
>;

const GeneratedPdfViewerScreen = ({ route }: Props) => {
  const [source, setSource] = useState<string>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    let active = true;
    DocumentComposerService.downloadArtifact(route.params.artifact)
      .then(path => {
        if (active) setSource(`file://${path}`);
      })
      .catch(() => {
        if (active) setError('No se pudo abrir el PDF.');
      });
    return () => {
      active = false;
    };
  }, [route.params.artifact]);

  return (
    <View style={styles.screen}>
      <AppHeader
        showBack
        title={route.params.artifact.name}
        eyebrow={`${route.params.artifact.pageCount} páginas`}
      />
      {source ? (
        <Pdf source={source} shrinkToFit="always" />
      ) : (
        <View style={styles.state}>
          <AppText
            variant="text.md.bold"
            color={error ? 'error' : 'details'}
          >
            {error || 'Descargando PDF…'}
          </AppText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create(theme => ({
  screen: { flex: 1, backgroundColor: theme.colors.surface.background.primary },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center' },
}));

export default GeneratedPdfViewerScreen;
