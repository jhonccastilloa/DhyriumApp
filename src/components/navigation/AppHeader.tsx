import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeftIcon } from 'phosphor-react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppText from '@/components/typography/AppText';

type AppHeaderProps = {
  title: string;
  eyebrow?: string;
  badge?: string;
  count?: number;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: ReactNode;
};

const AppHeader = ({
  title,
  eyebrow,
  badge,
  count,
  showBack = false,
  onBack,
  rightAction,
}: AppHeaderProps) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();
  const handleBack = () => {
    if (onBack) onBack();
    else if (navigation.canGoBack()) navigation.goBack();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.row}>
        {showBack ? (
          <Pressable
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            hitSlop={8}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
          >
            <ArrowLeftIcon
              size={22}
              color={theme.colors.icon.primary}
              weight="bold"
            />
          </Pressable>
        ) : null}
        <View style={styles.titleContainer}>
          {eyebrow ? (
            <AppText variant="overline" color="details" numberOfLines={1}>
              {eyebrow.toUpperCase()}
            </AppText>
          ) : null}
          <View style={styles.titleRow}>
            <AppText
              variant="title.xl"
              color="headings"
              numberOfLines={2}
              style={styles.title}
            >
              {title}
            </AppText>
            {typeof count === 'number' ? (
              <View style={styles.count}>
                <AppText variant="text.xs.bold" color="link">
                  {count}
                </AppText>
              </View>
            ) : null}
            {badge ? (
              <View style={styles.badge}>
                <AppText variant="text.xs.bold" color="link">
                  {badge}
                </AppText>
              </View>
            ) : null}
          </View>
        </View>
        {rightAction ? (
          <View style={styles.rightAction}>{rightAction}</View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create(theme => ({
  container: {
    backgroundColor: theme.colors.surface.background.cards,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: theme.border.hairline,
    borderBottomColor: theme.colors.border.subtle,
  },
  row: {
    minHeight: theme.control.height.default,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  backButton: {
    width: theme.control.hitSlop,
    height: theme.control.hitSlop,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface.background.elements,
  },
  pressed: { opacity: theme.opacity.pressed },
  titleContainer: { flex: 1, minWidth: 0 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  title: { flexShrink: 1 },
  count: {
    minWidth: 28,
    height: 24,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface.background.submenu,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    minHeight: 24,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface.background.submenu,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightAction: { marginLeft: theme.spacing.xs },
}));

export default AppHeader;
