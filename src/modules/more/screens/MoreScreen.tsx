import { Alert, Pressable, ScrollView, View } from 'react-native';
import {
  CheckIcon,
  DesktopIcon,
  MoonIcon,
  SignOutIcon,
  SunIcon,
} from 'phosphor-react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from '@/components/navigation/AppHeader';
import AppText from '@/components/typography/AppText';
import AppCard from '@/components/layout/AppCard';
import { useProfileQuery } from '@/modules/profile/queries/useProfileQuery';
import { useAuthStore } from '@/modules/auth/state/useAuthStore';
import {
  type ThemePreference,
  useThemePreferenceStore,
} from '@/styles/themePreference';

const THEME_OPTIONS = [
  { value: 'light' as const, label: 'Claro', icon: SunIcon },
  { value: 'dark' as const, label: 'Oscuro', icon: MoonIcon },
  { value: 'system' as const, label: 'Sistema', icon: DesktopIcon },
];

const MoreScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();
  const profile = useProfileQuery();
  const logout = useAuthStore(state => state.logout);
  const preference = useThemePreferenceStore(state => state.preference);
  const setPreference = useThemePreferenceStore(state => state.setPreference);

  const confirmLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      'Tendrás que ingresar nuevamente para acceder. Tus borradores locales se conservarán.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => void logout(),
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <AppHeader title="Más" eyebrow="Cuenta y apariencia" />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        <AppCard style={styles.profileCard}>
          <View style={styles.avatar}>
            <AppText variant="title.l" color="link">
              {(profile.data?.fullName || 'D')
                .split(/\s+/)
                .slice(0, 2)
                .map(part => part[0])
                .join('')
                .toUpperCase()}
            </AppText>
          </View>
          <View style={styles.profileCopy}>
            <AppText variant="title.m" color="headings">
              {profile.data?.fullName || 'Cargando…'}
            </AppText>
            {profile.data?.roleName ? (
              <AppText variant="text.sm.regular" color="details">
                {profile.data.roleName}
              </AppText>
            ) : null}
          </View>
        </AppCard>

        <View style={styles.section}>
          <AppText variant="overline" color="details">
            TEMA DE LA APLICACIÓN
          </AppText>
          <AppCard>
            {THEME_OPTIONS.map((option, index) => {
              const Icon = option.icon;
              const selected = preference === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() =>
                    setPreference(option.value as ThemePreference)
                  }
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  style={({ pressed }) => [
                    styles.option,
                    index > 0 && styles.optionBorder,
                    pressed && styles.pressed,
                  ]}
                >
                  <Icon
                    size={22}
                    color={
                      selected
                        ? theme.colors.navigation.active
                        : theme.colors.icon.secondary
                    }
                  />
                  <AppText
                    variant="text.md.regular"
                    color={selected ? 'headings' : 'body'}
                    style={styles.optionText}
                  >
                    {option.label}
                  </AppText>
                  {selected ? (
                    <CheckIcon
                      size={20}
                      color={theme.colors.navigation.active}
                      weight="bold"
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </AppCard>
        </View>

        <Pressable
          onPress={confirmLogout}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.logout,
            pressed && styles.pressed,
          ]}
        >
          <SignOutIcon size={22} color={theme.colors.text.error} />
          <AppText variant="text.md.bold" color="error">
            Cerrar sesión
          </AppText>
        </Pressable>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create(theme => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface.background.primary,
  },
  content: { padding: theme.spacing.md, gap: theme.spacing.xl },
  profileCard: {
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface.background.submenu,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCopy: { flex: 1, gap: theme.spacing.xs },
  section: { gap: theme.spacing.sm },
  option: {
    minHeight: theme.control.height.large,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  optionBorder: {
    borderTopWidth: theme.border.hairline,
    borderTopColor: theme.colors.border.subtle,
  },
  optionText: { flex: 1 },
  pressed: { opacity: theme.opacity.pressed },
  logout: {
    minHeight: theme.control.height.large,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface.status.error,
  },
}));

export default MoreScreen;
