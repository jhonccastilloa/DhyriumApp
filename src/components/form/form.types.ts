import { JSX } from 'react';

export type FormLabelContent = JSX.Element | string;

export interface FormInputBase {
  label?: string;
  name: string;
}
