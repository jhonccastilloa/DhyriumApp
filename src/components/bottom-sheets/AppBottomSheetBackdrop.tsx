import { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { BottomSheetDefaultBackdropProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types';

interface AppBottomSheetBackdropProps extends BottomSheetDefaultBackdropProps {}

const AppBottomSheetBackdrop = ({ ...props }: AppBottomSheetBackdropProps) => {
  return (
    <BottomSheetBackdrop
      disappearsOnIndex={-1}
      opacity={0.5}
      pressBehavior="close"
      {...props}
    />
  );
};

export default AppBottomSheetBackdrop;
