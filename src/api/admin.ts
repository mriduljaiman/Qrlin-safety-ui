import axios from './axios';

export const adminAPI = {
  generateQRCodes: async (count: number) => {
    const response = await axios.post('/api/admin/qr/generate', { count });
    return response.data;
  },

  assignQR: async (data: {
    qrCode: string;
    userId: number;
    profileType: string;
    profileId: number;
  }) => {
    const response = await axios.post('/api/admin/qr/assign', data);
    return response.data;
  },

  createCoupon: async (data: {
    code: string;
    discountPercent: number;
    expiryDate: string;
    usageLimit: number;
  }) => {
    const response = await axios.post('/api/admin/coupon', data);
    return response.data;
  },

  getCoupons: async () => {
    const response = await axios.get('/api/admin/coupons');
    return response.data;
  },

  createUser: async (data: { email: string; fullName: string; phone?: string }) => {
    const response = await axios.post('/api/admin/users', data);
    return response.data;
  },
};