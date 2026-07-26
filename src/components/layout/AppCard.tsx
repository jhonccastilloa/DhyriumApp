import type { PropsWithChildren } from 'react';
import {
  Pressable,
  type PressableProps,
  View,
  type ViewProps,
} from 'react-native';
import { StyleSheet, UnistylesVariants } from 'react-native-unistyles';

type AppCardVariants = Omit<
  UnistylesVariants<typeof styles>,
  'emphasized'
> & {
  emphasized?: boolean;
};

type AppCardProps = PropsWithChildren<
  (PressableProps | ViewProps) & {
    onPress?: PressableProps['onPress'];
    disabled?: boolean;
  } & AppCardVariants
>;

const AppCard = ({
  children,
  style,
  onPress,
  emphasized = false,
  disabled = false,
  ...props
}: AppCardProps) => {
  styles.useVariants({ emphasized });
  if (!onPress) {
    const viewStyle =
      typeof style === 'function' ? style({ pressed: false }) : style;
    return (
      <View {...(props as ViewProps)} style={[styles.card, viewStyle]}>
        {children}
      </View>
    );
  }
  return (
    <Pressable
      {...(props as PressableProps)}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
        typeof style === 'function' ? style({ pressed }) : style,
      ]}
    >
      {children}
    </Pressable>
  );
};

const styles = StyleSheet.create(theme => ({
  card: {
    backgroundColor: theme.colors.surface.background.cards,
    borderRadius: theme.radius.md,
    borderWidth: theme.border.hairline,
    borderColor: theme.colors.border.subtle,
    variants: {
      emphasized: {
        true: {
          borderColor: theme.colors.border.focus,
        },
      },
    },
  },
  pressed: {
    opacity: theme.opacity.pressed,
  },
}));

export default AppCard;
