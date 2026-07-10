export const enum PostsColumns {
  ID = 'ID',
  UserID = 'UserID',
  Type = 'Type',
  Content = 'Content',
  MediaURL = 'MediaURL',
  CreatedBy = 'CreatedBy',
  CreatedAt = 'CreatedAt',
  ModifiedBy = 'ModifiedBy',
  ModifiedAt = 'ModifiedAt',
}

export const enum PostsAlias {
    User = 'User'
}

export enum PostTypes {
    TEXT = 'TEXT',
    IMAGE = 'IMAGE',
    VIDEO = 'VIDEO'
}

export const enum LikeMessage {
  E1 = 'Failed to get user likes',
  E2 = 'LIKE_ALREADY_EXISTS',
  E3='Failed to toggle like',
  S1 = 'Post liked successfully',
  S2 = 'LIKE_DELETED_SUCCESSFULLY',
}