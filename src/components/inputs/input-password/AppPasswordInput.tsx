import { useState } from 'react';
import AppTextInput, { AppTextInputProps } from '../AppTextInput';

export interface AppPasswordInputProps
  extends Omit<
    AppTextInputProps,
    | 'secureTextEntry'
    | 'iconRight'
    | 'onPressInRight'
  > {}

const AppPasswordInput = ({
  iconSize = 'sm',
  ...props
}: AppPasswordInputProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(value => !value);
  };

  return (
    <AppTextInput
      {...props}
      secureTextEntry={!isVisible}
      iconRight={isVisible ? 'eyeSlash' : 'eye'}
      iconSize={iconSize}
      onPressInRight={toggleVisibility}
    />
  );
};

export default AppPasswordInput;
