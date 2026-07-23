import React, { useRef } from 'react';
import AppOptionItem, {
  AppOptionItemProps,
} from '@/components/options/AppOptionItem';
import AppSelectionSheet, {
  AppSelectionSheetProps,
} from '@/components/bottom-sheets/AppSelectionSheet';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

interface AppSelectionSheetInputProps<T>
  extends Omit<AppOptionItemProps, 'onPress'>,
    Omit<AppSelectionSheetProps<T>, 'ref'> {}
const AppSelectionSheetInput = <T,>({
  iconLeft,
  iconRight,
  title,
  description,
  options,
  value,
  onChangeValue,
  keyExtractor,
  labelExtractor,
  searchable,
  searchPlaceholder,
}: AppSelectionSheetInputProps<T>) => {
  const selectionSheetRef = useRef<BottomSheetModal>(null);

  return (
    <>
      <AppOptionItem
        title={title}
        description={description}
        iconLeft={iconLeft}
        iconRight={iconRight}
        onPress={() => {
          selectionSheetRef.current?.present();
        }}
      />
      <AppSelectionSheet
        ref={selectionSheetRef}
        title={title}
        options={options}
        value={value}
        onChangeValue={onChangeValue}
        keyExtractor={keyExtractor}
        labelExtractor={labelExtractor}
        searchable={searchable}
        searchPlaceholder={searchPlaceholder}
      />
    </>
  );
};

export default AppSelectionSheetInput;
