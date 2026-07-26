import type { StyleProp, ViewStyle } from 'react-native';
import { FieldValues, FormProvider, UseFormReturn } from 'react-hook-form';
import { ZodObject, ZodRawShape } from 'zod';
import { createContext, ReactNode } from 'react';
import AppFlex, { AppFlexProps } from '../layout/AppFlex';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

export interface FormContainerContextInterface {
  schema?: ZodRawShape;
  onSubmit: () => void;
}

export const FormContainerContext =
  createContext<FormContainerContextInterface | null>(null);

type FormContainerProps<FormData extends FieldValues> = AppFlexProps & {
  form: UseFormReturn<FormData>;
  schema?: ZodObject<ZodRawShape>;
  onSubmit: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  keyboardAware?: boolean;
};
const FormContainer = <FormData extends FieldValues>({
  form,
  onSubmit,
  children,
  keyboardAware = false,
  schema,
  ...props
}: FormContainerProps<FormData>) => {
  return (
    <FormProvider {...form}>
      <FormContainerContext.Provider
        value={{
          schema: schema?.shape,
          onSubmit,
        }}
      >
        {keyboardAware ? (
          <KeyboardAwareScrollView>
            <AppFlex gap="sm" width={'100%'} {...props}>
              {children}
            </AppFlex>
          </KeyboardAwareScrollView>
        ) : (
          <AppFlex gap="sm" width={'100%'} {...props}>
            {children}
          </AppFlex>
        )}
      </FormContainerContext.Provider>
    </FormProvider>
  );
};

export default FormContainer;
