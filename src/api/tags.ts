import axios from './axios';
import { Tag, TagRequest, SafetyInfo, PublicTag } from '../types/tag';

export const tagsAPI = {
  create: async (data: TagRequest): Promise<Tag> => {
    const response = await axios.post('/api/tags', data);
    return response.data;
  },

  list: async (): Promise<Tag[]> => {
    const response = await axios.get('/api/tags');
    return response.data;
  },

  get: async (id: number): Promise<Tag> => {
    const response = await axios.get(`/api/tags/${id}`);
    return response.data;
  },

  update: async (id: number, data: TagRequest): Promise<Tag> => {
    const response = await axios.patch(`/api/tags/${id}`, data);
    return response.data;
  },

  toggleLostMode: async (id: number, lostMode: boolean): Promise<void> => {
    await axios.patch(`/api/tags/${id}/lost-mode`, { lostMode });
  },

  deactivate: async (id: number): Promise<void> => {
    await axios.delete(`/api/tags/${id}`);
  },

  getSafetyInfo: async (id: number): Promise<SafetyInfo | null> => {
    const response = await axios.get(`/api/tags/${id}/safety-info`);
    return response.status === 204 ? null : response.data;
  },

  upsertSafetyInfo: async (id: number, data: SafetyInfo): Promise<SafetyInfo> => {
    const response = await axios.put(`/api/tags/${id}/safety-info`, data);
    return response.data;
  },

  deleteSafetyInfo: async (id: number): Promise<void> => {
    await axios.delete(`/api/tags/${id}/safety-info`);
  },
};

export const publicScanAPI = {
  scan: async (code: string, lat?: string, lng?: string): Promise<PublicTag> => {
    const params: Record<string, string> = {};
    if (lat) params.lat = lat;
    if (lng) params.lng = lng;
    const response = await axios.get(`/api/public/scan/${code}`, { params });
    return response.data;
  },
};
