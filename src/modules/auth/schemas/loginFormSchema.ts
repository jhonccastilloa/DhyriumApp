import { z } from 'zod';
const loginFormSchema = z.object({
  dni: z
    .string()
    .trim()
    .regex(/^\d{8}$/, 'Ingresa un DNI válido de 8 dígitos'),

  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;
export default loginFormSchema;
