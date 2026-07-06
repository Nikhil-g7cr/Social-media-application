import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { NotificationService } from '../notification/notification.service';
import { ConversationAbstractSQLDAO } from '../../databse/mssql/abstract/conversation.abstract.mssql';
import { MessageAbstractSQLDAO } from '../../databse/mssql/abstract/message.abstract.mssql';

@Injectable()
export class ChatService {
  constructor(
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,

    private readonly conversationDao: ConversationAbstractSQLDAO,
    @Inject(MessageAbstractSQLDAO)
    private readonly messageDao: MessageAbstractSQLDAO,
  ) {}

  async saveMessage(payload: {
    conversationId: string;
    senderId: string;
    text: string;
    attachments?: any[];
  }) {
    const savedMessage = await this.messageDao.saveMessage(payload);

    const participants = await this.conversationDao.getAllConversations(
      payload.conversationId,
    );

    for (const participant of participants) {
      if (participant.UserID !== payload.senderId) {
        await this.notificationService.createNotification({
          userId: participant.UserID,
          actorUserId: payload.senderId,
          type: 'MESSAGE',
        });
      }
    }

    return savedMessage;
  }

  async getConversationHistory(conversationId: string, userId: string) {
    return this.messageDao.getConversationHistory(conversationId, userId);
  }
}
