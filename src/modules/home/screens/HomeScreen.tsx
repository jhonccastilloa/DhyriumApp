import { ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CaretRightIcon } from 'phosphor-react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import dayjs from '@/utils/dayjsSpanish';
import AppText from '@/components/typography/AppText';
import AppCard from '@/components/layout/AppCard';
import AppFlex from '@/components/layout/AppFlex';
import { useProfileQuery } from '@/modules/profile/queries/useProfileQuery';
import { HOME_MODULE_GROUPS } from '../constants/homeModules';
import type { HomeNavigatorParamList } from '../navigation/HomeNavigator';

const greetingForHour = (hour: number) => {
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
};

const initialsFromName = (fullName?: string) =>
  (fullName || 'Dhyrium')
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('');

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();
  const profile = useProfileQuery();
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeNavigatorParamList>>();
  const today = dayjs();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 20 },
        { paddingBottom: insets.bottom + 20 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <AppFlex direction="row" align="center" gap="md">
        <AppFlex flex={1} gap="xs">
          <AppText variant="text.sm.regular" color="details">
            {today.format('dddd, D [de] MMMM')}
          </AppText>
          <AppText variant="title.xl" color="headings">
            {greetingForHour(today.hour())}
          </AppText>
          <AppText variant="text.md.regular" color="body" numberOfLines={1}>
            {profile.data?.fullName || 'Cargando perfil…'}
          </AppText>
        </AppFlex>
        <AppFlex size={52} align="center" justify="center" style={styles.avatar}>
          <AppText variant="title.m" color="link">
            {initialsFromName(profile.data?.fullName)}
          </AppText>
        </AppFlex>
      </AppFlex>

      <AppFlex gap="sm">
        <AppText variant="title.xl" color="headings">
          ¿Qué necesitas gestionar?
        </AppText>
        <AppText variant="text.sm.regular" color="details">
          Accede a los módulos habilitados para tu equipo.
        </AppText>
      </AppFlex>

      {HOME_MODULE_GROUPS.map(group => (
        <AppFlex key={group.title} gap="sm">
          <AppText variant="overline" color="details">
            {group.title.toUpperCase()}
          </AppText>
          <AppFlex direction="row" flexWrap="wrap" gap="sm">
            {group.modules.map(module => {
              const Icon = module.icon;
              return (
                <AppCard
                  key={module.key}
                  emphasized={module.enabled}
                  disabled={!module.enabled}
                  accessibilityState={{ disabled: !module.enabled }}
                  accessibilityLabel={`${module.name}${module.enabled ? '' : ', próximamente'}`}
                  onPress={
                    module.enabled
                      ? () => navigation.navigate('Contracts')
                      : undefined
                  }
                  style={[
                    styles.moduleCard,
                    !module.enabled && styles.moduleDisabled,
                  ]}
                >
                  {module.enabled ? <View style={styles.activeRail} /> : null}
                  <View style={styles.iconSurface}>
                    <Icon
                      size={24}
                      color={
                        module.enabled
                          ? theme.colors.navigation.active
                          : theme.colors.navigation.inactive
                      }
                      weight={module.enabled ? 'duotone' : 'regular'}
                    />
                  </View>
                  <AppText
                    variant="text.sm.bold"
                    color={module.enabled ? 'headings' : 'details'}
                    numberOfLines={2}
                    style={styles.moduleName}
                  >
                    {module.name}
                  </AppText>
                  {module.enabled ? (
                    <CaretRightIcon
                      size={17}
                      color={theme.colors.navigation.active}
                      weight="bold"
                    />
                  ) : (
                    <AppText variant="text.xs.bold" color="details" numberOfLines={1}>
                      Próximamente
                    </AppText>
                  )}
                </AppCard>
              );
            })}
          </AppFlex>
        </AppFlex>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create(theme => ({
  screen: { flex: 1, backgroundColor: theme.colors.surface.background.primary },
  content: { paddingHorizontal: theme.spacing.md, gap: theme.spacing.xl },
  avatar: {
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface.background.submenu,
    borderWidth: theme.border.hairline,
    borderColor: theme.colors.border.focus,
  },
  moduleCard: {
    position: 'relative',
    width: '48.7%',
    minHeight: 146,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    overflow: 'hidden',
  },
  moduleDisabled: { opacity: 0.68 },
  activeRail: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 3,
    backgroundColor: theme.colors.navigation.active,
  },
  iconSurface: {
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.navigation.rail,
  },
  moduleName: { minHeight: 38, flex: 1 },
}));

export default HomeScreen;
