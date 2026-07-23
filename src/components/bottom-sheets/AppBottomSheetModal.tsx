import React, { RefObject } from 'react';
import { BottomSheetModal, BottomSheetModalProps } from '@gorhom/bottom-sheet';
import AppBottomSheetBackdrop from './AppBottomSheetBackdrop';
import { useUnistyles } from 'react-native-unistyles';

interface AppBottomSheetModalProps extends BottomSheetModalProps {
  ref: RefObject<BottomSheetModal | null>;
}
const AppBottomSheetModal = ({ ...props }: AppBottomSheetModalProps) => {
  const { theme } = useUnistyles();

  return (
    <BottomSheetModal
      backgroundStyle={{
        backgroundColor: theme.colors.surface.background.cards,
      }}
      backdropComponent={AppBottomSheetBackdrop}
      handleIndicatorStyle={{ backgroundColor: theme.colors.icon.secondary }}
      {...props}
    />
  );
};

export default AppBottomSheetModal;
