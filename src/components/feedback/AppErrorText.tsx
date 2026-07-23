import React from 'react';
import AppText, { AppTextProps } from '../typography/AppText';

interface AppErrorTextProps extends AppTextProps {}

const AppErrorText = ({ children, ...props }: AppErrorTextProps) => {
  return (
    <AppText variant="text.sm.bold" color="error" {...props}>
      {children}
    </AppText>
  );
};

export default AppErrorText;
