import { View } from 'react-native';
import React, { ComponentType } from 'react';
import { Controller } from 'react-hook-form';
import FormLabel from './FormLabel';
import FormErrorText from './FormErrorText';
import { _ZodType } from 'zod';
import { useFormContainerContext } from './useFormContainerContext';
import { FormInputBase } from './form.types';

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
  const { control, schema } = useFormContainerContext();

  const isRequired = (fieldName: string) => {
    if (!schema) return false;
    const field = schema[fieldName] as _ZodType | undefined;
    if (!field) return false;
    return !field.isOptional() && !field.isNullable?.();
  };
  const required = isRequired(name);
  console.log('asd', required);
  return (
    <View style={{ flex }}>
      <FormLabel
        label={label ? `${required ? '*' : ''} ${label}` : undefined}
      />
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
    </View>
  );
};

// const styles = StyleSheet.create({});

export default FormField;
