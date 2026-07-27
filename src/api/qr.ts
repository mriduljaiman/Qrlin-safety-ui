import axios from './axios';
import { ProfileResponse } from '../types/qr';

export const qrAPI = {
  getPublicProfile: async (code: string, lat?: string, lng?: string): Promise<ProfileResponse> => {
    const response = await axios.get(`/api/public/qr/${code}`, {
      params: { lat, lng },
    });
    return response.data;
  },

  contactOwner: async (code: string, data: {
    type: string;
    message?: string;
    phone?: string;
    name?: string;
  }) => {
    const response = await axios.post(`/api/public/contact/${code}`, data);
    return response.data;
  },

  toggleLostMode: async (qrId: number, lostMode: boolean) => {
    const response = await axios.post(`/api/scans/qr/${qrId}/lost-mode`, { lostMode });
    return response.data;
  },

  getScans: async (qrId: number) => {
    const response = await axios.get(`/api/scans/qr/${qrId}`);
    return response.data;
  },
};