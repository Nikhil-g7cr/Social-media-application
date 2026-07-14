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
import { ConversationColumns, ConversationMessage, conversationTypes, CPColumns, cpRoles, MessageColumns } from 'src/core/enums/chat.enum';
import { Conversation } from '../models/conversation.model';
import { CP } from '../models/conversationParticipants.model';
import { Message } from '../models/message.model';
import { Users } from '../models/user.model';
import { UserColumns } from 'src/core/enums/user.enum';



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

  async getAllConversations(conversationId: string): Promise<any[]> {
    try {
      return await this.cpModel.findAll({
        where: { ConversationID: conversationId },
      });
    } catch (error: any) {
      throw new Error(error?.message || ConversationMessage.E6);
    }
  }

  async getUserConversations(userId: string): Promise<any[]> {
    try {
      const userCps = await this.cpModel.findAll({
        where: { UserID: userId },
        attributes: [CPColumns.ConversationID, CPColumns.HistoryClearedAt],
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
            order: [[MessageColumns.CreatedAt, 'DESC']],
          },
        ],
        order: [[ConversationColumns.CreatedAt, 'DESC']],
      });

      const result: any[] = [];

      const conversationParticipants = await this.cpModel.findAll({
        where: {
          ConversationID: { [Op.in]: conversationIds },
        },
        include: [
          {
            model: this.userModel,
            as: 'User',
            attributes: [UserColumns.ID, UserColumns.FullName, UserColumns.UserName, UserColumns.ProfilePictureUrl],
          },
        ],
      });

      const participantsByConv = new Map<string, any[]>();

      for (const cp of conversationParticipants) {
        if (!participantsByConv.has(cp.ConversationID)) {
          participantsByConv.set(cp.ConversationID, []);
        }

        participantsByConv.get(cp.ConversationID)!.push(cp);
      }

      for (const conv of conversations as any[]) {
        const participantRecords = participantsByConv.get(conv.ID) ?? [];
        // Groups need every member (including the signed-in user) so the UI
        // can show the full member list. A one-to-one chat still displays
        // only the other person.
        const participants =
          conv.Type === conversationTypes.GROUP
            ? participantRecords
            : participantRecords.filter((cp: any) => cp.UserID !== userId);

        let lm =
          conv.messages && conv.messages.length > 0
            ? (conv.messages[0] as any)
            : null;

        const historyClearedAt = cpMap.get(conv.ID);

        if (
          lm &&
          historyClearedAt &&
          new Date(lm.CreatedAt).getTime() <=
            new Date(historyClearedAt).getTime()
        ) {
          lm = null;
        }

        if (!lm && historyClearedAt) {
          continue;
        }

        const mappedParticipants = participants.map((participant: any) => ({
          id: participant.User.ID,
          name: participant.User.FullName,
          username: participant.User.UserName,
          avatarUrl: participant.User.ProfilePictureUrl || null,
          role: participant.Role,
        }));

        const displayName =
          conv.Type === conversationTypes.GROUP
            ? conv.Title
            : (mappedParticipants[0]?.name ?? '');

        const groupAvatar =
          (conv as any).AvatarUrl ||
          (conv as any).AvatarURL ||
          (conv as any).avatarUrl ||
          null;

        const displayAvatar =
          conv.Type === conversationTypes.GROUP
            ? groupAvatar
            : (mappedParticipants[0]?.avatarUrl ?? null);

        result.push({
          id: conv.ID,
          type: conv.Type,
          title: conv.Title,
          displayName,
          displayAvatar,
          participants: mappedParticipants,
          participant: conv.Type === conversationTypes.SINGLE ? mappedParticipants[0] : null,
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
    } catch (error: any) {
      throw new Error(error?.message || ConversationMessage.E6);
    }
  }

  async startConversation(
    currentUserId: string,
    targetUserId: string,
  ): Promise<{ conversationId: string }> {
    try {
      if (currentUserId === targetUserId) {
        throw new BadRequestException(ConversationMessage.E1);
      }

      const [iFollowThem, theyFollowMe] = await Promise.all([
        this.followDao.isFollowing(currentUserId, targetUserId),
        this.followDao.isFollowing(targetUserId, currentUserId),
      ]);

      if (!iFollowThem || !theyFollowMe) {
        throw new ForbiddenException(ConversationMessage.E2);
      }

      const currentUserCps = await this.cpModel.findAll({
        where: { UserID: currentUserId },
        attributes: [CPColumns.ConversationID],
      });
      const targetUserCps = await this.cpModel.findAll({
        where: { UserID: targetUserId },
        attributes: [CPColumns.ConversationID],
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
          where: { ID: { [Op.in]: sharedConvIds }, Type: conversationTypes.SINGLE },
        });
        if (existingConv) {
          return { conversationId: existingConv.ID };
        }
      }

      const newConvId = uuidv4();
      await this.conversationModel.create({
        ID: newConvId,
        Type: conversationTypes.SINGLE,
        CreatedBy: currentUserId,
        CreatedAt: new Date(),
      } as any);
      await this.cpModel.create({
        ID: uuidv4(),
        ConversationID: newConvId,
        UserID: currentUserId,
        Role: cpRoles.ADMIN,
        JoinedAt: new Date(),
      } as any);
      await this.cpModel.create({
        ID: uuidv4(),
        ConversationID: newConvId,
        UserID: targetUserId,
        Role: cpRoles.MEMBER,
        JoinedAt: new Date(),
      } as any);

      return { conversationId: newConvId };
    } catch (error: any) {
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new Error(error?.message || ConversationMessage.E7);
    }
  }

  async createGroupConversation(
    currUserID: string,
    title: string,
    participants: string[],
  ): Promise<{ conversationId: string }> {
    try {
      const uniqueParticipants = [...new Set(participants)];
      const filteredParticipants = uniqueParticipants.filter(
        (id) => id !== currUserID,
      );

      if (filteredParticipants.length < 1) {
        throw new BadRequestException(ConversationMessage.E3);
      }

      const conversationId = uuidv4();

      await this.conversationModel.create({
        ID: conversationId,
        Title: title,
        Type: conversationTypes.GROUP,
        CreatedBy: currUserID,
        CreatedAt: new Date(),
      } as any);

      await this.cpModel.create({
        ID: uuidv4(),
        ConversationID: conversationId,
        UserID: currUserID,
        Role: cpRoles.ADMIN,
        JoinedAt: new Date(),
      } as any);

      await Promise.all(
        filteredParticipants.map((userId) =>
          this.cpModel.create({
            ID: uuidv4(),
            ConversationID: conversationId,
            UserID: userId,
            Role: cpRoles.MEMBER,
            JoinedAt: new Date(),
          } as any),
        ),
      );

      return { conversationId };
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error(error?.message || ConversationMessage.E8);
    }
  }

  async addGroupMembers(
    currentUserId: string,
    conversationId: string,
    participants: string[],
  ): Promise<{ conversationId: string; addedCount: number }> {
    try {
      const conversation =
        await this.conversationModel.findByPk(conversationId);

      if (!conversation || conversation.Type !== conversationTypes.GROUP) {
        throw new BadRequestException(ConversationMessage.E4);
      }

      const currentParticipant = await this.cpModel.findOne({
        where: { ConversationID: conversationId, UserID: currentUserId },
      });

      if (!currentParticipant) {
        throw new ForbiddenException(ConversationMessage.E5);
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
        attributes: [CPColumns.UserID],
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
            Role: cpRoles.MEMBER,
            JoinedAt: new Date(),
          } as any),
        ),
      );

      return { conversationId, addedCount: usersToAdd.length };
    } catch (error: any) {
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new Error(error?.message || ConversationMessage.E9);
    }
  }

  async clearHistory(
    conversationId: string,
    userId: string,
  ): Promise<{ success: boolean }> {
    try {
      const cp = await this.cpModel.findOne({
        where: { ConversationID: conversationId, UserID: userId },
      });
      if (!cp) {
        throw new ForbiddenException(ConversationMessage.E5);
      }

      cp.HistoryClearedAt = new Date();
      await cp.save();

      const allCps = await this.cpModel.findAll({
        where: { ConversationID: conversationId },
      });
      const allCleared = allCps.every((p) => p.HistoryClearedAt !== null);

      if (allCleared) {
        const minClearedAt = new Date(
          Math.min(
            ...allCps.map((p) => new Date(p.HistoryClearedAt!).getTime()),
          ),
        );

        await this.messageModel.destroy({
          where: {
            ConversationID: conversationId,
            CreatedAt: { [Op.lte]: minClearedAt },
          },
        });
      }

      return { success: true };
    } catch (error: any) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new Error(error?.message || ConversationMessage.E10);
    }
  }
}
