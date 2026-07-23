import { FormInputBase } from '../form.types';
import AppPercentageInput, {
  AppPercentageInputProps,
} from '@/components/inputs/input-percentage/AppPercentageInput';
import FormField from '../FormField';

interface FormPercentageInputProps
  extends AppPercentageInputProps,
    FormInputBase {
  flex?: number;
}
const FormPercentageInput = ({
  name,
  label,
  flex,
  ...props
}: FormPercentageInputProps) => {
  return (
    <FormField
      InputComponent={AppPercentageInput}
      name={name}
      label={label}
      InputComponentProps={props}
      flex={flex}
    />
  );
};

export default FormPercentageInput;
