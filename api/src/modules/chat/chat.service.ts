import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Message } from '../../databse/mssql/models/message.model';
import { MessageAttachment } from '../../databse/mssql/models/messageAttachment.model';
import { CP } from '../../databse/mssql/models/conversationParticipants.model';
import { v4 as uuidv4 } from 'uuid';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ChatService {
  constructor(
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService
  ) {}

  // 1. Save a real-time message to MSSQL, return a normalized plain object
  async saveMessage(payload: { conversationId: string; senderId: string; text: string; attachments?: any[] }) {
    const now = new Date();
    const id = uuidv4();

    await Message.create({
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
        await MessageAttachment.create({
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

    // Return a normalized object (not a Sequelize model instance)
    const normalizedMessage = {
      id,
      conversationId: payload.conversationId,
      senderId: payload.senderId,
      content: payload.text,
      createdAt: now.toISOString(),
      attachments: savedAttachments,
    };

    // Find other participants in the conversation to notify them
    const participants = await CP.findAll({
      where: { ConversationID: payload.conversationId }
    });
    
    for (const participant of participants) {
      if (participant.UserID !== payload.senderId) {
        await this.notificationService.createNotification({
          userId: participant.UserID,
          actorUserId: payload.senderId,
          type: 'MESSAGE'
        });
      }
    }

    return normalizedMessage;
  }

  // 2. Fetch past messages for a specific chat room — normalized
  async getConversationHistory(conversationId: string) {
    const messages = await Message.findAll({
      where: { ConversationID: conversationId },
      include: [{ model: MessageAttachment, as: 'attachments' }],
      order: [['CreatedAt', 'ASC']],
    });

    return messages.map((m: any) => ({
      id: m.ID,
      conversationId: m.ConversationID,
      senderId: m.SenderID,
      content: m.Message,
      createdAt: m.CreatedAt,
      attachments: m.attachments ? m.attachments.map((a: any) => ({
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
      })) : [],
    }));
  }
}