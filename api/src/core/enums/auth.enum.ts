export const enum AuthMessage {
  // Success messages
  SUCCESS = 'Success.',
  S2 = 'User created and logged in successfully.',
  S3 = 'Login successfully.',
  S4 = 'Logout successfully.',
  S5 = 'User deleted successfully.',
  S6 = 'User verified successfully.',
  S7 = 'Logged out from all devices successfully.',
  S8 = 'Session removed successfully.',
  S9 = 'Active sessions fetched successfully.',
  S10 = 'User Fetched successfully.',
  S11 = 'This account has been deactivated. Please contact an administrator.',

  // Error messages
  E1 = 'user not found.',
  E2 = 'Invalid email or password.',
  E3 = 'User already exists.',
  E4 = 'User is not verified.',
  E5 = 'User is blocked.',
  E6 = 'Maximum active session limit (5) reached. Please log out from another device first.',
  E7 = 'Session not found or already expired.',
  E8 = 'You do not have permission to remove this session.',
  E9 = 'Access Denied: Only Admins can manually create users.',
  E10 = 'Access Denied: Only Admins can soft-delete users.',
  E11 = 'Access Denied: Only Admins can restore users.',
  E12 = 'Access Denied: Cannot soft-delete your own account.',
  E13 = 'Access Denied: Cannot restore your own account.',
  E14 = 'Access Denied: Only Admins can permanently delete users.',
  E15 = 'Access Denied: Cannot delete your own account.',
}

export const enum TokenMessage {
  INVALID = 'Invalid or expired token.',
  VALID = 'Token is valid.',
  TP = 'Token parsed successfully.',
  TR = 'Token refreshed successfully.',
  IRT = 'Invalid refresh token.',
  IRS = 'Invalid or expired session. Please log in again.',
  SC = 'Session created successfully.',
  SR = 'Session removed successfully.',
  SF = 'Session found.',
  SRS = 'Session refreshed successfully.',
  SNF = 'Session not found or already expired.',
}

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

export const enum RoleType {
  ADMIN = 'ADMIN',
  USER = 'USER',
  MANAGER = 'MANAGER',
}

export const enum RolesColumns {
  ID = 'ID',
  Name = 'Name',
  Description = 'Description',
}

export enum RoleId {
  ADMIN = 1,
  MANAGER = 2,
  USER = 3,
}
