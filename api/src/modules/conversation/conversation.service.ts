import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { Conversation } from '../../databse/mssql/models/conversation.model';
import { CP } from '../../databse/mssql/models/conversationParticipants.model';
import { Users } from '../../databse/mssql/models/user.model';
import { Message } from '../../databse/mssql/models/message.model';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import { FollowAbstractSQLDao } from 'src/databse/mssql/abstract/follow.abstract.mssql';

@Injectable()
export class ConversationService {
  constructor(
    @Inject(FollowAbstractSQLDao) private readonly followDao: FollowAbstractSQLDao,
  ) {}

  async findAllForUser(userId: string) {
    const userCps = await CP.findAll({
      where: { UserID: userId },
      attributes: ['ConversationID', 'HistoryClearedAt'],
    });

    const conversationIds = userCps.map((cp) => cp.ConversationID);
    const cpMap = new Map(userCps.map(cp => [cp.ConversationID, cp.HistoryClearedAt]));

    // Guard: return empty array if user has no conversations
    if (conversationIds.length === 0) {
      return [];
    }

    const conversations = await Conversation.findAll({
      where: { ID: { [Op.in]: conversationIds } },
      include: [
        {
          model: Message,
          as: 'messages',
          limit: 1,
          order: [['CreatedAt', 'DESC']],
        },
      ],
      order: [['CreatedAt', 'DESC']],
    });

    const result: any[] = [];

    const otherCps = await CP.findAll({
      where:{ ConversationID:{[Op.in]:conversationIds}, UserID:{[Op.ne]:userId}},
      include:[{model:Users, as:'User', attributes:['ID', 'FullName', 'UserName', 'ProfilePictureUrl'] }]
    })
    const otherParticipentsByconv = new Map(otherCps.map(cp=>[cp.ConversationID, cp.User]))
    for (const conv of conversations) {
      const p:any  = otherParticipentsByconv.get(conv.ID);
      let lm = conv.messages && conv.messages.length > 0 ? conv.messages[0] as any : null;
      
      const historyClearedAt = cpMap.get(conv.ID);
      if (lm && historyClearedAt && new Date(lm.CreatedAt).getTime() <= new Date(historyClearedAt).getTime()) {
        lm = null;
      }

      // g-changes

      if (!lm && historyClearedAt) {
        continue;
      }
      // -----------

      result.push({
        id: conv.ID,
        type: conv.Type,
        // Serialize to camelCase for the frontend
        participant: p ? {
          id: p.ID,
          name: p.FullName,
          username: p.UserName,
          avatarUrl: p.ProfilePictureUrl || null,
        } : null,
        latestMessage: lm ? {
          id: lm.ID,
          conversationId: lm.ConversationID,
          senderId: lm.SenderID,
          content: lm.Message,
          createdAt: lm.CreatedAt,
        } : null,
        createdAt: conv.CreatedAt,
      });
    }

    return result;
  }

  async startConversation(currentUserId: string, targetUserId: string) {
    if (currentUserId === targetUserId) {
      throw new Error('Cannot start conversation with yourself');
    }

    const [iFollowThem, theyFollowMe] = await Promise.all([
      this.followDao.isFollowing(currentUserId, targetUserId),
      this.followDao.isFollowing(targetUserId, currentUserId),
    ]);

    if (!iFollowThem || !theyFollowMe) {
      throw new ForbiddenException('You can only chat with people who mutually follow you.');
    }

    const currentUserCps = await CP.findAll({ where: { UserID: currentUserId }, attributes: ['ConversationID'] });
    const targetUserCps = await CP.findAll({ where: { UserID: targetUserId }, attributes: ['ConversationID'] });

    // Extract lowercase target IDs for safe JS comparison
    const targetUserConvIdsLower = targetUserCps.map(cp => cp.ConversationID.toLowerCase());

    // Filter using lowercase for accuracy, but map back to the ORIGINAL case ID for the DB
    const sharedConvIds = currentUserCps
      .filter(cp => targetUserConvIdsLower.includes(cp.ConversationID.toLowerCase()))
      .map(cp => cp.ConversationID);

    if (sharedConvIds.length > 0) {
      const existingConv = await Conversation.findOne({
        where: { ID: { [Op.in]: sharedConvIds }, Type: 'single' }
      });
      if (existingConv) {
        return { conversationId: existingConv.ID }; // Returns existing chat room!
      }
    }

    // Only create if truly nothing found
    const newConvId = uuidv4();
    await Conversation.create({ ID: newConvId, Type: 'single', CreatedBy: currentUserId, CreatedAt: new Date() } as any);
    await CP.create({ ID: uuidv4(), ConversationID: newConvId, UserID: currentUserId, Role: 'admin', JoinedAt: new Date() } as any);
    await CP.create({ ID: uuidv4(), ConversationID: newConvId, UserID: targetUserId, Role: 'member', JoinedAt: new Date() } as any);

    return { conversationId: newConvId };
  }

  async clearHistory(conversationId: string, userId: string) {
    const cp = await CP.findOne({
      where: { ConversationID: conversationId, UserID: userId },
    });
    if (!cp) {
      throw new ForbiddenException('You are not a participant of this conversation');
    }

    cp.HistoryClearedAt = new Date();
    await cp.save();
    // FIX: HARD DELETE LOGIC
    // Check if ALL participants in this conversation have cleared their history
    const allCps = await CP.findAll({ where: { ConversationID: conversationId } });
    const allCleared = allCps.every(p => p.HistoryClearedAt !== null);

    if (allCleared) {
      // Find the earliest cleared date among the users
      const minClearedAt = new Date(Math.min(...allCps.map(p => new Date(p.HistoryClearedAt!).getTime())));
      
      // Permanently delete messages older than the earliest cleared date from the database
      await Message.destroy({
        where: {
          ConversationID: conversationId,
          CreatedAt: { [Op.lte]: minClearedAt }
        }
      });
    }

    return { success: true };
  }
}

