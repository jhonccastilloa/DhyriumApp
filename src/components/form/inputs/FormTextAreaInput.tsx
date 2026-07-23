import React from 'react';
import { FormInputBase } from '../form.types';
import FormField from '../FormField';
import AppTextAreaInput, {
  AppTextAreaInputProps,
} from '@/components/inputs/input-text-area/AppTextAreaInput';

interface FormTextAreaInputProps extends AppTextAreaInputProps, FormInputBase {
  flex?: number;
}

const FormTextAreaInput = ({
  name,
  label,
  flex,
  ...textAreaProps
}: FormTextAreaInputProps) => {
  return (
    <FormField
      name={name}
      label={label}
      flex={flex}
      InputComponent={AppTextAreaInput}
      InputComponentProps={textAreaProps}
    />
  );
};

export default FormTextAreaInput;
