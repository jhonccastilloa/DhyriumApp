import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { toast } from 'sonner-native';
import { useAuthStore } from '@/modules/auth/state/useAuthStore';
import AppFlex from '@/components/layout/AppFlex';
import AppText from '@/components/typography/AppText';
import FormContainer from '@/components/form/FormContainer';
import FormTextInput from '@/components/form/inputs/FormTextInput';
import FormPasswordInput from '@/components/form/inputs/FormPasswordInput';
import FormButton from '@/components/form/FormButton';
import AuthHero from '../components/AuthHero';
import AuthScreenContainer from '../components/AuthScreenContainer';
import loginFormSchema, { type LoginFormData } from '../schemas/loginFormSchema';

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
      const message = (
        error as AxiosError<{ message?: string }>
      ).response?.data?.message;
      setAuthError(
        message ||
          'No pudimos iniciar sesión. Revisa tus datos e inténtalo nuevamente.'
      );
    }
  };

  return (
    <AuthScreenContainer
      footer={
        <AppFlex align="center" pb="sm">
          <AppText variant="text.xs.regular" color="details">
            Acceso seguro · Dhyrium SAA
          </AppText>
        </AppFlex>
      }
    >
      <AuthHero
        eyebrow="GESTIÓN DOCUMENTAL"
        title="Bienvenido"
        description="Ingresa para gestionar contratos y documentos desde cualquier lugar."
      />

      <FormContainer
        form={loginForm}
        onSubmit={loginForm.handleSubmit(onSubmit)}
        schema={loginFormSchema}
        gap="lg"
      >
        <FormTextInput
          name="dni"
          label="DNI"
          size="lg"
          keyboardType="number-pad"
          maxLength={8}
          autoCapitalize="none"
        />
        <FormPasswordInput
          name="password"
          label="Contraseña"
          size="lg"
          autoCapitalize="none"
        />
        {authError ? (
          <AppText
            variant="text.sm.regular"
            color="error"
            accessibilityRole="alert"
          >
            {authError}
          </AppText>
        ) : null}
        <FormButton text="Ingresar" size="lg" />
      </FormContainer>
    </AuthScreenContainer>
  );
};

export default LoginScreen;
