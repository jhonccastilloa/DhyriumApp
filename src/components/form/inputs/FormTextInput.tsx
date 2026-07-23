import { FormInputBase } from '../form.types';
import AppTextInput, { AppTextInputProps } from '@/components/inputs/AppTextInput';
import FormField from '../FormField';

interface FormTextInputProps extends AppTextInputProps, FormInputBase {
  flex?: number;
}
const FormTextInput = ({
  name,
  label,
  flex,
  ...inputFormProps
}: FormTextInputProps) => {
  return (
    <FormField
      name={name}
      label={label}
      flex={flex}
      InputComponent={AppTextInput}
      InputComponentProps={inputFormProps}
    />
  );
};

export default FormTextInput;
