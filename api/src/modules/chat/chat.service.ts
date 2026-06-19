import { Injectable } from '@nestjs/common';
import { Message } from '../../databse/mssql/models/message.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ChatService {
  // 1. Save a real-time message to MSSQL, return a normalized plain object
  async saveMessage(payload: { conversationId: string; senderId: string; text: string }) {
    const now = new Date();
    const id = uuidv4();

    await Message.create({
      ID: id,
      ConversationID: payload.conversationId,
      SenderID: payload.senderId,
      Message: payload.text,
      IsRead: false,
      CreatedAt: now,
      ModifiedAt: now,
    } as any);

    // Return a normalized object (not a Sequelize model instance)
    return {
      id,
      conversationId: payload.conversationId,
      senderId: payload.senderId,
      content: payload.text,
      createdAt: now.toISOString(),
    };
  }

  // 2. Fetch past messages for a specific chat room — normalized
  async getConversationHistory(conversationId: string) {
    const messages = await Message.findAll({
      where: { ConversationID: conversationId },
      order: [['CreatedAt', 'ASC']],
    });

    return messages.map((m: any) => ({
      id: m.ID,
      conversationId: m.ConversationID,
      senderId: m.SenderID,
      content: m.Message,
      createdAt: m.CreatedAt,
    }));
  }
}