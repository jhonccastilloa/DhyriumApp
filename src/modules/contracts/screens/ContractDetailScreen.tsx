import { useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native-unistyles';
import AppHeader from '@/components/navigation/AppHeader';
import AppProgressBar from '@/components/feedback/AppProgressBar';
import AppSearchInput from '@/components/inputs/AppSearchInput';
import AppFilterChip from '@/components/filters/AppFilterChip';
import AppFlex from '@/components/layout/AppFlex';
import AppText from '@/components/typography/AppText';
import type { HomeNavigatorParamList } from '@/modules/home/navigation/HomeNavigator';
import ContractDocumentNodeCard from '../components/ContractDocumentNodeCard';
import { filterContractTree } from '../domain/contractTree';
import { useContractQuery, useContractTreeQuery } from '../queries/contractQueries';

const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date(value))
    : 'Sin registrar';

type Props = NativeStackScreenProps<
  HomeNavigatorParamList,
  'ContractDetail'
>;

const ContractDetailScreen = ({ route, navigation }: Props) => {
  const { contractId } = route.params;
  const contract = useContractQuery(contractId);
  const tree = useContractTreeQuery(contractId);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | 'PENDING' | 'UPLOADED'>('ALL');
  const nodes = useMemo(
    () => filterContractTree(tree.data || [], search, status),
    [search, status, tree.data]
  );

  return (
    <AppFlex flex={1} style={styles.screen}>
      <AppHeader
        showBack
        eyebrow={contract.data?.contractNumber || 'Contrato'}
        title={contract.data?.projectShortName || 'Detalle del contrato'}
        badge={contract.data?.status.replaceAll('_', ' ')}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {contract.data ? (
          <AppFlex p="md" gap="md" style={styles.summary}>
            <AppText variant="title.l" color="headings">
              {contract.data.projectName}
            </AppText>
            <AppFlex direction="row" gap="md">
              <AppFlex flex={1} gap="xs">
                <AppText variant="text.xs.bold" color="details">
                  CUI
                </AppText>
                <AppText variant="text.sm.bold" color="body">
                  {contract.data.cui}
                </AppText>
              </AppFlex>
              <AppFlex flex={1} gap="xs">
                <AppText variant="text.xs.bold" color="details">
                  ENTIDAD
                </AppText>
                <AppText variant="text.sm.bold" color="body" numberOfLines={2}>
                  {contract.data.entity || 'Sin entidad'}
                </AppText>
              </AppFlex>
            </AppFlex>
            <AppFlex direction="row" gap="md">
              <AppFlex flex={1} gap="xs">
                <AppText variant="text.xs.bold" color="details">
                  NOMENCLATURA
                </AppText>
                <AppText variant="text.sm.bold" color="body" numberOfLines={2}>
                  {contract.data.contractNumber || contract.data.name}
                </AppText>
              </AppFlex>
              <AppFlex flex={1} gap="xs">
                <AppText variant="text.xs.bold" color="details">
                  FECHA DE FIRMA
                </AppText>
                <AppText variant="text.sm.bold" color="body">
                  {formatDate(contract.data.signedAt)}
                </AppText>
              </AppFlex>
            </AppFlex>
            <AppFlex direction="row" justify="space-between" gap="sm">
              <AppText variant="text.sm.bold" color="body">
                Progreso documental
              </AppText>
              <AppText variant="text.sm.bold" color="link">
                {contract.data.documentProgress.uploaded}/
                {contract.data.documentProgress.required} PDF
              </AppText>
            </AppFlex>
            <AppProgressBar
              value={contract.data.documentProgress.percentage}
            />
          </AppFlex>
        ) : null}

        <AppFlex gap="xs" style={styles.documentsHeader}>
          <AppText variant="title.l" color="headings">
            Estructura documental
          </AppText>
          <AppText variant="text.sm.regular" color="details">
            Navega por los niveles hasta encontrar el documento.
          </AppText>
        </AppFlex>
        <AppSearchInput
          value={search}
          onChangeText={setSearch}
          onClear={() => setSearch('')}
          placeholder="Buscar documento o código"
        />
        <AppFlex direction="row" flexWrap="wrap" gap="sm">
          <AppFilterChip
            label="Todos"
            selected={status === 'ALL'}
            onPress={() => setStatus('ALL')}
          />
          <AppFilterChip
            label="Pendientes"
            selected={status === 'PENDING'}
            onPress={() => setStatus('PENDING')}
          />
          <AppFilterChip
            label="Subidos"
            selected={status === 'UPLOADED'}
            onPress={() => setStatus('UPLOADED')}
          />
        </AppFlex>
        <AppFlex gap="sm">
          {nodes.map(node => (
            <ContractDocumentNodeCard
              key={node.code}
              node={node}
              onPress={() =>
                navigation.navigate('ContractLevel', {
                  contractId,
                  parentCode: node.code,
                  path: [node.name],
                })
              }
            />
          ))}
          {!tree.isLoading && nodes.length === 0 ? (
            <AppFlex
              align="center"
              justify="center"
              gap="sm"
              style={styles.empty}
            >
              <AppText variant="title.m" color="headings">
                Sin coincidencias
              </AppText>
              <AppText variant="text.sm.regular" color="details" align="center">
                Prueba con otro término o cambia el filtro.
              </AppText>
            </AppFlex>
          ) : null}
        </AppFlex>
      </ScrollView>
    </AppFlex>
  );
};

const styles = StyleSheet.create(theme => ({
  screen: { backgroundColor: theme.colors.surface.background.primary },
  content: { padding: theme.spacing.md, paddingBottom: theme.spacing.xl, gap: theme.spacing.md },
  summary: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface.background.cards,
    borderWidth: theme.border.hairline,
    borderColor: theme.colors.border.subtle,
  },
  documentsHeader: { marginTop: theme.spacing.sm },
  empty: { minHeight: 160 },
}));

export default ContractDetailScreen;
