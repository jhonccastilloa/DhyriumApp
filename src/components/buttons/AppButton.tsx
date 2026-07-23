import React, { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { IconName } from '../icons/iconRegistry';
import { IconSizeTheme } from '@/styles/theme/tokens';
import AppIcon from '../icons/AppIcon';

export type ButtonSize = 'md' | 'sm' | 'action';
export type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'link';
export type ButtonAlignment = 'left' | 'right' | 'center' | 'full';

export interface AppButtonProps extends PressableProps {
  text?: string;
  children?: ReactNode;
  leftIcon?: IconName;
  rightIcon?: IconName;
  iconSize?: IconSizeTheme;
  textStyle?: StyleProp<TextStyle>;
  iconContainerStyle?: StyleProp<ViewStyle>;
  size?: ButtonSize;
  variant?: ButtonVariant;
  align?: ButtonAlignment;
  noBorder?: boolean;
  isLoading?: boolean;
}

export function AppButton({
  text,
  children,
  leftIcon,
  rightIcon,
  iconSize,
  textStyle,
  iconContainerStyle,
  size = 'md',
  variant = 'solid',
  align = 'full',
  noBorder = false,
  isLoading = false,
  disabled,
  style,
  ...props
}: AppButtonProps) {
  const isDisabled = Boolean(disabled || isLoading);

  styles.useVariants({
    size,
    variant,
    align,
    noBorder,
    disabled: isDisabled,
  });

  return (
    <Pressable
      {...props}
      disabled={isDisabled}
      accessibilityRole={props.accessibilityRole ?? 'button'}
      accessibilityState={{ disabled: isDisabled }}
      style={({ pressed }) => [
        styles.button,
        pressed && !isDisabled && styles.pressed,
        typeof style === 'function' ? style({ pressed }) : style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={styles.content.color} />
      ) : (
        <>
          {leftIcon ? (
            <View style={[styles.iconLeft, iconContainerStyle]}>
              <AppIcon
                name={leftIcon}
                size={iconSize}
                mColor={styles.content.color}
              />
            </View>
          ) : null}

          {children ?? (
            <Text style={[styles.content, textStyle]} numberOfLines={1}>
              {text}
            </Text>
          )}

          {rightIcon ? (
            <View style={[styles.iconRight, iconContainerStyle]}>
              <AppIcon
                name={rightIcon}
                size={iconSize}
                mColor={styles.content.color}
              />
            </View>
          ) : null}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create(theme => ({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    variants: {
      size: {
        md: {
          minHeight: 52,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.radius.pill,
        },
        sm: {
          minHeight: 32,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radius.pill,
        },
        action: {
          width: 54,
          height: 54,
          borderRadius: theme.radius.pill,
          paddingHorizontal: 0,
        },
      },
      variant: {
        solid: {
          backgroundColor: theme.colors.button.fill.primary,
        },
        outline: {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.button.border,
        },
        ghost: {
          backgroundColor: theme.colors.button.fill.secondary,
        },
        link: {
          backgroundColor: 'transparent',
          paddingHorizontal: 0,
          minHeight: 0,
        },
      },
      align: {
        left: {
          alignSelf: 'flex-start',
        },
        right: {
          alignSelf: 'flex-end',
        },
        center: {
          alignSelf: 'center',
        },
        full: {
          width: '100%',
        },
      },
      noBorder: {
        true: {
          borderWidth: 0,
          borderRadius: theme.radius.none,
        },
      },
      disabled: {
        true: {
          opacity: theme.opacity.disabled,
        },
      },
    },
  },
  pressed: {
    opacity: theme.opacity.pressed,
  },
  content: {
    color: theme.colors.text.button,
    textAlign: 'center',

    variants: {
      size: {
        md: {
          ...theme.typography.button,
        },
        sm: {
          ...theme.typography.actionButton,
        },
        action: {
          ...theme.typography.actionButton,
        },
      },
      variant: {
        outline: {
          color: theme.colors.text.link,
        },
        ghost: {
          color: theme.colors.text.body,
        },
        link: {
          color: theme.colors.text.link,
          textDecorationLine: 'none',
        },
      },
      disabled: {
        true: {
          color: theme.colors.text.disabled,
        },
      },
    },
  },
  iconLeft: {
    marginRight: theme.spacing.sm,
  },
  iconRight: {
    marginLeft: theme.spacing.sm,
  },
}));
