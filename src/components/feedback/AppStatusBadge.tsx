import { View } from 'react-native';
import { StyleSheet, UnistylesVariants } from 'react-native-unistyles';
import AppText from '@/components/typography/AppText';

type AppStatusBadgeVariants = UnistylesVariants<typeof styles>;

export type AppStatusTone = NonNullable<AppStatusBadgeVariants['tone']>;

type AppStatusBadgeProps = AppStatusBadgeVariants & {
  label: string;
};

const AppStatusBadge = ({
  label,
  tone = 'neutral',
}: AppStatusBadgeProps) => {
  styles.useVariants({ tone });
  return (
    <View style={styles.container}>
      <View style={styles.dot} />
      <AppText variant="text.xs.bold" style={styles.text}>
        {label}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create(theme => ({
  container: {
    alignSelf: 'flex-start',
    minHeight: 26,
    paddingHorizontal: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    variants: {
      tone: {
        neutral: {
          backgroundColor: theme.colors.surface.background.elements,
        },
        info: { backgroundColor: theme.colors.surface.status.info },
        success: { backgroundColor: theme.colors.surface.status.success },
        warning: { backgroundColor: theme.colors.surface.status.warning },
        error: { backgroundColor: theme.colors.surface.status.error },
      },
    },
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: theme.radius.pill,
    variants: {
      tone: {
        neutral: { backgroundColor: theme.colors.text.details },
        info: { backgroundColor: theme.colors.text.link },
        success: { backgroundColor: theme.colors.text.success },
        warning: { backgroundColor: theme.colors.text.warning },
        error: { backgroundColor: theme.colors.text.error },
      },
    },
  },
  text: {
    variants: {
      tone: {
        neutral: { color: theme.colors.text.details },
        info: { color: theme.colors.text.link },
        success: { color: theme.colors.text.success },
        warning: { color: theme.colors.text.warning },
        error: { color: theme.colors.text.error },
      },
    },
  },
}));

export default AppStatusBadge;
