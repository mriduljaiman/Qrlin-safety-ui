import axios from './axios';
import { LastScan } from '../types/scan';

export const scansAPI = {
  getLastScans: async (): Promise<LastScan[]> => {
    const response = await axios.get('/api/tags/scans/last');
    return response.data;
  },
};
