import React, { ComponentType } from 'react';
import { Controller } from 'react-hook-form';
import FormLabel from './FormLabel';
import FormErrorText from './FormErrorText';
import { useFormContainerContext } from './useFormContainerContext';
import { FormInputBase } from './form.types';
import AppFlex from '../layout/AppFlex';

interface FormFieldProps<InputProps extends object>
  extends FormInputBase {
  InputComponent: ComponentType<InputProps>;
  InputComponentProps: InputProps;
  flex?: number;
}

const FormField = <InputProps extends object>({
  label,
  name,
  InputComponent,
  InputComponentProps,
  flex = 0,
}: FormFieldProps<InputProps>) => {
  const { control } = useFormContainerContext();
  return (
    <AppFlex flex={flex} gap="sm">
      <FormLabel label={label} />
      {control ? (
        <Controller
          name={name}
          control={control}
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <>
              <InputComponent
                {...InputComponentProps}
                onBlur={onBlur}
                onChangeValue={onChange}
                value={value}
              />
              <FormErrorText message={error?.message} />
            </>
          )}
        />
      ) : (
        <InputComponent {...InputComponentProps} />
      )}
    </AppFlex>
  );
};

// const styles = StyleSheet.create({});

export default FormField;
