import { z } from 'zod';
const loginFormSchema = z.object({
  email: z
    .email('Ingresa un correo electrónico válido')
    .trim()
    .min(1, 'El correo electrónico es obligatorio')
    .toLowerCase(),

  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;
export default loginFormSchema;
