import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Message } from '../../databse/mssql/models/message.model';
import { CP } from '../../databse/mssql/models/conversationParticipants.model';
import { v4 as uuidv4 } from 'uuid';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ChatService {
  constructor(
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService
  ) {}

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
    const normalizedMessage = {
      id,
      conversationId: payload.conversationId,
      senderId: payload.senderId,
      content: payload.text,
      createdAt: now.toISOString(),
    };

    // Find other participants in the conversation to notify them
    const participants = await CP.findAll({
      where: { ConversationID: payload.conversationId }
    });
    
    for (const participant of participants) {
      if (participant.UserID !== payload.senderId) {
        await this.notificationService.createNotification({
          userId: participant.UserID,
          actorUserId: payload.senderId,
          type: 'MESSAGE'
        });
      }
    }

    return normalizedMessage;
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