import { useNavigation } from '@react-navigation/native';
import { AuthNavigatorNavigationProp } from '../navigation/AuthNavigator';
import { useAuthStore } from '@/modules/auth/state/useAuthStore';
import { useForm } from 'react-hook-form';
import loginFormSchema, { LoginFormData } from '../schemas/loginFormSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner-native';
import ScreenContainer from '@/components/layout/ScreenContainer';
import AppFlex from '@/components/layout/AppFlex';
import AppIcon from '@/components/icons/AppIcon';
import AppText from '@/components/typography/AppText';
import FormContainer from '@/components/form/FormContainer';
import FormTextInput from '@/components/form/inputs/FormTextInput';
import FormButton from '@/components/form/FormButton';
import { AppButton } from '@/components/buttons/AppButton';
const LoginScreen = () => {
  const login = useAuthStore(s => s.login);
  const navigation = useNavigation<AuthNavigatorNavigationProp>();
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    await login(data.email, data.password);
    toast.success('Login exitoso');
  };
  return (
    <ScreenContainer justify="center" gap="md">
      <AppFlex align="center" direction="column" gap="xs">
        <AppIcon name="myLogo" size="xxxl" />
        <AppText variant="title.xxl">DebtMate</AppText>
        <AppText variant="text.md.bold">¡Bienvenido!</AppText>
      </AppFlex>
      <FormContainer
        form={loginForm}
        onSubmit={loginForm.handleSubmit(onSubmit)}
        schema={loginFormSchema}
      >
        <FormTextInput
          name="email"
          keyboardType="email-address"
          autoCapitalize="none"
          label="email"
          iconLeft="user"
        />
        <FormTextInput
          name="password"
          autoCapitalize="none"
          label="password"
          secureTextEntry
          iconLeft="key"
        />
        <FormButton text="Iniciar sesión" />
      </FormContainer>
      <AppButton
        text="No tengo cuenta"
        variant="link"
        align="center"
        onPress={() => navigation.navigate('Register')}
      />
    </ScreenContainer>
  );
};

export default LoginScreen;
