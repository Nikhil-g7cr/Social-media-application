import { Injectable, Inject } from '@nestjs/common';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { MessageAbstractSQLDAO } from '../abstract/message.abstract.mssql';
import { MsSqlConstants } from '../connection/constant.mssql';
import { Message } from '../models/message.model';
import { MessageAttachment } from '../models/messageAttachment.model';
import { CP } from '../models/conversationParticipants.model';
import { Users } from '../models/user.model';

@Injectable()
export class MessageSQLDAO implements MessageAbstractSQLDAO {
  constructor(
    @Inject(MsSqlConstants.MESSAGE)
    private readonly messageModel: typeof Message,
    @Inject(MsSqlConstants.MESSAGE_ATTACHMENT)
    private readonly messageAttachmentModel: typeof MessageAttachment,
    @Inject(MsSqlConstants.CONVERSATION_PARTICIPANTS)
    private readonly cpModel: typeof CP,
    @Inject(MsSqlConstants.USER)
    private readonly userModel: typeof Users,
  ) {}

  async getConversationHistory(conversationId: string, userId: string) {
    if (!userId) {
      throw new Error(
        'ChatService: getConversationHistory called with undefined userId. Check your Auth Guard/Decorator.',
      );
    }

    const cp = await this.cpModel.findOne({
      where: { ConversationID: conversationId, UserID: userId },
    });

    const whereClause: any = { ConversationID: conversationId };

    if (cp && cp.HistoryClearedAt) {
      whereClause.CreatedAt = { [Op.gt]: new Date(cp.HistoryClearedAt) };
    }

    const messages = await this.messageModel.findAll({
      where: whereClause,
      include: [
        {
          model: this.messageAttachmentModel,
          as: 'attachments',
        },
        {
          model: this.userModel,
          as: 'Sender',
          attributes: ['ID', 'FullName', 'UserName', 'ProfilePictureUrl'],
        },
      ],
      order: [['CreatedAt', 'ASC']],
    });

    return messages.map((m: any) => ({
      id: m.ID,
      conversationId: m.ConversationID,
      senderId: m.SenderID,
      sender: m.Sender
        ? {
            id: m.Sender.ID,
            name: m.Sender.FullName,
            username: m.Sender.UserName,
            avatarUrl: m.Sender.ProfilePictureUrl || null,
          }
        : null,
      content: m.Message,
      createdAt: m.CreatedAt,
      attachments: m.attachments
        ? m.attachments.map((a: any) => ({
            id: a.ID,
            fileUrl: a.FileURL,
            fileType: a.FileType,
            fileSizeBytes: a.FileSizeBytes,
            originalFileName: a.OriginalFileName,
            mimeType: a.MimeType,
            fileExtension: a.FileExtension,
            imageWidth: a.ImageWidth,
            imageHeight: a.ImageHeight,
            videoDuration: a.VideoDuration,
            thumbnailUrl: a.ThumbnailURL,
          }))
        : [],
    }));
  }

  async saveMessage(payload: {
    conversationId: string;
    senderId: string;
    text: string;
    attachments?: any[];
  }) {
    const now = new Date();
    const id = uuidv4();

    await this.messageModel.create({
      ID: id,
      ConversationID: payload.conversationId,
      SenderID: payload.senderId,
      Message: payload.text,
      IsRead: false,
      CreatedAt: now,
      ModifiedAt: now,
    } as any);

    const savedAttachments: any[] = [];

    if (payload.attachments && payload.attachments.length > 0) {
      for (const att of payload.attachments) {
        const attId = uuidv4();

        await this.messageAttachmentModel.create({
          ID: attId,
          Message_id: id,
          FileURL: att.fileUrl,
          FileType: att.fileType,
          FileSizeBytes: att.fileSizeBytes,
          CreatedAt: now,
          OriginalFileName: att.originalFileName,
          MimeType: att.mimeType,
          FileExtension: att.fileExtension,
          ImageWidth: att.imageWidth,
          ImageHeight: att.imageHeight,
          VideoDuration: att.videoDuration,
          ThumbnailURL: att.thumbnailUrl,
          UploadedBy: payload.senderId,
        } as any);

        savedAttachments.push({
          id: attId,
          fileUrl: att.fileUrl,
          fileType: att.fileType,
          fileSizeBytes: att.fileSizeBytes,
          originalFileName: att.originalFileName,
          mimeType: att.mimeType,
          fileExtension: att.fileExtension,
          imageWidth: att.imageWidth,
          imageHeight: att.imageHeight,
          videoDuration: att.videoDuration,
          thumbnailUrl: att.thumbnailUrl,
        });
      }
    }

    const normalizedMessage = {
      id,
      conversationId: payload.conversationId,
      senderId: payload.senderId,
      sender: null as null | {
        id: string;
        name: string;
        username: string;
        avatarUrl: string | null;
      },
      content: payload.text,
      createdAt: now.toISOString(),
      attachments: savedAttachments,
    };

    const sender = await this.userModel.findByPk(payload.senderId, {
      attributes: ['ID', 'FullName', 'UserName', 'ProfilePictureUrl'],
    });

    if (sender) {
      normalizedMessage.sender = {
        id: sender.ID,
        name: sender.FullName,
        username: sender.UserName,
        avatarUrl: sender.ProfilePictureUrl || null,
      };
    }

    return normalizedMessage;
  }
}
