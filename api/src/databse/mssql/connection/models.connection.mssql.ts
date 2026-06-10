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
} from '../models';
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
  ],
  models: any = msSqlDBModelsProvider.map((providers) => providers.useValue);

export { models, msSqlDBModelsProvider };
