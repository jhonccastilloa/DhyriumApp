import { ReactElement } from 'react';
import { Pressable, PressableProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import AppIcon from '../icons/AppIcon';
import { IconName } from '../icons/iconRegistry';
import AppFlex from '../layout/AppFlex';
import AppText from '../typography/AppText';

export interface AppOptionItemProps
  extends Omit<PressableProps, 'children'> {
  iconLeft?: IconName | ReactElement;
  title: string;
  description?: string;
  iconRight?: IconName;
}

const AppOptionItem = ({
  title,
  description,
  iconLeft,
  iconRight = 'caretRight',
  onPress,
  disabled,
  style,
  ...pressableProps
}: AppOptionItemProps) => {
  const isDisabled = Boolean(disabled || !onPress);

  return (
    <Pressable
      {...pressableProps}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole={pressableProps.accessibilityRole ?? 'button'}
      accessibilityState={{
        ...pressableProps.accessibilityState,
        disabled: isDisabled,
      }}
      style={({ pressed }) => [
        styles.container,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        typeof style === 'function' ? style({ pressed }) : style,
      ]}
    >
      <AppFlex direction="row" align="center" gap="sm">
        {iconLeft ? (
          typeof iconLeft === 'string' ? (
            <AppIcon
              name={iconLeft}
              color={isDisabled ? 'disabled' : 'primary'}
              size="sm"
            />
          ) : (
            iconLeft
          )
        ) : null}

        <AppFlex flex={1} gap="xs">
          <AppText variant="text.md.regular" color="headings" text={title} />
          {description ? (
            <AppText
              variant="text.sm.regular"
              color="details"
              text={description}
            />
          ) : null}
        </AppFlex>

        {iconRight ? (
          <AppIcon
            name={iconRight}
            color={isDisabled ? 'disabled' : 'secondary'}
            size="sm"
          />
        ) : null}
      </AppFlex>
    </Pressable>
  );
};

const styles = StyleSheet.create(theme => ({
  container: {
    width: '100%',
    minHeight: 56,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.xs,
    backgroundColor: theme.colors.surface.background.cards,
  },
  pressed: {
    opacity: theme.opacity.pressed,
  },
  disabled: {
    opacity: theme.opacity.disabled,
  },
}));

export default AppOptionItem;
