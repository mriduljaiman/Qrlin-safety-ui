import axios from './axios';

export const contactAPI = {
  submit: async (data: { name: string; email: string; message: string }): Promise<{ message: string }> => {
    const response = await axios.post('/api/public/contact', data);
    return response.data;
  },
};
