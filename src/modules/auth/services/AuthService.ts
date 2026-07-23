import api from '@/infrastructure/http/apiClient';
import type { LoginApiResponse } from '../types/loginApiResponse.types';

class AuthService {
  static async login(
    username: string,
    password: string,
  ): Promise<LoginApiResponse> {
    const response = await api.post<LoginApiResponse>('/auth/login', {
      username,
      password,
    });
    return response.data;
  }
}

export default AuthService;
