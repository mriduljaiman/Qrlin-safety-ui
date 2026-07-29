import axios from './axios';
import { SafeTag, SafeTagUpdateRequest, AdminTagSummary } from '../types/safeTag';

export const adminSafeTagsAPI = {
  list: async (status?: string, search?: string): Promise<SafeTag[]> => {
    const response = await axios.get('/api/admin/safetags', { params: { status, search } });
    return response.data;
  },

  get: async (id: number): Promise<SafeTag> => {
    const response = await axios.get(`/api/admin/safetags/${id}`);
    return response.data;
  },

  searchEligibleTags: async (search: string): Promise<AdminTagSummary[]> => {
    const response = await axios.get('/api/admin/safetags/eligible-tags', { params: { search } });
    return response.data;
  },

  create: async (tagId: number): Promise<SafeTag> => {
    const response = await axios.post('/api/admin/safetags', { tagId });
    return response.data;
  },

  update: async (id: number, data: SafeTagUpdateRequest): Promise<SafeTag> => {
    const response = await axios.patch(`/api/admin/safetags/${id}`, data);
    return response.data;
  },

  transitionStatus: async (id: number, status: string, trackingNumber?: string, courierName?: string): Promise<SafeTag> => {
    const response = await axios.patch(`/api/admin/safetags/${id}/status`, { status, trackingNumber, courierName });
    return response.data;
  },

  reissue: async (id: number, adminNotes?: string): Promise<SafeTag> => {
    const response = await axios.post(`/api/admin/safetags/${id}/reissue`, { adminNotes });
    return response.data;
  },
};
