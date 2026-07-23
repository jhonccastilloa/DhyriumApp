import api from '@/infrastructure/http/apiClient';
import { LoginResponse } from '../types/loginResponse.types';

class AuthService {
  static async login(
    username: string,
    password: string,
  ): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', {
      username,
      password,
    });
    return response.data;
  }
}

export default AuthService;
