import {
  View,
  TextInput,
  TextInputProps,
  ViewStyle,
  TouchableOpacity,
  StyleProp,
  TextStyle,
} from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import AppIcon from '../icons/AppIcon';
import { IconName } from '../icons/iconRegistry';
import { IconSizeTheme } from '@/styles/theme/tokens';
import { IconColorTheme } from '@/styles/theme/semanticColors';

export interface AppTextInputProps extends TextInputProps {
  allowedRegex?: RegExp;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  onChangeValue?: (value: string) => void;
  noBorder?: boolean;
  shadow?: boolean;
  iconLeft?: IconName;
  iconRight?: IconName;
  iconSize?: IconSizeTheme;
  iconColor?: IconColorTheme;
  onPressInRight?: () => void;
  iconContainerStyle?: StyleProp<ViewStyle>;
}

const AppTextInput = ({
  allowedRegex,
  onChangeValue,
  onPressInRight,
  iconLeft,
  iconRight,
  iconSize,
  iconColor,
  containerStyle,
  inputStyle,
  noBorder,
  shadow,
  iconContainerStyle,
  placeholder,
  ...props
}: AppTextInputProps) => {
  styles.useVariants({
    noBorder,
    shadow,
  });

  const onChange = (text: string) => {
    const nextText = allowedRegex ? text.replace(allowedRegex, '') : text;
    onChangeValue?.(nextText);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {iconLeft ? (
        <View style={[styles.iconLeft, iconContainerStyle]}>
          <AppIcon name={iconLeft} size={iconSize} color={iconColor} />
        </View>
      ) : null}

      <TextInput
        {...props}
        style={[styles.textInput, inputStyle]}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={styles.placeholder.color}
      />

      {iconRight ? (
        <TouchableOpacity
          onPress={onPressInRight}
          style={[styles.iconRight, iconContainerStyle]}
        >
          <AppIcon name={iconRight} size={iconSize} color={iconColor} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default AppTextInput;

const styles = StyleSheet.create(theme => ({
  container: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.xs,
    backgroundColor: theme.colors.surface.background.cards,
    borderWidth: 1,
    borderColor: theme.colors.button.border,

    variants: {
      noBorder: {
        true: {
          borderTopWidth: 0,
          borderLeftWidth: 0,
          borderRightWidth: 0,
          borderRadius: theme.radius.none,
          backgroundColor: 'transparent',
        },
      },
      shadow: {
        true: {
          shadowColor: theme.colors.surface.background.primary,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.18,
          shadowRadius: 1,
          elevation: 1,
        },
      },
    },
  },
  textInput: {
    flex: 1,
    padding: 0,
    color: theme.colors.text.body,
    ...theme.typography.text.md.regular,
  },
  placeholder: {
    color: theme.colors.text.details,
  },
  icon: {
    color: theme.colors.icon.secondary,
  },
  iconLeft: {
    marginRight: theme.spacing.sm,
  },
  iconRight: {
    marginLeft: theme.spacing.sm,
  },
}));
