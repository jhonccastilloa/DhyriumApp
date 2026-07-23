import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import AppTextInput, { AppTextInputProps } from '../AppTextInput';

export interface AppTextAreaInputProps extends AppTextInputProps {}

const AppTextAreaInput = ({
  multiline = true,
  numberOfLines = 4,
  style,
  inputStyle,
  containerStyle,
  iconContainerStyle,
  ...props
}: AppTextAreaInputProps) => {
  const { theme } = useUnistyles();
  const inputFontSize = theme.typography.text.md.regular.fontSize;
  const height = (numberOfLines + 1) * inputFontSize;

  return (
    <AppTextInput
      multiline={multiline}
      numberOfLines={numberOfLines}
      inputStyle={[styles.input, { height }, style, inputStyle]}
      containerStyle={[styles.container, containerStyle]}
      iconContainerStyle={[{ top: inputFontSize / 7 }, iconContainerStyle]}
      {...props}
    />
  );
};

const styles = StyleSheet.create(theme => ({
  input: {
    textAlignVertical: 'top',
  },
  container: {
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.sm,
  },
}));

export default AppTextAreaInput;
