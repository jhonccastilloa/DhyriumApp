import { FormInputBase } from '../form.types';
import FormField from '../FormField';
import AppPasswordInput, {
  AppPasswordInputProps,
} from '@/components/inputs/input-password/AppPasswordInput';

interface FormPasswordInputProps extends AppPasswordInputProps, FormInputBase {
  flex?: number;
}

const FormPasswordInput = ({
  name,
  label,
  flex,
  ...passwordInputProps
}: FormPasswordInputProps) => {
  return (
    <FormField
      name={name}
      label={label}
      flex={flex}
      InputComponent={AppPasswordInput}
      InputComponentProps={passwordInputProps}
    />
  );
};

export default FormPasswordInput;
