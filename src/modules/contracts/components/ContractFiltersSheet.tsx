import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type RefObject,
} from 'react';
import { Pressable, View } from 'react-native';
import {
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetFooterProps,
} from '@gorhom/bottom-sheet';
import { CheckIcon } from 'phosphor-react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import AppBottomSheetModal from '@/components/bottom-sheets/AppBottomSheetModal';
import { AppButton } from '@/components/buttons/AppButton';
import AppFilterChip from '@/components/filters/AppFilterChip';
import AppText from '@/components/typography/AppText';
import { useContractCountQuery } from '../queries/contractQueries';
import {
  countActiveContractFilters,
  EMPTY_CONTRACT_FILTERS,
} from '../state/useContractsContextStore';
import type {
  ContractFilters,
  ContractScope,
  ContractStatus,
} from '../types/contracts.types';

const STATUS_OPTIONS: { value: ContractStatus; label: string }[] = [
  { value: 'EN_CURSO', label: 'En curso' },
  { value: 'VENCE_PRONTO', label: 'Vence pronto' },
  { value: 'VENCIDO', label: 'Vencido' },
  { value: 'FINALIZADO', label: 'Finalizado' },
  { value: 'AL_DIA', label: 'Al día' },
];

const INSTRUMENT_OPTIONS = [
  { value: 'CONTRATO' as const, label: 'Contrato' },
  { value: 'ORDEN_DE_SERVICIO' as const, label: 'Orden de servicio' },
  {
    value: 'CONTRATACION_DIRECTA' as const,
    label: 'Contratación directa',
  },
];

type ContractFiltersSheetProps = {
  sheetRef: RefObject<BottomSheetModal | null>;
  scope?: ContractScope;
  filters: ContractFilters;
  onApply: (filters: ContractFilters) => void;
};

const ContractFiltersSheet = ({
  sheetRef,
  scope,
  filters,
  onApply,
}: ContractFiltersSheetProps) => {
  const [draft, setDraft] = useState(filters);
  const { theme } = useUnistyles();
  const count = useContractCountQuery({ scope, filters: draft });
  const years = useMemo(
    () => Array.from({ length: 6 }, (_, index) => new Date().getFullYear() - index),
    []
  );

  useEffect(() => setDraft(filters), [filters]);

  const toggleStatus = (status: ContractStatus) =>
    setDraft(current => ({
      ...current,
      statuses: current.statuses.includes(status)
        ? current.statuses.filter(value => value !== status)
        : [...current.statuses, status],
    }));

  const footer = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props} bottomInset={0}>
        <View style={styles.footer}>
          <AppButton
            text={`Aplicar filtros · ${count.data ?? '—'} resultados`}
            onPress={() => {
              onApply(draft);
              sheetRef.current?.dismiss();
            }}
          />
        </View>
      </BottomSheetFooter>
    ),
    [count.data, draft, onApply, sheetRef]
  );

  return (
    <AppBottomSheetModal
      ref={sheetRef}
      snapPoints={['86%']}
      enableDynamicSizing={false}
      enablePanDownToClose
      footerComponent={footer}
    >
      <View style={styles.heading}>
        <View style={styles.headingRow}>
          <View style={styles.headingCopy}>
            <AppText variant="title.l" color="headings">
              Filtros
            </AppText>
            <AppText variant="text.sm.regular" color="details">
              {countActiveContractFilters(draft)} criterios activos
            </AppText>
          </View>
          <Pressable
            onPress={() => setDraft(EMPTY_CONTRACT_FILTERS)}
            hitSlop={8}
          >
            <AppText variant="text.sm.bold" color="link">
              Restablecer
            </AppText>
          </Pressable>
        </View>
      </View>
      <BottomSheetScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <AppText variant="overline" color="details">
            VISTAS RÁPIDAS
          </AppText>
          <View style={styles.chips}>
            <AppFilterChip
              label="Vencen pronto"
              selected={draft.dueSoon}
              onPress={() =>
                setDraft(current => ({
                  ...current,
                  dueSoon: !current.dueSoon,
                }))
              }
            />
            <AppFilterChip
              label="Con documentos pendientes"
              selected={draft.pendingDocuments}
              onPress={() =>
                setDraft(current => ({
                  ...current,
                  pendingDocuments: !current.pendingDocuments,
                }))
              }
            />
          </View>
        </View>

        <View style={styles.section}>
          <AppText variant="overline" color="details">
            ESTADO CONTRACTUAL
          </AppText>
          <View style={styles.chips}>
            {STATUS_OPTIONS.map(option => (
              <AppFilterChip
                key={option.value}
                label={option.label}
                selected={draft.statuses.includes(option.value)}
                onPress={() => toggleStatus(option.value)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <AppText variant="overline" color="details">
            AÑO O PERIODO
          </AppText>
          <View style={styles.chips}>
            {years.map(year => (
              <AppFilterChip
                key={year}
                label={String(year)}
                selected={draft.period === year}
                onPress={() =>
                  setDraft(current => ({
                    ...current,
                    period: current.period === year ? undefined : year,
                  }))
                }
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <AppText variant="overline" color="details">
            TIPO DE INSTRUMENTO
          </AppText>
          {INSTRUMENT_OPTIONS.map(option => {
            const selected = draft.instrumentType === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() =>
                  setDraft(current => ({
                    ...current,
                    instrumentType: selected ? undefined : option.value,
                  }))
                }
                style={({ pressed }) => [
                  styles.instrument,
                  selected && styles.instrumentSelected,
                  pressed && styles.pressed,
                ]}
              >
                <AppText
                  variant="text.md.regular"
                  color={selected ? 'headings' : 'body'}
                  style={styles.headingCopy}
                >
                  {option.label}
                </AppText>
                {selected ? (
                  <CheckIcon
                    size={20}
                    color={theme.colors.navigation.active}
                    weight="bold"
                  />
                ) : null}
              </Pressable>
            );
          })}
        </View>
        <View style={styles.footerSpacer} />
      </BottomSheetScrollView>
    </AppBottomSheetModal>
  );
};

const styles = StyleSheet.create(theme => ({
  heading: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  headingRow: { flexDirection: 'row', alignItems: 'center' },
  headingCopy: { flex: 1 },
  content: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    gap: theme.spacing.lg,
  },
  section: { gap: theme.spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  instrument: {
    minHeight: theme.control.height.default,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.radius.md,
    borderWidth: theme.border.hairline,
    borderColor: theme.colors.border.subtle,
  },
  instrumentSelected: {
    borderColor: theme.colors.border.focus,
    backgroundColor: theme.colors.surface.background.submenu,
  },
  footer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface.background.cards,
    borderTopWidth: theme.border.hairline,
    borderTopColor: theme.colors.border.subtle,
  },
  footerSpacer: { height: 92 },
  pressed: { opacity: theme.opacity.pressed },
}));

export default ContractFiltersSheet;
