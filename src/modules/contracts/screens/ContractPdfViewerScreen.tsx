import { useEffect, useState } from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pdf } from 'react-native-pdf-light';
import { StyleSheet } from 'react-native-unistyles';
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
    <View style={styles.screen}>
      <AppHeader
        showBack
        eyebrow={`Nivel ${route.params.levelCode}`}
        title={route.params.name}
      />
      {source ? (
        <Pdf source={source} shrinkToFit="always" />
      ) : (
        <View style={styles.state}>
          <AppText
            variant="text.md.bold"
            color={error ? 'error' : 'details'}
            align="center"
          >
            {error || 'Descargando documento…'}
          </AppText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create(theme => ({
  screen: { flex: 1, backgroundColor: theme.colors.surface.background.primary },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.lg },
}));

export default ContractPdfViewerScreen;
