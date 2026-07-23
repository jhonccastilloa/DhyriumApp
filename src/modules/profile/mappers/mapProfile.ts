import { ProfileSchema } from '../entities/Profile';
import type { Profile } from '../entities/Profile';
import type { ProfileApiResponse } from '../types/profileApiResponse.types';

export function mapProfile(response: ProfileApiResponse): Profile {
  return ProfileSchema.parse({
    id: response.id,
    fullName: `${response.profile.firstName} ${response.profile.lastName}`,
    email: response.email,
    dni: response.profile.dni,
    phone: response.profile.phone,
    roleName: response.role.name,
  });
}
