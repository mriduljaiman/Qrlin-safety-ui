import axios from './axios';
import { UserProfile, ProfileUpdateRequest, Preferences } from '../types/profile';

export const profileAPI = {
  getMe: async (): Promise<UserProfile> => {
    const response = await axios.get('/api/users/me');
    return response.data;
  },

  updateMe: async (data: ProfileUpdateRequest): Promise<UserProfile> => {
    const response = await axios.patch('/api/users/me', data);
    return response.data;
  },

  getPreferences: async (): Promise<Preferences> => {
    const response = await axios.get('/api/users/me/preferences');
    return response.data;
  },

  updatePreferences: async (data: Partial<Preferences>): Promise<Preferences> => {
    const response = await axios.patch('/api/users/me/preferences', data);
    return response.data;
  },
};
