import axios from './axios';
import { LoginRequest, RegisterRequest, AuthResponse } from '../types/user';

export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axios.post('/api/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<{ message: string; userId: number }> => {
    const response = await axios.post('/api/auth/register', data);
    return response.data;
  },
};