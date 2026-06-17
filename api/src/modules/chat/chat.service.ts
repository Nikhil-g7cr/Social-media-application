import { Injectable } from '@nestjs/common';
import { Message } from '../../databse/mssql/models/message.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ChatService {
  // 1. Save a real-time message to MSSQL
  async saveMessage(payload: { conversationId: string; senderId: string; text: string }) {
    // Call the create method directly on the Message model class
    const newMessage = await Message.create({
      ID: uuidv4(), 
      ConversationID: payload.conversationId,
      SenderID: payload.senderId,
      Message: payload.text,
      IsRead: false,
      CreatedAt: new Date().toISOString(), // <-- Convert to string here
      ModifiedAt: new Date().toISOString(),
    } as any);

    return newMessage;
  }

  // 2. Fetch past messages for a specific chat room
  async getConversationHistory(conversationId: string) {
    // Call the findAll method directly on the Message model class
    return Message.findAll({
      where: { ConversationID: conversationId },
      order: [['CreatedAt', 'ASC']],
    });
  }
}