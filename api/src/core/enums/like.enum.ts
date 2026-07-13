export const enum LikesColumns {
  ID = 'ID',
  UserID = 'UserID',
  PostID = 'PostID',
  CreatedAt = 'CreatedAt',
}

export const enum LikeMessage {
  E1 = 'Failed to get user likes',
  E2 = 'LIKE_ALREADY_EXISTS',
  E3 = 'Failed to toggle like',
  S1 = 'Post liked successfully',
  S2 = 'LIKE_DELETED_SUCCESSFULLY',
}
