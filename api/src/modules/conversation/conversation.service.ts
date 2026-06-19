import { Injectable, NotFoundException } from '@nestjs/common';
import { Conversation } from '../../databse/mssql/models/conversation.model';
import { CP } from '../../databse/mssql/models/conversationParticipants.model';
import { Users } from '../../databse/mssql/models/user.model';
import { Message } from '../../databse/mssql/models/message.model';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';

@Injectable()
export class ConversationService {
  async findAllForUser(userId: string) {
    // Find all conversations the user is a part of
    const userCps = await CP.findAll({
      where: { UserID: userId },
      attributes: ['ConversationID'],
    });

    const conversationIds = userCps.map((cp) => cp.ConversationID);

    // Fetch those conversations along with the OTHER participants and the latest message
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

    // We also need the other participant's details for 1-on-1 chats
    const result: any[] = [];
    for (const conv of conversations) {
      const otherParticipantCp = await CP.findOne({
        where: {
          ConversationID: conv.ID,
          UserID: { [Op.ne]: userId },
        },
        include: [{ model: Users, as: 'User', attributes: ['ID', 'FullName', 'UserName', 'ProfilePictureUrl'] }],
      });

      result.push({
        id: conv.ID,
        type: conv.Type,
        participant: otherParticipantCp ? otherParticipantCp.User : null,
        latestMessage: conv.messages && conv.messages.length > 0 ? conv.messages[0] : null,
        createdAt: conv.CreatedAt,
      });
    }

    return result;
  }

  async startConversation(currentUserId: string, targetUserId: string) {
    if (currentUserId === targetUserId) {
      throw new Error('Cannot start conversation with yourself');
    }

    // Check if a 1-on-1 conversation already exists between these two users
    const currentUserCps = await CP.findAll({ where: { UserID: currentUserId } });
    const targetUserCps = await CP.findAll({ where: { UserID: targetUserId } });

    const currentUserConvIds = currentUserCps.map(cp => cp.ConversationID);
    const targetUserConvIds = targetUserCps.map(cp => cp.ConversationID);

    // Intersection
    const sharedConvIds = currentUserConvIds.filter(id => targetUserConvIds.includes(id));

    if (sharedConvIds.length > 0) {
      // Check if any shared conversation is a 'single' type (1-on-1)
      const existingConv = await Conversation.findOne({
        where: {
          ID: { [Op.in]: sharedConvIds },
          Type: 'single',
        }
      });
      if (existingConv) {
        return { conversationId: existingConv.ID };
      }
    }

    // Create a new Conversation
    const newConvId = uuidv4();
    await Conversation.create({
      ID: newConvId,
      Type: 'single',
      CreatedBy: currentUserId,
      CreatedAt: new Date(),
    } as any);

    // Create CP for current user
    await CP.create({
      ID: uuidv4(),
      ConversationID: newConvId,
      UserID: currentUserId,
      Role: 'OWNER',
      JoinedAt: new Date(),
    } as any);

    // Create CP for target user
    await CP.create({
      ID: uuidv4(),
      ConversationID: newConvId,
      UserID: targetUserId,
      Role: 'MEMBER',
      JoinedAt: new Date(),
    } as any);

    return { conversationId: newConvId };
  }
}
