import axios from './axios';
import { ChatThread } from '../types/tag';

export const chatAPI = {
  // Finder-facing (anonymous, public)
  sendPublicMessage: async (code: string, message: string, sessionToken?: string): Promise<ChatThread> => {
    const response = await axios.post(`/api/public/scan/${code}/chat`, { message, sessionToken });
    return response.data;
  },

  sendPublicVoiceNote: async (
    code: string,
    audioUrl: string,
    audioDurationSeconds: number,
    sessionToken?: string
  ): Promise<ChatThread> => {
    const response = await axios.post(`/api/public/scan/${code}/chat`, {
      messageType: 'VOICE_NOTE',
      audioUrl,
      audioDurationSeconds,
      sessionToken,
    });
    return response.data;
  },

  getPublicThread: async (code: string, token: string): Promise<ChatThread> => {
    const response = await axios.get(`/api/public/scan/${code}/chat`, { params: { token } });
    return response.data;
  },

  uploadVoiceNote: async (blob: Blob): Promise<string> => {
    const formData = new FormData();
    formData.append('file', blob, 'voice-note.webm');
    const response = await axios.post('/api/uploads/voice-note', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.url;
  },

  // Owner-facing (authenticated)
  listThreads: async (tagId: number): Promise<ChatThread[]> => {
    const response = await axios.get(`/api/tags/${tagId}/chat`);
    return response.data;
  },

  reply: async (tagId: number, threadId: number, message: string): Promise<ChatThread> => {
    const response = await axios.post(`/api/tags/${tagId}/chat/${threadId}/messages`, { message });
    return response.data;
  },

  replyVoiceNote: async (
    tagId: number,
    threadId: number,
    audioUrl: string,
    audioDurationSeconds: number
  ): Promise<ChatThread> => {
    const response = await axios.post(`/api/tags/${tagId}/chat/${threadId}/messages`, {
      messageType: 'VOICE_NOTE',
      audioUrl,
      audioDurationSeconds,
    });
    return response.data;
  },
};
