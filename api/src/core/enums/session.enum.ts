export const enum SessionColumns {
  ID = 'ID',
  UserID = 'UserID',
  RefreshTokenHash = 'RefreshTokenHash',
  DeviceInfo = 'DeviceInfo',
  UserAgent = 'UserAgent',
  IpAddress = 'IpAddress',
  CreatedAt = 'CreatedAt',
  LastSeenAt = 'LastSeenAt',
  ExpiresAt = 'ExpiresAt',
}

export const enum RefreshTokenColumns {
  ID = 'ID',
  UserID = 'UserID',
  RefreshTokenHash = 'RefreshTokenHash',
  ExpiresAt = 'ExpiresAt',
  IsRevoked = 'IsRevoked',
  CreatedAt = 'CreatedAt',
}