export const enum FollowColumns {
  ID = 'ID',
  FollowerID = 'FollowerID',
  FollowingID = 'FollowingID',
  Status = 'Status',
  CreatedAt = 'CreatedAt',
}

export const enum FollowStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export const enum FollowMessage {
  // Success messages
  S1 = 'Follow relationship created successfully.',
  S2 = 'Follow relationship deleted successfully.',
  S3 = 'Followers retrieved successfully.',
  S4 = 'Following list retrieved successfully.',
  S5 = 'Follower count retrieved successfully.',
  S6 = 'Following count retrieved successfully.',
  S7 = 'Follow status updated successfully.',
  S8 = 'Pending follow requests retrieved successfully.',
  S9 = 'Sent follow requests retrieved successfully.',

  // Error messages
  E1 = 'Failed to create follow relationship.',
  E2 = 'Failed to find follow relationship.',
  E3 = 'Failed to delete follow relationship.',
  E4 = 'Failed to retrieve followers.',
  E5 = 'Failed to retrieve following users.',
  E6 = 'Failed to count followers.',
  E7 = 'Failed to count following users.',
  E8 = 'Failed to check follow status.',
  E9 = 'Failed to retrieve following IDs.',
  E10 = 'Failed to update follow status.',
  E11 = 'Failed to retrieve pending follow requests.',
  E12 = 'Failed to retrieve sent follow requests.',
}