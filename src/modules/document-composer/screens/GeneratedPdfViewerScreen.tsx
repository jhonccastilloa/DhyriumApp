import { useEffect, useState } from 'react';
import type { StaticScreenProps } from '@react-navigation/native';
import { Pdf } from 'react-native-pdf-light';
import { StyleSheet } from 'react-native-unistyles';
import AppFlex from '@/components/layout/AppFlex';
import AppHeader from '@/components/navigation/AppHeader';
import AppText from '@/components/typography/AppText';
import DocumentComposerService from '../services/DocumentComposerService';
import type { ComposerArtifact } from '../types/documentComposer.types';

type Props = StaticScreenProps<{ artifact: ComposerArtifact }>;

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
    <AppFlex flex={1} style={styles.screen}>
      <AppHeader
        showBack
        title={route.params.artifact.name}
        eyebrow={`${route.params.artifact.pageCount} páginas`}
      />
      {source ? (
        <Pdf source={source} shrinkToFit="always" />
      ) : (
        <AppFlex flex={1} align="center" justify="center">
          <AppText
            variant="text.md.bold"
            color={error ? 'error' : 'details'}
          >
            {error || 'Descargando PDF…'}
          </AppText>
        </AppFlex>
      )}
    </AppFlex>
  );
};

const styles = StyleSheet.create(theme => ({
  screen: { backgroundColor: theme.colors.surface.background.primary },
}));

export default GeneratedPdfViewerScreen;
