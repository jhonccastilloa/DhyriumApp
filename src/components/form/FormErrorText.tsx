import AppErrorText from '../feedback/AppErrorText';

export interface FormErrorTextProps {
  message?: string;
}

const FormErrorText = ({ message }: FormErrorTextProps) => {
  if (!message) return null;
  return (
    <AppErrorText>
      {message === 'Required' ? 'validation.required' : message}
    </AppErrorText>
  );
};

export default FormErrorText;
