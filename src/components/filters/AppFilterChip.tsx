import { Pressable } from 'react-native';
import {
  StyleSheet,
  UnistylesVariants,
  useUnistyles,
} from 'react-native-unistyles';
import AppIcon from '@/components/icons/AppIcon';
import AppText from '@/components/typography/AppText';

type AppFilterChipVariants = UnistylesVariants<typeof styles>;

type AppFilterChipProps = Omit<AppFilterChipVariants, 'selected'> & {
  label: string;
  selected?: boolean;
  removable?: boolean;
  onPress: () => void;
};

const AppFilterChip = ({
  label,
  selected = false,
  removable = false,
  onPress,
}: AppFilterChipProps) => {
  const { theme } = useUnistyles();
  styles.useVariants({ selected });
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        pressed && styles.pressed,
      ]}
    >
      <AppText variant="text.sm.bold" style={styles.label} numberOfLines={1}>
        {label}
      </AppText>
      {removable ? (
        <AppIcon
          name="close"
          size={14}
          mColor={
            selected
              ? theme.colors.navigation.active
              : theme.colors.icon.secondary
          }
        />
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create(theme => ({
  chip: {
    minHeight: 36,
    maxWidth: 220,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    borderWidth: theme.border.hairline,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.surface.background.cards,
    variants: {
      selected: {
        true: {
          borderColor: theme.colors.border.focus,
          backgroundColor: theme.colors.surface.background.submenu,
        },
      },
    },
  },
  label: {
    color: theme.colors.text.body,
    variants: {
      selected: {
        true: { color: theme.colors.text.link },
      },
    },
  },
  pressed: { opacity: theme.opacity.pressed },
}));

export default AppFilterChip;
