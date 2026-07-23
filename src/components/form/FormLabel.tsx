import AppLabel from '../typography/AppLabel';
import { FormLabelContent } from './form.types';

interface FormLabelProps {
  label?: FormLabelContent;
}
const FormLabel = ({ label }: FormLabelProps) => {
  if (!label) return null;
  if (typeof label === 'string') return <AppLabel>{label}</AppLabel>;
  return label;
};

export default FormLabel;
