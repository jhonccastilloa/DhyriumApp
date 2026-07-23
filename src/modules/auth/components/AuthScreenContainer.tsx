import type { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { StyleSheet } from 'react-native-unistyles';
import AppFlex from '@/components/layout/AppFlex';
import AuthBrand from './AuthBrand';

interface AuthScreenContainerProps {
  children: ReactNode;
  footer?: ReactNode;
}

const AuthScreenContainer = ({
  children,
  footer,
}: AuthScreenContainerProps) => {
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <AppFlex flex={1} ph="xxl" pt="xl" pb="sm">
          <AuthBrand />
          <AppFlex flex={1} gap="xxl" style={styles.content}>
            {children}
          </AppFlex>
          {footer}
        </AppFlex>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create(theme => ({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.surface.background.cards,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    marginTop: theme.spacing.xxxl,
  },
}));

export default AuthScreenContainer;
