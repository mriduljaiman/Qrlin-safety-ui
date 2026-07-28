import axios from './axios';

export const sosAPI = {
  trigger: async (code: string, lat?: string, lng?: string): Promise<void> => {
    await axios.post(`/api/public/scan/${code}/sos`, { lat, lng });
  },
};
