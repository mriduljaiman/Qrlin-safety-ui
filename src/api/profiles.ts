import axios from './axios';
import { PetProfile, ChildProfile, ElderlyProfile, ItemProfile, Vaccination } from '../types/profile';

export const profilesAPI = {
  createPetProfile: async (data: PetProfile) => {
    const response = await axios.post('/api/profiles/pet', data);
    return response.data;
  },

  createChildProfile: async (data: ChildProfile) => {
    const response = await axios.post('/api/profiles/child', data);
    return response.data;
  },

  createElderlyProfile: async (data: ElderlyProfile) => {
    const response = await axios.post('/api/profiles/elderly', data);
    return response.data;
  },

  createItemProfile: async (data: ItemProfile) => {
    const response = await axios.post('/api/profiles/item', data);
    return response.data;
  },

  getMyProfiles: async () => {
    const response = await axios.get('/api/profiles/my');
    return response.data;
  },

  addVaccination: async (petId: number, data: Vaccination) => {
    const response = await axios.post(`/api/profiles/pet/${petId}/vaccination`, data);
    return response.data;
  },

  getVaccinations: async (petId: number) => {
    const response = await axios.get(`/api/profiles/pet/${petId}/vaccinations`);
    return response.data;
  },
};