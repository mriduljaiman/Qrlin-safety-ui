import axios from './axios';
import { LoginRequest, RegisterRequest, AuthResponse, OtpVerifyRequest, GoogleAuthRequest } from '../types/user';

export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axios.post('/api/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<{ message: string; userId: number }> => {
    const response = await axios.post('/api/auth/register', data);
    return response.data;
  },

  verifyOtp: async (data: OtpVerifyRequest): Promise<AuthResponse> => {
    const response = await axios.post('/api/auth/otp/verify', data);
    return response.data;
  },

  resendOtp: async (email: string): Promise<{ message: string }> => {
    const response = await axios.post('/api/auth/otp/resend', { email });
    return response.data;
  },

  googleLogin: async (data: GoogleAuthRequest): Promise<AuthResponse> => {
    const response = await axios.post('/api/auth/oauth/google', data);
    return response.data;
  },
};
