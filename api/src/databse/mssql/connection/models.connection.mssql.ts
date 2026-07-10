import {
  Comments,
  Conversation,
  CP,
  Follow,
  Likes,
  Message,
  MessageAttachment,
  Posts,
  PostView,
  Users,
  Notification,
  Hashtags,
  PostHashtags,
  Reports,
  RefreshToken,
  FileDeleteRequest,
  Session,
  Roles,
} from '../models';
import { PostMedia } from '../models/postMedia.model';
import { MsSqlConstants } from './constant.mssql';

const msSqlDBModelsProvider = [
    { provide: MsSqlConstants.USER, useValue: Users },
    { provide: MsSqlConstants.POST, useValue: Posts },
    { provide: MsSqlConstants.LIKE, useValue: Likes },
    { provide: MsSqlConstants.FOLLOW, useValue: Follow },
    { provide: MsSqlConstants.COMMENT, useValue: Comments },
    { provide: MsSqlConstants.CONVERSATION, useValue: Conversation },
    { provide: MsSqlConstants.CONVERSATION_PARTICIPANTS, useValue: CP },
    { provide: MsSqlConstants.MESSAGE_ATTACHMENT, useValue: MessageAttachment },
    { provide: MsSqlConstants.MESSAGE, useValue: Message },
    { provide: MsSqlConstants.POST_VIEW, useValue: PostView },
    { provide: MsSqlConstants.POST_MEDIA, useValue: PostMedia },
    { provide: MsSqlConstants.NOTIFICATION, useValue: Notification },
    { provide: MsSqlConstants.HASHTAG, useValue: Hashtags },
    { provide: MsSqlConstants.POST_HASHTAG, useValue: PostHashtags },
    { provide: MsSqlConstants.REPORT, useValue: Reports },
    { provide: MsSqlConstants.REFRESH_TOKEN, useValue: RefreshToken },
    { provide: MsSqlConstants.SESSION, useValue: Session },
    { provide: MsSqlConstants.FILE_DELETE_REQUEST, useValue: FileDeleteRequest },
    { provide: MsSqlConstants.ROLES, useValue: Roles },
  ],
  models: any = msSqlDBModelsProvider.map((providers) => providers.useValue);

export { models, msSqlDBModelsProvider };
