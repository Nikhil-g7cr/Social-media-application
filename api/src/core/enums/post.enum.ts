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
  User = 'User',
}

export enum PostTypes {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}

export const enum PostHashtagsColumns {
  PostID = 'PostID',
  HashtagID = 'HashtagID',
}

export const enum PostMediaColumns {
  ID = 'ID',
  PostID = 'PostID',
  MediaType = 'MediaType',
  MediaURL = 'MediaURL',
  DisplayOrder = 'DisplayOrder',
  CreatedAt = 'CreatedAt',
  BlobName = 'BlobName',
  FileName = 'FileName',
  MimeType = 'MimeType',
  FileSize = 'FileSize',
}

export const enum PostViewColumns {
  ID = 'ID',
  Post_id = 'Post_id',
  User_id = 'User_id',
  Ip_address = 'Ip_address',
  Viewed_at = 'Viewed_at',
}

export const enum PostMessage {
  // Success messages
  S1 = 'Post created successfully',
  S2 = 'Posts retrieved successfully',
  S3 = 'user posts retrieved successfully',
  S4 = 'Post updated successfully',
  S5 = 'Post deleted successfully',
  S6 = 'Feed retrieved successfully',
  S7 = 'Liked Post retrieved successfully',
  S8 = 'treding posts retrieved successfully',
  S9 = 'Trending hashtags retrieved successfully',

  E1 = 'Failed to create post',
  E2 = 'Failed to get posts',
  E3 = 'Failed to get post by ID',
  E4 = 'Post not found',
  E6 = 'failed to retrieve posts',
  E7 = 'Failed to retrieve liked posts',
  E8 = 'Failed to retrieve trending posts',
  E9 = 'Failed to retrieve trending hashtags',
}