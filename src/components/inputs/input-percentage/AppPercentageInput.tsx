import React from 'react';
import AppTextInput, { AppTextInputProps } from '../AppTextInput';
import { REGEX_ONLY_DIGITS } from '@/utils/regex';

export interface AppPercentageInputProps extends AppTextInputProps {}

const AppPercentageInput = ({
  onChangeValue,
  ...props
}: AppPercentageInputProps) => {
  const handleChange = (numericText: string) => {
    const num = parseInt(numericText, 10);

    if ((numericText === '' || (!isNaN(num) && num <= 100)) && num !== 0) {
      onChangeValue?.(numericText);
    }
  };
  return (
    <AppTextInput
      keyboardType="numeric"
      allowedRegex={REGEX_ONLY_DIGITS}
      iconRight="percent"
      {...props}
      onChangeValue={handleChange}
    />
  );
};

export default AppPercentageInput;
