import { Injectable } from '@nestjs/common';
import { Message } from '../../databse/mssql/models/message.model';

@Injectable()
export class MessageService {
  async getConversationHistory(conversationId: string) {
    return Message.findAll({
      where: { ConversationID: conversationId },
      order: [['CreatedAt', 'ASC']],
    });
  }
}
