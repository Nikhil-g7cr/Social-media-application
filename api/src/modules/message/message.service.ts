import { Injectable, Inject } from '@nestjs/common';
import { MessageAbstractSQLDAO } from '../../databse/mssql/abstract/message.abstract.mssql';

@Injectable()
export class MessageService {
  constructor(
    @Inject(MessageAbstractSQLDAO)
    private readonly messageDao: MessageAbstractSQLDAO,
  ) {}

  async getConversationHistory(conversationId: string, userId: string) {
    return this.messageDao.getConversationHistory(conversationId, userId);
  }
}
