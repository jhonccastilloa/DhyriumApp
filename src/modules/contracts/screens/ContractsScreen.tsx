import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FlatList, Pressable, RefreshControl, View } from 'react-native';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { toast } from 'sonner-native';
import AppHeader from '@/components/navigation/AppHeader';
import AppSearchInput from '@/components/inputs/AppSearchInput';
import AppCard from '@/components/layout/AppCard';
import AppIcon from '@/components/icons/AppIcon';
import AppStatusBadge, {
  type AppStatusTone,
} from '@/components/feedback/AppStatusBadge';
import AppProgressBar from '@/components/feedback/AppProgressBar';
import AppFilterChip from '@/components/filters/AppFilterChip';
import AppText from '@/components/typography/AppText';
import type { HomeNavigatorParamList } from '@/modules/home/navigation/HomeNavigator';
import CompanyScopeSheet from '../components/CompanyScopeSheet';
import ContractFiltersSheet from '../components/ContractFiltersSheet';
import { useContractScopesQuery, useContractsQuery } from '../queries/contractQueries';
import {
  countActiveContractFilters,
  useContractsContextStore,
} from '../state/useContractsContextStore';
import type {
  ContractFilters,
  ContractStatus,
  ContractSummary,
} from '../types/contracts.types';

const STATUS_META: Record<
  ContractStatus,
  { label: string; tone: AppStatusTone }
> = {
  EN_CURSO: { label: 'En curso', tone: 'info' },
  VENCE_PRONTO: { label: 'Vence pronto', tone: 'warning' },
  VENCIDO: { label: 'Vencido', tone: 'error' },
  FINALIZADO: { label: 'Finalizado', tone: 'success' },
  AL_DIA: { label: 'Al día', tone: 'success' },
};

const FILTER_LABELS = (filters: ContractFilters) => [
  ...(filters.dueSoon ? [{ key: 'dueSoon', label: 'Vencen pronto' }] : []),
  ...(filters.pendingDocuments
    ? [{ key: 'pendingDocuments', label: 'Documentos pendientes' }]
    : []),
  ...filters.statuses.map(status => ({
    key: `status-${status}`,
    label: STATUS_META[status].label,
  })),
  ...(filters.period
    ? [{ key: 'period', label: String(filters.period) }]
    : []),
  ...(filters.instrumentType
    ? [
        {
          key: 'instrument',
          label: filters.instrumentType.replaceAll('_', ' '),
        },
      ]
    : []),
];

const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date(value))
    : null;

const ContractsScreen = () => {
  const { theme } = useUnistyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeNavigatorParamList>>();
  const companySheet = useRef<BottomSheetModal>(null);
  const filterSheet = useRef<BottomSheetModal>(null);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search.trim());
  const scopes = useContractScopesQuery();
  const scope = useContractsContextStore(state => state.scope);
  const filters = useContractsContextStore(state => state.filters);
  const setScope = useContractsContextStore(state => state.setScope);
  const setFilters = useContractsContextStore(state => state.setFilters);

  useEffect(() => {
    if (!scope && scopes.data?.[0]) setScope(scopes.data[0]);
  }, [scope, scopes.data, setScope]);

  const contracts = useContractsQuery({
    search: deferredSearch,
    scope,
    filters,
  });
  const activeFilters = countActiveContractFilters(filters);
  const chips = useMemo(() => FILTER_LABELS(filters), [filters]);

  const removeFilter = (key: string) => {
    if (key === 'dueSoon') setFilters({ ...filters, dueSoon: false });
    else if (key === 'pendingDocuments')
      setFilters({ ...filters, pendingDocuments: false });
    else if (key === 'period') setFilters({ ...filters, period: undefined });
    else if (key === 'instrument')
      setFilters({ ...filters, instrumentType: undefined });
    else if (key.startsWith('status-')) {
      const status = key.slice(7) as ContractStatus;
      setFilters({
        ...filters,
        statuses: filters.statuses.filter(value => value !== status),
      });
    }
  };

  const renderContract = ({ item }: { item: ContractSummary }) => {
    const meta = STATUS_META[item.status];
    return (
      <AppCard
        onPress={() =>
          navigation.navigate('ContractDetail', { contractId: item.id })
        }
        style={styles.contractCard}
      >
        <View style={styles.cardHeading}>
          <View style={styles.cardHeadingCopy}>
            <AppText variant="overline" color="details" numberOfLines={1}>
              {item.contractNumber || item.type.replaceAll('_', ' ')}
            </AppText>
            <AppText variant="title.m" color="headings" numberOfLines={2}>
              {item.projectShortName || item.name}
            </AppText>
          </View>
          <AppIcon
            name="caretRight"
            size={20}
            mColor={theme.colors.icon.secondary}
          />
        </View>
        <AppText variant="text.sm.regular" color="body" numberOfLines={2}>
          {item.projectName}
        </AppText>
        <View style={styles.contractContext}>
          <AppText
            variant="text.xs.regular"
            color="details"
            numberOfLines={1}
            style={styles.cardHeadingCopy}
          >
            {item.entity || 'Entidad no registrada'}
          </AppText>
          {formatDate(item.relevantDate) ? (
            <AppText variant="text.xs.bold" color="details">
              {formatDate(item.relevantDate)}
            </AppText>
          ) : null}
        </View>
        <View style={styles.metaRow}>
          <AppText variant="text.xs.bold" color="details">
            CUI {item.cui}
          </AppText>
          <AppStatusBadge label={meta.label} tone={meta.tone} />
        </View>
        <View style={styles.progressCopy}>
          <AppText variant="text.xs.regular" color="details">
            Progreso documental
          </AppText>
          <AppText variant="text.xs.bold" color="body">
            {item.documentProgress.uploaded}/{item.documentProgress.required}
          </AppText>
        </View>
        <AppProgressBar value={item.documentProgress.percentage} />
      </AppCard>
    );
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Contratos"
        eyebrow="Gestión documental"
        showBack
        count={contracts.data?.pagination.total}
        rightAction={
          <Pressable
            onPress={() => companySheet.current?.present()}
            style={({ pressed }) => [
              styles.headerAction,
              pressed && styles.pressed,
            ]}
          >
            <AppIcon
              name="buildings"
              size={19}
              mColor={theme.colors.navigation.active}
            />
            <AppIcon
              name="caretDown"
              size={14}
              mColor={theme.colors.navigation.active}
            />
          </Pressable>
        }
      />
      <FlatList
        data={contracts.data?.data || []}
        renderItem={renderContract}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={contracts.isRefetching}
            onRefresh={() => void contracts.refetch()}
            tintColor={theme.colors.navigation.active}
          />
        }
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Pressable
              onPress={() => companySheet.current?.present()}
              style={({ pressed }) => [
                styles.scope,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.scopeCopy}>
                <AppText variant="text.xs.bold" color="details">
                  EMPRESA O CONSORCIO
                </AppText>
                <AppText variant="text.md.bold" color="headings" numberOfLines={1}>
                  {scope?.name || 'Selecciona un contexto'}
                </AppText>
              </View>
              <AppIcon
                name="caretDown"
                size={18}
                mColor={theme.colors.icon.secondary}
              />
            </Pressable>
            <AppSearchInput
              value={search}
              onChangeText={setSearch}
              onClear={() => setSearch('')}
              placeholder="Buscar por CUI, contrato o proyecto"
            />
            <View style={styles.controls}>
              <Pressable
                onPress={() => filterSheet.current?.present()}
                style={({ pressed }) => [
                  styles.control,
                  pressed && styles.pressed,
                ]}
              >
                <AppIcon
                  name="funnel"
                  size={19}
                  mColor={theme.colors.icon.secondary}
                  variant={activeFilters > 0 ? 'active' : 'default'}
                />
                <AppText variant="text.sm.bold" color="body">
                  Filtros
                </AppText>
                {activeFilters > 0 ? (
                  <View style={styles.filterCount}>
                    <AppText variant="text.xs.bold" color="link">
                      {activeFilters}
                    </AppText>
                  </View>
                ) : null}
              </Pressable>
              <View style={styles.control}>
                <AppIcon
                  name="sortAscending"
                  size={19}
                  mColor={theme.colors.icon.secondary}
                />
                <AppText variant="text.sm.bold" color="body">
                  Recientes
                </AppText>
              </View>
            </View>
            {chips.length > 0 ? (
              <View style={styles.appliedFilters}>
                {chips.map(chip => (
                  <AppFilterChip
                    key={chip.key}
                    label={chip.label}
                    selected
                    removable
                    onPress={() => removeFilter(chip.key)}
                  />
                ))}
                <Pressable onPress={() => setFilters({
                  dueSoon: false,
                  pendingDocuments: false,
                  statuses: [],
                })}>
                  <AppText variant="text.sm.bold" color="link">
                    Limpiar todo
                  </AppText>
                </Pressable>
              </View>
            ) : null}
            {contracts.isError ? (
              <Pressable
                onPress={() => void contracts.refetch()}
                style={styles.state}
              >
                <AppText variant="text.md.bold" color="error">
                  No pudimos cargar los contratos
                </AppText>
                <AppText variant="text.sm.regular" color="details">
                  Toca para intentar nuevamente.
                </AppText>
              </Pressable>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          contracts.isLoading || contracts.isError ? null : (
            <View style={styles.state}>
              <AppText variant="title.m" color="headings">
                No hay contratos para mostrar
              </AppText>
              <AppText variant="text.sm.regular" color="details" align="center">
                Ajusta la búsqueda o los filtros activos.
              </AppText>
            </View>
          )
        }
      />
      <CompanyScopeSheet
        sheetRef={companySheet}
        scopes={scopes.data || []}
        selected={scope}
        onSelect={next => {
          setScope(next);
          toast.success(`Contexto cambiado a ${next.name}`);
        }}
      />
      <ContractFiltersSheet
        sheetRef={filterSheet}
        scope={scope}
        filters={filters}
        onApply={setFilters}
      />
    </View>
  );
};

const styles = StyleSheet.create(theme => ({
  screen: { flex: 1, backgroundColor: theme.colors.surface.background.primary },
  headerAction: {
    minWidth: 54,
    height: theme.control.hitSlop,
    paddingHorizontal: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.navigation.rail,
  },
  list: { padding: theme.spacing.md, paddingBottom: theme.spacing.xl },
  listHeader: { gap: theme.spacing.md, marginBottom: theme.spacing.md },
  scope: {
    minHeight: 62,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface.background.cards,
    borderWidth: theme.border.hairline,
    borderColor: theme.colors.border.subtle,
  },
  scopeCopy: { flex: 1, gap: theme.spacing.xs },
  controls: { flexDirection: 'row', gap: theme.spacing.sm },
  control: {
    minHeight: 42,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface.background.cards,
    borderWidth: theme.border.hairline,
    borderColor: theme.colors.border.subtle,
  },
  filterCount: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.navigation.rail,
  },
  appliedFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  contractCard: { padding: theme.spacing.md, gap: theme.spacing.sm },
  cardHeading: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  cardHeadingCopy: { flex: 1, gap: theme.spacing.xs },
  contractContext: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  progressCopy: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  separator: { height: theme.spacing.sm },
  state: {
    minHeight: 140,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
  },
  pressed: { opacity: theme.opacity.pressed },
}));

export default ContractsScreen;
