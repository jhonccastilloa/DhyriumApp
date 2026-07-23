export interface LoginResponse {
  id: number;
  role: {
    id: number;
    name: string;
    hierarchy: number;
  };
  password: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    dni: string;
    phone: string;
  };
  token: string;
}
