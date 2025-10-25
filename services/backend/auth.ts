import { api } from '@/utils/api';
import { UserRole, UserMode } from '@/types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  mode?: UserMode;
  trades?: string[];
}

export interface AuthResponse {
  user: any;
  token: string;
  sessionId: string;
}

export class AuthService {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    api.setAuthToken(response.token);
    return response;
  }

  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/signup', data);
    api.setAuthToken(response.token);
    return response;
  }

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    api.clearAuthToken();
  }

  async getCurrentUser(): Promise<any> {
    return api.get('/auth/me');
  }
}

export const authService = new AuthService();
