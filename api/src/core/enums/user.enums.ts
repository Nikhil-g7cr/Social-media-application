export const enum UserRoles {
  USER = 'USER',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN',
}

export const enum UserMessage {
  // Success messages
  S1 = 'Username availability check completed.',
  S2 = 'Users retrieved successfully.',
  S3 = 'Users found.',
  S4 = 'User found.',
  S5 = 'User role retrieved successfully.',
  S6 = 'User created successfully.',
  S7 = 'User updated successfully.',
  S8 = 'User soft-deleted successfully.',
  S9 = 'User restored successfully.',
  S10 = 'User permanently deleted successfully.',

  // Error messages
  E1 = 'User is already soft-deleted.',
  E2 = 'User is not soft-deleted.',
  E3 = 'Failed to retrieve users.',
  E4 = 'Failed to retrieve user.',
  E5 = 'Failed to retrieve user role.',
  E6 = 'Failed to create user.',
  E7 = 'Failed to update user.',
  E8 = 'Failed to delete user.',
}
