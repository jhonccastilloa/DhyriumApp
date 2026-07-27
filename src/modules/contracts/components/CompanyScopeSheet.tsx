import { useMemo, useState, type RefObject } from 'react';
import { Pressable } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import AppBottomSheetModal from '@/components/bottom-sheets/AppBottomSheetModal';
import AppIcon from '@/components/icons/AppIcon';
import AppSearchInput from '@/components/inputs/AppSearchInput';
import AppFlex from '@/components/layout/AppFlex';
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
      <AppFlex ph="md" pb="md" gap="sm">
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
      </AppFlex>
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
              <AppFlex
                size={40}
                align="center"
                justify="center"
                style={styles.icon}
              >
                <AppIcon
                  name="buildings"
                  size={22}
                  mColor={
                    isSelected
                      ? theme.colors.navigation.active
                      : theme.colors.icon.secondary
                  }
                />
              </AppFlex>
              <AppFlex flex={1} gap="xs">
                <AppText variant="text.md.bold" color="headings">
                  {scope.name}
                </AppText>
                <AppText variant="text.xs.regular" color="details">
                  {scope.type === 'company' ? 'Empresa' : 'Consorcio'} ·{' '}
                  {scope.contractCount}{' '}
                  {scope.contractCount === 1 ? 'contrato' : 'contratos'}
                </AppText>
              </AppFlex>
              {isSelected ? (
                <AppIcon
                  name="checkCircle"
                  size={22}
                  mColor={theme.colors.navigation.active}
                  variant="active"
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
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface.background.elements,
  },
  pressed: { opacity: theme.opacity.pressed },
}));

export default CompanyScopeSheet;
