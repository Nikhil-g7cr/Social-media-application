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

export const enum PostMessage {
  // sucess messages
  S1 = 'Post created successfully',
  S2= 'Posts retrieved successfully',
  S3='user posts retrieved successfully',
  S4='Post updated successfully',
  S5='Post deleted successfully',
  S6='Feed retrieved successfully',
  S7='Liked Post retrieved successfully',
  S8='treding posts retrieved successfully',
  S9='Trending hashtags retrieved successfully',

  E1 = 'Failed to create post',
  E2 = 'Failed to get posts',
  E3 = 'Failed to get post by ID',
  E4 = 'Post not found',
  E6='failed to retrieve posts',
  E7='Failed to retrieve liked posts',
  E8='Failed to retrieve trending posts',
  E9='Failed to retrieve trending hashtags',

}