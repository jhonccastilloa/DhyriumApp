import FormField from '../FormField';
import { FormInputBase } from '../form.types';
import AppDateInput, { AppDateInputProps } from '@/components/inputs/input-date/AppDateInput';

interface FormDateInputProps extends AppDateInputProps, FormInputBase {
  flex?: number;
}
const FormDateInput = ({ name, label, flex, ...props }: FormDateInputProps) => {
  return (
    <FormField
      InputComponent={AppDateInput}
      name={name}
      label={label}
      InputComponentProps={props}
      flex={flex}
    />
  );
};

export default FormDateInput;
