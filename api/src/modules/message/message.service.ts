import { Injectable } from '@nestjs/common';
import { Message } from '../../databse/mssql/models/message.model';
import { MessageAttachment } from '../../databse/mssql/models/messageAttachment.model'; // ✅ added

import { Op } from 'sequelize';
import { CP } from '../../databse/mssql/models/conversationParticipants.model';

@Injectable()
export class MessageService {
  async getConversationHistory(conversationId: string, userId: string) {
    if (!userId) {
      throw new Error(
        'ChatService: getConversationHistory called with undefined userId. Check your Auth Guard/Decorator.',
      );
    }
    const cp = await CP.findOne({
      where: { ConversationID: conversationId, UserID: userId },
    });

    const whereClause: any = { ConversationID: conversationId };

    if (cp && cp.HistoryClearedAt) {
      whereClause.CreatedAt = { [Op.gt]: new Date(cp.HistoryClearedAt) };
    }

    // const messages = await Message.findAll({
    //   where: whereClause,
    //   include: [{ model: MessageAttachment, as: 'attachments' }], // ✅ added
    //   order: [['CreatedAt', 'ASC']],
    // });

    try {
      const messages = await Message.findAll({
        where: whereClause,
        include: [
          {
            model: MessageAttachment,
            as: 'attachments',
          },
        ],
        order: [['CreatedAt', 'ASC']],
      });

      // Normalize to camelCase — same shape the WebSocket path (chat.service.ts) already uses
      return messages.map((m: any) => ({
        id: m.ID,
        conversationId: m.ConversationID,
        senderId: m.SenderID,
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
    } catch (err: any) {
      console.log('==========================');
      console.log(err.message);
      console.log(err.parent);
      console.log(err.original);
      console.log(err.sql);
      console.log('==========================');

      throw err;
    }
  }
}
