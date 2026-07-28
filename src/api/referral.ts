import axios from './axios';
import { ReferralSummary } from '../types/referral';

export const referralAPI = {
  getSummary: async (): Promise<ReferralSummary> => {
    const response = await axios.get('/api/users/me/referral');
    return response.data;
  },
};
