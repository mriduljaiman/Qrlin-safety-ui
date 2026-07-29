import axios from './axios';

export const devicesAPI = {
  register: async (fcmToken: string, platform: string): Promise<void> => {
    await axios.post('/api/devices/register', { fcmToken, platform });
  },

  unregister: async (fcmToken: string): Promise<void> => {
    await axios.delete('/api/devices/unregister', { data: { fcmToken } });
  },
};
