import {
  Injectable,
  Inject,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import { ConversationAbstractSQLDAO } from '../abstract/conversation.abstract.mssql';
import { FollowAbstractSQLDao } from '../abstract/follow.abstract.mssql';
import { MsSqlConstants } from '../connection/constant.mssql';
import { Conversation } from '../models/conversation.model';
import { CP } from '../models/conversationParticipants.model';
import { Message } from '../models/message.model';
import { Users } from '../models/user.model';

@Injectable()
export class ConversationSQLDAO implements ConversationAbstractSQLDAO {
  constructor(
    @Inject(MsSqlConstants.CONVERSATION)
    private readonly conversationModel: typeof Conversation,
    @Inject(MsSqlConstants.CONVERSATION_PARTICIPANTS)
    private readonly cpModel: typeof CP,
    @Inject(MsSqlConstants.MESSAGE)
    private readonly messageModel: typeof Message,
    @Inject(MsSqlConstants.USER)
    private readonly userModel: typeof Users,
    @Inject(FollowAbstractSQLDao)
    private readonly followDao: FollowAbstractSQLDao,
  ) {}

  async getUserConversations(userId: string): Promise<any[]> {
    const userCps = await this.cpModel.findAll({
      where: { UserID: userId },
      attributes: ['ConversationID', 'HistoryClearedAt'],
    });

    const conversationIds = userCps.map((cp) => cp.ConversationID);
    const cpMap = new Map(
      userCps.map((cp) => [cp.ConversationID, cp.HistoryClearedAt]),
    );

    if (conversationIds.length === 0) {
      return [];
    }

    const conversations = await this.conversationModel.findAll({
      where: { ID: { [Op.in]: conversationIds } },
      include: [
        {
          model: this.messageModel,
          as: 'messages',
          limit: 1,
          order: [['CreatedAt', 'DESC']],
        },
      ],
      order: [['CreatedAt', 'DESC']],
    });

    const result: any[] = [];

    const otherCps = await this.cpModel.findAll({
      where: {
        ConversationID: { [Op.in]: conversationIds },
        UserID: { [Op.ne]: userId },
      },
      include: [
        {
          model: this.userModel,
          as: 'User',
          attributes: ['ID', 'FullName', 'UserName', 'ProfilePictureUrl'],
        },
      ],
    });

    const participantsByConv = new Map<string, any[]>();

    for (const cp of otherCps) {
      if (!participantsByConv.has(cp.ConversationID)) {
        participantsByConv.set(cp.ConversationID, []);
      }

      participantsByConv.get(cp.ConversationID)!.push(cp.User);
    }

    for (const conv of conversations as any[]) {
      const participants = participantsByConv.get(conv.ID) ?? [];

      let lm =
        conv.messages && conv.messages.length > 0
          ? (conv.messages[0] as any)
          : null;

      const historyClearedAt = cpMap.get(conv.ID);

      if (
        lm &&
        historyClearedAt &&
        new Date(lm.CreatedAt).getTime() <= new Date(historyClearedAt).getTime()
      ) {
        lm = null;
      }

      if (!lm && historyClearedAt) {
        continue;
      }

      const mappedParticipants = participants.map((p: any) => ({
        id: p.ID,
        name: p.FullName,
        username: p.UserName,
        avatarUrl: p.ProfilePictureUrl || null,
      }));

      const displayName =
        conv.Type === 'group'
          ? conv.Title
          : (mappedParticipants[0]?.name ?? '');

      const groupAvatar =
        (conv as any).AvatarUrl ||
        (conv as any).AvatarURL ||
        (conv as any).avatarUrl ||
        null;

      const displayAvatar =
        conv.Type === 'group'
          ? groupAvatar
          : (mappedParticipants[0]?.avatarUrl ?? null);

      result.push({
        id: conv.ID,
        type: conv.Type,
        title: conv.Title,
        displayName,
        displayAvatar,
        participants: mappedParticipants,
        participant: conv.Type === 'single' ? mappedParticipants[0] : null,
        latestMessage: lm
          ? {
              id: lm.ID,
              conversationId: lm.ConversationID,
              senderId: lm.SenderID,
              content: lm.Message,
              createdAt: lm.CreatedAt,
            }
          : null,
        createdAt: conv.CreatedAt,
      });
    }

    return result;
  }

  async startConversation(
    currentUserId: string,
    targetUserId: string,
  ): Promise<{ conversationId: string }> {
    if (currentUserId === targetUserId) {
      throw new Error('Cannot start conversation with yourself');
    }

    const [iFollowThem, theyFollowMe] = await Promise.all([
      this.followDao.isFollowing(currentUserId, targetUserId),
      this.followDao.isFollowing(targetUserId, currentUserId),
    ]);

    if (!iFollowThem || !theyFollowMe) {
      throw new ForbiddenException(
        'You can only chat with people who mutually follow you.',
      );
    }

    const currentUserCps = await this.cpModel.findAll({
      where: { UserID: currentUserId },
      attributes: ['ConversationID'],
    });
    const targetUserCps = await this.cpModel.findAll({
      where: { UserID: targetUserId },
      attributes: ['ConversationID'],
    });

    const targetUserConvIdsLower = targetUserCps.map((cp) =>
      cp.ConversationID.toLowerCase(),
    );

    const sharedConvIds = currentUserCps
      .filter((cp) =>
        targetUserConvIdsLower.includes(cp.ConversationID.toLowerCase()),
      )
      .map((cp) => cp.ConversationID);

    if (sharedConvIds.length > 0) {
      const existingConv = await this.conversationModel.findOne({
        where: { ID: { [Op.in]: sharedConvIds }, Type: 'single' },
      });
      if (existingConv) {
        return { conversationId: existingConv.ID };
      }
    }

    const newConvId = uuidv4();
    await this.conversationModel.create({
      ID: newConvId,
      Type: 'single',
      CreatedBy: currentUserId,
      CreatedAt: new Date(),
    } as any);
    await this.cpModel.create({
      ID: uuidv4(),
      ConversationID: newConvId,
      UserID: currentUserId,
      Role: 'admin',
      JoinedAt: new Date(),
    } as any);
    await this.cpModel.create({
      ID: uuidv4(),
      ConversationID: newConvId,
      UserID: targetUserId,
      Role: 'member',
      JoinedAt: new Date(),
    } as any);

    return { conversationId: newConvId };
  }

  async createGroupConversation(
    currUserID: string,
    title: string,
    participants: string[],
  ): Promise<{ conversationId: string }> {
    const uniqueParticipants = [...new Set(participants)];
    const filteredParticipants = uniqueParticipants.filter(
      (id) => id !== currUserID,
    );

    if (filteredParticipants.length < 1) {
      throw new BadRequestException(
        'A group must contain at least 2 members including yourself.',
      );
    }

    const conversationId = uuidv4();

    await this.conversationModel.create({
      ID: conversationId,
      Title: title,
      Type: 'group',
      CreatedBy: currUserID,
      CreatedAt: new Date(),
    } as any);

    await this.cpModel.create({
      ID: uuidv4(),
      ConversationID: conversationId,
      UserID: currUserID,
      Role: 'admin',
      JoinedAt: new Date(),
    } as any);

    await Promise.all(
      filteredParticipants.map((userId) =>
        this.cpModel.create({
          ID: uuidv4(),
          ConversationID: conversationId,
          UserID: userId,
          Role: 'member',
          JoinedAt: new Date(),
        } as any),
      ),
    );

    return { conversationId };
  }

  async addGroupMembers(
    currentUserId: string,
    conversationId: string,
    participants: string[],
  ): Promise<{ conversationId: string; addedCount: number }> {
    const conversation = await this.conversationModel.findByPk(conversationId);

    if (!conversation || conversation.Type !== 'group') {
      throw new BadRequestException('Group conversation not found.');
    }

    const currentParticipant = await this.cpModel.findOne({
      where: { ConversationID: conversationId, UserID: currentUserId },
    });

    if (!currentParticipant) {
      throw new ForbiddenException(
        'You are not a participant of this conversation',
      );
    }

    const uniqueParticipants = [...new Set(participants)].filter(
      (id) => id !== currentUserId,
    );

    if (uniqueParticipants.length === 0) {
      return { conversationId, addedCount: 0 };
    }

    const existingParticipants = await this.cpModel.findAll({
      where: {
        ConversationID: conversationId,
        UserID: { [Op.in]: uniqueParticipants },
      },
      attributes: ['UserID'],
    });
    const existingUserIds = new Set(
      existingParticipants.map((cp) => cp.UserID),
    );

    const usersToAdd = uniqueParticipants.filter(
      (userId) => !existingUserIds.has(userId),
    );

    await Promise.all(
      usersToAdd.map((userId) =>
        this.cpModel.create({
          ID: uuidv4(),
          ConversationID: conversationId,
          UserID: userId,
          Role: 'member',
          JoinedAt: new Date(),
        } as any),
      ),
    );

    return { conversationId, addedCount: usersToAdd.length };
  }

  async clearHistory(
    conversationId: string,
    userId: string,
  ): Promise<{ success: boolean }> {
    const cp = await this.cpModel.findOne({
      where: { ConversationID: conversationId, UserID: userId },
    });
    if (!cp) {
      throw new ForbiddenException(
        'You are not a participant of this conversation',
      );
    }

    cp.HistoryClearedAt = new Date();
    await cp.save();

    const allCps = await this.cpModel.findAll({
      where: { ConversationID: conversationId },
    });
    const allCleared = allCps.every((p) => p.HistoryClearedAt !== null);

    if (allCleared) {
      const minClearedAt = new Date(
        Math.min(...allCps.map((p) => new Date(p.HistoryClearedAt!).getTime())),
      );

      await this.messageModel.destroy({
        where: {
          ConversationID: conversationId,
          CreatedAt: { [Op.lte]: minClearedAt },
        },
      });
    }

    return { success: true };
  }
}
