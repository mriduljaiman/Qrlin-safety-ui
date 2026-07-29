import axios from './axios';

export interface SafeTagRequestSubmission {
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string;
  category: string;
  tagName: string;
  description?: string;
  shippingAddress: string;
}

export interface PendingSafeTagRequest {
  id: number;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string | null;
  category: string;
  tagName: string;
  description: string | null;
  shippingAddress: string | null;
  status: 'PENDING' | 'FULFILLED' | 'REJECTED';
  adminNotes: string | null;
  fulfilledSafeTagId: number | null;
  createdAt: string;
  resolvedAt: string | null;
}

export const publicSafeTagRequestAPI = {
  submit: async (data: SafeTagRequestSubmission): Promise<void> => {
    await axios.post('/api/public/safetag-requests', data);
  },
};

export const adminSafeTagRequestAPI = {
  list: async (status?: string): Promise<PendingSafeTagRequest[]> => {
    const response = await axios.get('/api/admin/safetag-requests', { params: { status } });
    return response.data;
  },

  fulfill: async (id: number) => {
    const response = await axios.post(`/api/admin/safetag-requests/${id}/fulfill`);
    return response.data;
  },

  reject: async (id: number, adminNotes?: string) => {
    const response = await axios.post(`/api/admin/safetag-requests/${id}/reject`, { adminNotes });
    return response.data;
  },
};
