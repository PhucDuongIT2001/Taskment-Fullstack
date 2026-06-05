import api from './api';

export const chatService = {
  // Send a message
  sendMessage: async (message, conversationId = null) => {
    try {
      const payload = { message };
      if (conversationId) {
        payload.conversationId = conversationId;
      }
      const response = await api.post('/chat', payload);
      return response.data; // { response: string, conversationId: number }
    } catch (error) {
      console.error('Error sending message to AI', error);
      throw error;
    }
  },

  // Get list of conversations for the current user
  getConversations: async () => {
    try {
      const response = await api.get('/chat/conversations');
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations', error);
      throw error;
    }
  },

  // Get messages for a specific conversation
  getMessages: async (conversationId) => {
    try {
      const response = await api.get(`/chat/conversations/${conversationId}/messages`);
      return response.data;
    } catch (error) {
      console.error('Error fetching messages', error);
      throw error;
    }
  }
};
