import { Injectable, Inject } from '@nestjs/common';
import { ConversationAbstractSQLDAO } from '../../databse/mssql/abstract/conversation.abstract.mssql';

@Injectable()
export class ConversationService {
  constructor(
    @Inject(ConversationAbstractSQLDAO)
    private readonly conversationDao: ConversationAbstractSQLDAO,
  ) {}

  async findAllForUser(userId: string) {
    return this.conversationDao.getUserConversations(userId);
  }

  async startConversation(currentUserId: string, targetUserId: string) {
    return this.conversationDao.startConversation(currentUserId, targetUserId);
  }

  async createGroupConv(
    currUserID: string,
    title: string,
    participants: string[],
  ) {
    return this.conversationDao.createGroupConversation(
      currUserID,
      title,
      participants,
    );
  }

  async addGroupMembers(
    currentUserId: string,
    conversationId: string,
    participants: string[],
  ) {
    return this.conversationDao.addGroupMembers(
      currentUserId,
      conversationId,
      participants,
    );
  }

  async clearHistory(conversationId: string, userId: string) {
    return this.conversationDao.clearHistory(conversationId, userId);
  }
}
