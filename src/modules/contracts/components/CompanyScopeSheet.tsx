import { useMemo, useState, type RefObject } from 'react';
import { Pressable, View } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { BuildingsIcon, CheckCircleIcon } from 'phosphor-react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import AppBottomSheetModal from '@/components/bottom-sheets/AppBottomSheetModal';
import AppSearchInput from '@/components/inputs/AppSearchInput';
import AppText from '@/components/typography/AppText';
import type { ContractScope } from '../types/contracts.types';

type CompanyScopeSheetProps = {
  sheetRef: RefObject<BottomSheetModal | null>;
  scopes: ContractScope[];
  selected?: ContractScope;
  onSelect: (scope: ContractScope) => void;
};

const CompanyScopeSheet = ({
  sheetRef,
  scopes,
  selected,
  onSelect,
}: CompanyScopeSheetProps) => {
  const [search, setSearch] = useState('');
  const { theme } = useUnistyles();
  const filtered = useMemo(() => {
    const normalized = search.trim().toLocaleLowerCase('es');
    return normalized
      ? scopes.filter(scope =>
          scope.name.toLocaleLowerCase('es').includes(normalized)
        )
      : scopes;
  }, [scopes, search]);

  return (
    <AppBottomSheetModal
      ref={sheetRef}
      snapPoints={['72%']}
      enableDynamicSizing={false}
      enablePanDownToClose
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <View style={styles.heading}>
        <AppText variant="title.l" color="headings">
          Cambiar empresa
        </AppText>
        <AppText variant="text.sm.regular" color="details">
          El contexto seleccionado define los contratos y filtros.
        </AppText>
        <AppSearchInput
          value={search}
          onChangeText={setSearch}
          onClear={() => setSearch('')}
          placeholder="Buscar empresa o consorcio"
        />
      </View>
      <BottomSheetScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {filtered.map(scope => {
          const isSelected =
            selected?.id === scope.id && selected.type === scope.type;
          return (
            <Pressable
              key={`${scope.type}-${scope.id}`}
              onPress={() => {
                onSelect(scope);
                sheetRef.current?.dismiss();
              }}
              style={({ pressed }) => [
                styles.option,
                isSelected && styles.optionSelected,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.icon}>
                <BuildingsIcon
                  size={22}
                  color={
                    isSelected
                      ? theme.colors.navigation.active
                      : theme.colors.icon.secondary
                  }
                />
              </View>
              <View style={styles.optionCopy}>
                <AppText variant="text.md.bold" color="headings">
                  {scope.name}
                </AppText>
                <AppText variant="text.xs.regular" color="details">
                  {scope.type === 'company' ? 'Empresa' : 'Consorcio'} ·{' '}
                  {scope.contractCount}{' '}
                  {scope.contractCount === 1 ? 'contrato' : 'contratos'}
                </AppText>
              </View>
              {isSelected ? (
                <CheckCircleIcon
                  size={22}
                  color={theme.colors.navigation.active}
                  weight="fill"
                />
              ) : null}
            </Pressable>
          );
        })}
      </BottomSheetScrollView>
    </AppBottomSheetModal>
  );
};

const styles = StyleSheet.create(theme => ({
  heading: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  content: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  option: {
    minHeight: 70,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: theme.border.hairline,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.background.cards,
  },
  optionSelected: {
    borderColor: theme.colors.border.focus,
    backgroundColor: theme.colors.surface.background.submenu,
  },
  icon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface.background.elements,
  },
  optionCopy: { flex: 1, gap: theme.spacing.xs },
  pressed: { opacity: theme.opacity.pressed },
}));

export default CompanyScopeSheet;
