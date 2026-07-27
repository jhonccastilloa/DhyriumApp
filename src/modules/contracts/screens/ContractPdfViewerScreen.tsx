import { useEffect, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pdf } from 'react-native-pdf-light';
import { StyleSheet } from 'react-native-unistyles';
import AppFlex from '@/components/layout/AppFlex';
import AppHeader from '@/components/navigation/AppHeader';
import AppText from '@/components/typography/AppText';
import type { MainAppNavigatorParamList } from '@/app/navigation/MainAppNavigator';
import DocumentComposerService from '@/modules/document-composer/services/DocumentComposerService';

type Props = NativeStackScreenProps<
  MainAppNavigatorParamList,
  'ContractPdfViewer'
>;

const ContractPdfViewerScreen = ({ route }: Props) => {
  const [source, setSource] = useState<string>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    let active = true;
    DocumentComposerService.downloadContractPdf(route.params)
      .then(path => {
        if (active) setSource(`file://${path}`);
      })
      .catch(() => {
        if (active) setError('No se pudo descargar el PDF del contrato.');
      });
    return () => {
      active = false;
    };
  }, [route.params]);

  return (
    <AppFlex flex={1} style={styles.screen}>
      <AppHeader
        showBack
        eyebrow={`Nivel ${route.params.levelCode}`}
        title={route.params.name}
      />
      {source ? (
        <Pdf source={source} shrinkToFit="always" />
      ) : (
        <AppFlex flex={1} align="center" justify="center" p="lg">
          <AppText
            variant="text.md.bold"
            color={error ? 'error' : 'details'}
            align="center"
          >
            {error || 'Descargando documento…'}
          </AppText>
        </AppFlex>
      )}
    </AppFlex>
  );
};

const styles = StyleSheet.create(theme => ({
  screen: { backgroundColor: theme.colors.surface.background.primary },
}));

export default ContractPdfViewerScreen;
