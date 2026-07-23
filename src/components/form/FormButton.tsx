import { useFormContainerContext } from './useFormContainerContext';
import { AppButton, AppButtonProps } from '../buttons/AppButton';

interface FormButtonProps extends AppButtonProps {
  evaluateDirty?: boolean;
}

const FormButton = ({
  evaluateDirty = false,
  isLoading,
  disabled,
  ...props
}: FormButtonProps) => {
  const { onSubmit, formState } = useFormContainerContext();

  return (
    <AppButton
      onPress={onSubmit}
      text="Guardar"
      disabled={
        disabled ||
        (evaluateDirty && !formState.isDirty) ||
        formState.isSubmitting
      }
      isLoading={isLoading ?? formState.isSubmitting}
      {...props}
    />
  );
};

export default FormButton;
