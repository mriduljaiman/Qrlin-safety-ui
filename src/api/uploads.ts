import axios from './axios';

export const uploadsAPI = {
  uploadPhoto: async (blob: Blob): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', blob, 'photo.jpg');
    const response = await axios.post('/api/uploads/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
