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

  listAll: async (): Promise<Tag[]> => {
    const response = await axios.get('/api/tags/all');
    return response.data;
  },

  setActive: async (id: number, active: boolean): Promise<void> => {
    await axios.patch(`/api/tags/${id}/active`, { active });
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

  getSafeTagStatus: async (id: number): Promise<SafeTagStatus> => {
    const response = await axios.get(`/api/tags/${id}/safetag-status`);
    return response.data;
  },
};

// "NONE" means no physical SafeTag has been issued for this Tag yet - see
// SafeTagStatusResponse.none() on the backend.
export interface SafeTagStatus {
  status: 'NONE' | 'PENDING_PRINT' | 'PRINTED' | 'PACKED' | 'SHIPPED' | 'ACTIVE' | 'LOST' | 'REISSUED' | 'DISABLED' | 'DESTROYED';
  tagNumber: string | null;
  trackingNumber: string | null;
  courierName: string | null;
  shippedAt: string | null;
  activatedAt: string | null;
}

export const publicScanAPI = {
  scan: async (code: string, lat?: string, lng?: string): Promise<PublicTag> => {
    const params: Record<string, string> = {};
    if (lat) params.lat = lat;
    if (lng) params.lng = lng;
    const response = await axios.get(`/api/public/scan/${code}`, { params });
    return response.data;
  },
};
