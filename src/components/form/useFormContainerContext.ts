import { FormContainerContext } from './FormContainer';
import { use } from 'react';
import { FieldValues, useFormContext } from 'react-hook-form';

// Hook personalizado para usar el contexto
export function useFormContainerContext<FormData extends FieldValues>() {
  const rhfContext = useFormContext<FormData>();
  const context = use(FormContainerContext);
  if (!context) {
    return { schema: null, onSubmit: () => {}, ...rhfContext };
  }

  return { ...context, ...rhfContext };
}
