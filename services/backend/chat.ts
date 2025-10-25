import { api } from '@/utils/api';
import { wsService, WebSocketMessage } from '../websocket';
import { Message } from '@/types';

export interface SendMessageRequest {
  taskId: string;
  text: string;
  recipientId: string;
}

export interface ChatMessage extends Message {
  sentiment?: 'positive' | 'negative' | 'neutral';
  toxicityScore?: number;
  flagged?: boolean;
}

export class ChatService {
  async sendMessage(data: SendMessageRequest): Promise<ChatMessage> {
    const message = await api.post<ChatMessage>('/chat/messages', data);
    
    wsService.send({
      type: 'chat',
      data: {
        action: 'message',
        ...message,
      },
    });
    
    return message;
  }

  async getTaskMessages(taskId: string): Promise<ChatMessage[]> {
    return api.get<ChatMessage[]>(`/chat/tasks/${taskId}/messages`);
  }

  async getConversations(): Promise<any[]> {
    return api.get<any[]>('/chat/conversations');
  }

  async markAsRead(messageIds: string[]): Promise<void> {
    await api.post('/chat/read', { messageIds });
  }

  async sendTypingIndicator(taskId: string, isTyping: boolean): Promise<void> {
    wsService.send({
      type: 'typing',
      data: {
        taskId,
        isTyping,
      },
    });
  }

  subscribeToMessages(
    callback: (message: ChatMessage) => void
  ): () => void {
    const handler = (wsMessage: WebSocketMessage) => {
      if (wsMessage.type === 'chat') {
        callback(wsMessage.data as ChatMessage);
      }
    };
    
    return wsService.subscribe(handler);
  }

  async analyzeMessageSentiment(messageId: string): Promise<{
    sentiment: string;
    score: number;
    toxicityScore: number;
  }> {
    return api.post(`/moderation/analyze-message`, { messageId });
  }
}

export const chatService = new ChatService();
