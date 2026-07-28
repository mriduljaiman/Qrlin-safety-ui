import axios from './axios';
import { CallInitiateResponse } from '../types/tag';

export const callAPI = {
  initiate: async (code: string): Promise<CallInitiateResponse> => {
    const response = await axios.post(`/api/public/scan/${code}/call`);
    return response.data;
  },

  reportEnd: async (
    code: string,
    sessionToken: string,
    status: 'MISSED' | 'FAILED' | 'COMPLETED',
    durationSeconds: number
  ): Promise<void> => {
    await axios.patch(`/api/public/scan/${code}/call/${sessionToken}`, { status, durationSeconds });
  },
};
