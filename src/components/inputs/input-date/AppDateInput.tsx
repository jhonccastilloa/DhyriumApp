import DateTimePicker, {
  DateTimePickerProps,
} from 'react-native-modal-datetime-picker';
import { Pressable } from 'react-native';
import { useState } from 'react';
import dayjsSpanish, {
  formatDateUtc,
  formatTimeHoursUtc,
} from '@/utils/dayjsSpanish';
import AppTextInput from '../AppTextInput';
import { IconBaseProps } from '@/components/icons/icon.types';

type CustomDateTimePickerProps = Omit<
  DateTimePickerProps,
  'onConfirm' | 'onCancel'
>;
export interface AppDateInputProps
  extends CustomDateTimePickerProps,
    IconBaseProps {
  onChangeValue?: (date: Date) => void;
  value?: Date | null;
}
const AppDateInput = ({
  onChangeValue,
  value,
  iconColor,
  iconLeft,
  iconRight,
  iconSize,
  mode = 'date',
  ...props
}: AppDateInputProps) => {
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onShowDatePicker = () => {
    setShowTimePicker(prev => !prev);
  };

  const changeDate = (date: Date) => {
    onChangeValue?.(date);
    onShowDatePicker();
  };

  const isTime = mode === 'time';

  return (
    <Pressable onPress={onShowDatePicker}>
      <AppTextInput
        editable={false}
        placeholder={isTime ? 'hh:mm' : 'dd/mm/yyyy'}
        value={
          value
            ? isTime
              ? formatTimeHoursUtc(value)
              : formatDateUtc(value)
            : ''
        }
        {...{
          iconColor,
          iconLeft,
          iconRight: iconRight || (isTime ? 'clock' : 'calendarBlank'),
          onPressInRight: onShowDatePicker,
          iconSize,
        }}
      />
      <DateTimePicker
        date={value ? dayjsSpanish(value).toDate() : undefined}
        isVisible={showTimePicker}
        mode={mode}
        {...props}
        onConfirm={date => changeDate(date)}
        onCancel={onShowDatePicker}
      />
    </Pressable>
  );
};

export default AppDateInput;
