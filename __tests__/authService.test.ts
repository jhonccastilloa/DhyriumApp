import type { AxiosResponse } from 'axios';
import api from '@/infrastructure/http/apiClient';
import AuthService from '@/modules/auth/services/AuthService';
import type { LoginApiResponse } from '@/modules/auth/types/loginApiResponse.types';

jest.mock('@/infrastructure/http/apiClient', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

const postMock = jest.mocked(api.post);

const loginResponse: LoginApiResponse = {
  id: 2,
  role: {
    id: 3,
    name: 'Asistente de Gerencia',
    hierarchy: 3,
  },
  password: 'unknown',
  email: 'user@example.com',
  profile: {
    firstName: 'Test',
    lastName: 'User',
    dni: '73520253',
    phone: '999999999',
  },
  token: 'test-token',
};

describe('servicio de autenticación móvil', () => {
  beforeEach(() => {
    postMock.mockReset();
  });

  it('envía el DNI con el nombre definido por el contrato del backend', async () => {
    postMock.mockResolvedValue({
      data: loginResponse,
    } as AxiosResponse<LoginApiResponse>);

    await expect(
      AuthService.login('73520253', 'test-password'),
    ).resolves.toEqual(loginResponse);

    expect(postMock).toHaveBeenCalledWith('/auth/login', {
      dni: '73520253',
      password: 'test-password',
    });
  });
});
