import FormField from '../FormField';
import { FormInputBase } from '../form.types';
import AppAmountInput, { AppAmountInputProps } from '@/components/inputs/input-amount/AppAmountInput';

interface FormAmountInputProps extends AppAmountInputProps, FormInputBase {
  flex?: number;
}
const FormAmountInput = ({
  name,
  label,
  flex,
  ...props
}: FormAmountInputProps) => {
  return (
    <FormField
      InputComponent={AppAmountInput}
      name={name}
      label={label}
      InputComponentProps={props}
      flex={flex}
    />
  );
};

export default FormAmountInput;
