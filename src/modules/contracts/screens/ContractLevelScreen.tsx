import { useMemo, useRef, useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StaticScreenProps } from '@react-navigation/native';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useQueryClient } from '@tanstack/react-query';
import { StyleSheet } from 'react-native-unistyles';
import AppFlex from '@/components/layout/AppFlex';
import AppHeader from '@/components/navigation/AppHeader';
import AppText from '@/components/typography/AppText';
import type { MainAppNavigatorNavigationProp } from '@/app/navigation/MainAppNavigator';
import type { HomeNavigatorNavigationProp } from '@/modules/home/navigation/HomeNavigator';
import ContractDocumentNodeCard from '../components/ContractDocumentNodeCard';
import ContractMethodSheet from '../components/ContractMethodSheet';
import { findContractTreeNode } from '../domain/contractTree';
import { useContractQuery, useContractTreeQuery } from '../queries/contractQueries';
import ContractsService from '../services/ContractsService';
import type { ContractTreeNode } from '../types/contracts.types';

type Props = StaticScreenProps<{
  contractId: number;
  parentCode: string;
  path: string[];
}>;

const ContractLevelScreen = ({ route }: Props) => {
  const navigation = useNavigation<HomeNavigatorNavigationProp>();
  const { contractId, parentCode, path } = route.params;
  const tree = useContractTreeQuery(contractId);
  const contract = useContractQuery(contractId);
  const queryClient = useQueryClient();
  const methodSheet = useRef<BottomSheetModal>(null);
  const [selectedNode, setSelectedNode] = useState<ContractTreeNode>();
  const parent = useMemo(
    () => findContractTreeNode(tree.data || [], parentCode),
    [parentCode, tree.data]
  );
  const rootNavigation = navigation
    .getParent()
    ?.getParent() as unknown as MainAppNavigatorNavigationProp | undefined;

  const openComposer = (
    source: 'scanner' | 'pdf',
    useCurrent = false
  ) => {
    if (!selectedNode || !contract.data || !rootNavigation) return;
    rootNavigation.navigate('ComposerReview', {
      mode: 'contract',
      source,
      useCurrent,
      destination: {
        contractId,
        contractLabel:
          contract.data.contractNumber || contract.data.projectShortName || '',
        levelCode: selectedNode.code,
        levelName: selectedNode.name,
        path: [...path, selectedNode.name],
        currentVersionId: selectedNode.currentVersionId || undefined,
      },
    });
  };

  const removeCurrent = () => {
    if (!selectedNode) return;
    Alert.alert(
      'Quitar PDF',
      'El nivel volverá a pendiente. La versión seguirá disponible en el historial.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Quitar PDF',
          style: 'destructive',
          onPress: async () => {
            await ContractsService.removeCurrent(
              contractId,
              selectedNode.code,
              selectedNode.currentVersionId || undefined
            );
            await Promise.all([
              queryClient.invalidateQueries({
                queryKey: ['contracts', 'tree', contractId],
              }),
              queryClient.invalidateQueries({
                queryKey: ['contracts', 'detail', contractId],
              }),
            ]);
          },
        },
      ]
    );
  };

  const children = parent?.children || [];
  return (
    <AppFlex flex={1} style={styles.screen}>
      <AppHeader
        showBack
        eyebrow={`${parent?.code || parentCode} · ${path
          .slice(0, -1)
          .join(' / ')}`}
        title={parent?.name || 'Nivel documental'}
        count={children.length}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AppFlex p="md" gap="xs" style={styles.context}>
          <AppText variant="overline" color="details">
            RUTA ACTUAL
          </AppText>
          <AppText variant="text.sm.regular" color="body">
            {path.join(' / ')}
          </AppText>
        </AppFlex>
        {children.map(node => (
          <ContractDocumentNodeCard
            key={node.code}
            node={node}
            onPress={() => {
              if (node.acceptsPdf) {
                setSelectedNode(node);
                methodSheet.current?.present();
              } else {
                navigation.push('ContractLevel', {
                  contractId,
                  parentCode: node.code,
                  path: [...path, node.name],
                });
              }
            }}
          />
        ))}
        {parent && parent.acceptsPdf ? (
          <ContractDocumentNodeCard
            node={parent}
            onPress={() => {
              setSelectedNode(parent);
              methodSheet.current?.present();
            }}
          />
        ) : null}
        {!tree.isLoading && children.length === 0 && !parent?.acceptsPdf ? (
          <AppFlex
            align="center"
            justify="center"
            gap="sm"
            p="lg"
            style={styles.empty}
          >
            <AppText variant="title.m" color="headings">
              Grupo sin documentos
            </AppText>
            <AppText variant="text.sm.regular" color="details" align="center">
              Este nivel no tiene destinos configurados para la versión móvil.
            </AppText>
          </AppFlex>
        ) : null}
      </ScrollView>
      <ContractMethodSheet
        sheetRef={methodSheet}
        node={selectedNode}
        path={selectedNode ? [...path, selectedNode.name] : path}
        onChoosePdf={() => openComposer('pdf')}
        onScan={() => openComposer('scanner')}
        onView={() => {
          if (!selectedNode || !rootNavigation) return;
          rootNavigation.navigate('ContractPdfViewer', {
            contractId,
            levelCode: selectedNode.code,
            name: selectedNode.name,
          });
        }}
        onOrganize={() => openComposer('pdf', true)}
        onDelete={removeCurrent}
      />
    </AppFlex>
  );
};

const styles = StyleSheet.create(theme => ({
  screen: { backgroundColor: theme.colors.surface.background.primary },
  content: { padding: theme.spacing.md, paddingBottom: theme.spacing.xl, gap: theme.spacing.sm },
  context: {
    marginBottom: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface.background.submenu,
  },
  empty: {
    minHeight: 180,
  },
}));

export default ContractLevelScreen;
