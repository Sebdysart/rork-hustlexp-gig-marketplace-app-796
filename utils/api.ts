import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const API_URL = Constants.expoConfig?.extra?.apiUrl || 
  process.env.EXPO_PUBLIC_API_URL || 
  'https://LunchGarden.dycejr.replit.dev/api';

export const WS_URL = API_URL.replace('http', 'ws').replace('/api', '');

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export class ApiClient {
  private baseURL: string;
  private headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  constructor(baseURL: string = API_URL) {
    this.baseURL = baseURL;
  }

  setAuthToken(token: string) {
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  clearAuthToken() {
    delete this.headers['Authorization'];
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    console.log(`[API] ${options.method || 'GET'} ${endpoint}`);
    
    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
          ...this.headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: ApiError = {
          message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          code: errorData.code,
          status: response.status,
        };
        throw error;
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      console.error(`[API] Error ${options.method || 'GET'} ${endpoint}:`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryString = params 
      ? '?' + new URLSearchParams(params).toString()
      : '';
    return this.request<T>(`${endpoint}${queryString}`, {
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  async uploadFile<T>(
    endpoint: string,
    file: { uri: string; name: string; type: string },
    additionalData?: Record<string, any>
  ): Promise<T> {
    const formData = new FormData();
    
    if (Platform.OS === 'web') {
      const response = await fetch(file.uri);
      const blob = await response.blob();
      formData.append('file', blob, file.name);
    } else {
      formData.append('file', file as any);
    }

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
          ...this.headers,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Upload failed: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`[API] Upload error:`, error);
      throw error;
    }
  }
}

export const api = new ApiClient();
