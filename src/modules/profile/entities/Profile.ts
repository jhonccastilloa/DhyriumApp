import { z } from 'zod';

export const ProfileSchema = z.object({
  id: z.number(),
  fullName: z.string().trim().min(1),
  email: z.email(),
  dni: z.string(),
  phone: z.string().nullable(),
  roleName: z.string(),
});

export type Profile = z.infer<typeof ProfileSchema>;
