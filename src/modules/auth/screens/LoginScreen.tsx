import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { toast } from 'sonner-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { StyleSheet } from 'react-native-unistyles';
import { useAuthStore } from '@/modules/auth/state/useAuthStore';
import AppFlex from '@/components/layout/AppFlex';
import AppIcon from '@/components/icons/AppIcon';
import AppText from '@/components/typography/AppText';
import FormContainer from '@/components/form/FormContainer';
import FormTextInput from '@/components/form/inputs/FormTextInput';
import FormPasswordInput from '@/components/form/inputs/FormPasswordInput';
import FormButton from '@/components/form/FormButton';
import loginFormSchema, {
  type LoginFormData,
} from '../schemas/loginFormSchema';

const LoginScreen = () => {
  const login = useAuthStore(s => s.login);
  const [authError, setAuthError] = useState<string>();
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(undefined);
    try {
      await login(data.dni, data.password);
      toast.success('Sesión iniciada');
    } catch (error) {
      const message = (error as AxiosError<{ message?: string }>).response?.data
        ?.message;
      setAuthError(
        message ||
          'No pudimos iniciar sesión. Revisa tus datos e inténtalo nuevamente.',
      );
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <AppFlex flex={1} ph="xxl" pt="xl" pb="sm">
          <AppFlex direction="row" align="center" gap="sm">
            <AppIcon name="myLogo" size="xl" />
            <AppFlex gap="none">
              <AppText
                variant="title.l"
                color="headings"
                style={styles.brandName}
              >
                DHYRIUM
              </AppText>
              <AppText variant="overline" color="link">
                SAA
              </AppText>
            </AppFlex>
          </AppFlex>

          <AppFlex flex={1} gap="xxl" style={styles.content}>
            <AppFlex gap="sm">
              <AppText variant="overline" color="link">
                GESTIÓN DOCUMENTAL
              </AppText>
              <AppText variant="title.xxl" color="headings">
                Bienvenido
              </AppText>
              <AppText
                variant="text.md.regular"
                color="body"
                style={styles.description}
              >
                Ingresa para gestionar contratos y documentos desde cualquier
                lugar.
              </AppText>
            </AppFlex>

            <FormContainer
              form={loginForm}
              onSubmit={loginForm.handleSubmit(onSubmit)}
              schema={loginFormSchema}
              gap="lg"
            >
              <FormTextInput
                name="dni"
                label="DNI"
                keyboardType="number-pad"
                maxLength={8}
                autoCapitalize="none"
              />
              <FormPasswordInput
                name="password"
                label="Contraseña"
                autoCapitalize="none"
              />
              {authError && (
                <AppText
                  variant="text.sm.regular"
                  color="error"
                  accessibilityRole="alert"
                >
                  {authError}
                </AppText>
              )}
              <FormButton text="Ingresar" size="lg" />
            </FormContainer>
          </AppFlex>

          <AppFlex align="center" pb="sm">
            <AppText variant="text.xs.regular" color="details">
              Acceso seguro · Dhyrium SAA
            </AppText>
          </AppFlex>
        </AppFlex>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create(theme => ({
  safeArea: {
    flex: 1,
    },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    marginTop: theme.spacing.xxxl,
  },
  brandName: {
    letterSpacing: 2,
  },
  description: {
    maxWidth: 300,
  },
}));
