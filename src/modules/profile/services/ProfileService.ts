import api from '@/infrastructure/http/apiClient';
import type { Profile } from '../entities/Profile';
import { mapProfile } from '../mappers/mapProfile';
import type { ProfileApiResponse } from '../types/profileApiResponse.types';

// Requires apiClient baseURL to be https://dhyrium.online/back/api/v1.
class ProfileService {
  static async getMyProfile(): Promise<Profile> {
    const response = await api.get<ProfileApiResponse>('/profile');

    return mapProfile(response.data);
  }
}

export default ProfileService;
