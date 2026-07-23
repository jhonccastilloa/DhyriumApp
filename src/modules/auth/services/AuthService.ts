import api from '@/infrastructure/http/apiClient';
import type { LoginApiResponse } from '../types/loginApiResponse.types';

class AuthService {
  static async login(dni: string, password: string): Promise<LoginApiResponse> {
    const response = await api.post<LoginApiResponse>('/auth/login', {
      dni,
      password,
    });
    return response.data;
  }
}

export default AuthService;
