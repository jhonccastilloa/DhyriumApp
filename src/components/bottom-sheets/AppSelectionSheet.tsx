import { RefObject, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { BottomSheetFlatList, BottomSheetModal } from '@gorhom/bottom-sheet';
import { StyleSheet } from 'react-native-unistyles';
import AppFlex from '../layout/AppFlex';
import AppIcon from '../icons/AppIcon';
import AppTextInput from '../inputs/AppTextInput';
import AppText from '../typography/AppText';
import AppBottomSheetModal from './AppBottomSheetModal';

const AppSelectionSheetItemSeparator = () => <AppFlex pb="sm" />;

export type AppSelectionSheetProps<T> = {
  title: string;
  options: T[];
  value: T;
  onChangeValue: (value: T) => void;
  ref: RefObject<BottomSheetModal | null>;
  keyExtractor: (item: T) => string;
  labelExtractor: (item: T) => string;
  searchable?: boolean;
  searchPlaceholder?: string;
};

const AppSelectionSheet = <T,>({
  title,
  options,
  value,
  onChangeValue,
  keyExtractor,
  labelExtractor,
  ref,
  searchable = false,
  searchPlaceholder = 'Buscar',
}: AppSelectionSheetProps<T>) => {
  const [search, setSearch] = useState('');

  const filteredOptions = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();

    if (!searchable || !normalizedSearch) {
      return options;
    }

    return options.filter(option => {
      const label = labelExtractor(option).toLocaleLowerCase();
      const key = keyExtractor(option).toLocaleLowerCase();

      return label.includes(normalizedSearch) || key.includes(normalizedSearch);
    });
  }, [keyExtractor, labelExtractor, options, search, searchable]);

  const close = () => {
    setSearch('');
    ref.current?.dismiss();
  };

  const selectOption = (item: T) => {
    onChangeValue(item);
    close();
  };

  return (
    <AppBottomSheetModal
      ref={ref}
      enablePanDownToClose
      handleComponent={null}
      onDismiss={() => setSearch('')}
    >
      <BottomSheetFlatList
        data={filteredOptions}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <AppFlex
              direction="row"
              align="center"
              justify="space-between"
              pb="md"
            >
              <AppText variant="title.m" color="headings">
                {title}
              </AppText>
              <AppIcon name="close" size="sm" onPress={close} />
            </AppFlex>

            {searchable ? (
              <AppFlex pb="md">
                <AppTextInput
                  iconLeft="search"
                  onChangeValue={setSearch}
                  placeholder={searchPlaceholder}
                  value={search}
                  autoCorrect={false}
                  autoCapitalize="none"
                  returnKeyType="search"
                />
              </AppFlex>
            ) : null}
          </>
        }
        ListEmptyComponent={
          <AppText variant="text.sm.regular" color="details">
            No se encontraron opciones.
          </AppText>
        }
        ItemSeparatorComponent={AppSelectionSheetItemSeparator}
        renderItem={({ item }) => {
          const isSelected = keyExtractor(item) === keyExtractor(value);

          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              onPress={() => selectOption(item)}
              style={({ pressed }) => [
                styles.option,
                pressed && styles.pressed,
              ]}
            >
              <View
                style={[styles.radio, isSelected && styles.radioSelected]}
              />
              <AppText variant="text.md.regular" color="body">
                {labelExtractor(item)}
              </AppText>
            </Pressable>
          );
        }}
      />
    </AppBottomSheetModal>
  );
};

export default AppSelectionSheet;

const styles = StyleSheet.create(theme => ({
  listContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  option: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 44,
  },
  pressed: {
    opacity: theme.opacity.pressed,
  },
  radio: {
    width: theme.icon.size.xs,
    height: theme.icon.size.xs,
    borderRadius: theme.icon.size.xs / 2,
    borderWidth: 2,
    borderColor: theme.colors.button.border,
    marginRight: theme.spacing.sm,
  },
  radioSelected: {
    borderColor: theme.colors.button.fill.primary,
    backgroundColor: theme.colors.button.fill.primary,
  },
}));
