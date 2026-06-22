import { Injectable } from '@nestjs/common';
import { Message } from '../../databse/mssql/models/message.model';

import { Op } from 'sequelize';
import { CP } from '../../databse/mssql/models/conversationParticipants.model';

@Injectable()
export class MessageService {
  async getConversationHistory(conversationId: string, userId: string) {
    const cp = await CP.findOne({
      where: { ConversationID: conversationId, UserID: userId }
    });

    const whereClause: any = { ConversationID: conversationId };
    
    if (cp && cp.HistoryClearedAt) {
      whereClause.CreatedAt = { [Op.gt]: cp.HistoryClearedAt };
    }

    const messages = await Message.findAll({
      where: whereClause,
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
