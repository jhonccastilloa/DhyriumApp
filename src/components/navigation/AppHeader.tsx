import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppIcon from '@/components/icons/AppIcon';
import AppFlex from '@/components/layout/AppFlex';
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
    <AppFlex
      ph="md"
      pb="md"
      style={[styles.container, { paddingTop: insets.top + 8 }]}
    >
      <AppFlex direction="row" align="center" gap="sm" style={styles.row}>
        {showBack ? (
          <Pressable
            onPress={handleBack}
            hitSlop={8}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
          >
            <AppIcon
              name="arrowLeft"
              size={22}
              mColor={theme.colors.icon.primary}
            />
          </Pressable>
        ) : null}
        <AppFlex flex={1} style={styles.titleContainer}>
          {eyebrow ? (
            <AppText variant="overline" color="details" numberOfLines={1}>
              {eyebrow.toUpperCase()}
            </AppText>
          ) : null}
          <AppFlex direction="row" align="center" gap="sm">
            <AppText
              variant="title.xl"
              color="headings"
              numberOfLines={2}
              style={styles.title}
            >
              {title}
            </AppText>
            {typeof count === 'number' ? (
              <AppFlex
                height={24}
                ph="sm"
                align="center"
                justify="center"
                style={styles.count}
              >
                <AppText variant="text.xs.bold" color="link">
                  {count}
                </AppText>
              </AppFlex>
            ) : null}
            {badge ? (
              <AppFlex
                ph="sm"
                align="center"
                justify="center"
                style={styles.badge}
              >
                <AppText variant="text.xs.bold" color="link">
                  {badge}
                </AppText>
              </AppFlex>
            ) : null}
          </AppFlex>
        </AppFlex>
        {rightAction ? (
          <View style={styles.rightAction}>{rightAction}</View>
        ) : null}
      </AppFlex>
    </AppFlex>
  );
};

const styles = StyleSheet.create(theme => ({
  container: {
    backgroundColor: theme.colors.surface.background.cards,
    borderBottomWidth: theme.border.hairline,
    borderBottomColor: theme.colors.border.subtle,
  },
  row: { minHeight: theme.control.height.default },
  backButton: {
    width: theme.control.hitSlop,
    height: theme.control.hitSlop,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface.background.elements,
  },
  pressed: { opacity: theme.opacity.pressed },
  titleContainer: { minWidth: 0 },
  title: { flexShrink: 1 },
  count: {
    minWidth: 28,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface.background.submenu,
  },
  badge: {
    minHeight: 24,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface.background.submenu,
  },
  rightAction: { marginLeft: theme.spacing.xs },
}));

export default AppHeader;
