import { Injectable } from '@nestjs/common';
import { Message } from '../../databse/mssql/models/message.model';

@Injectable()
export class MessageService {
  async getConversationHistory(conversationId: string) {
    const messages = await Message.findAll({
      where: { ConversationID: conversationId },
      order: [['CreatedAt', 'ASC']],
    });

    // Normalize to camelCase so frontend doesn't need any mapping
    return messages.map((m: any) => ({
      id: m.ID,
      conversationId: m.ConversationID,
      senderId: m.SenderID,
      content: m.Message,
      createdAt: m.CreatedAt,
    }));
  }
}
