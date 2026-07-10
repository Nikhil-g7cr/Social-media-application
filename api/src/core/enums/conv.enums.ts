export const enum CPColumns {
  ID = 'ID',
  ConversationID = 'ConversationID',
  UserID = 'UserID',
  Role = 'Role',
  JoinedAt = 'JoinedAt',
  HistoryClearedAt = 'HistoryClearedAt',
}

export const enum CPAlias {
  User = 'User',
  Conversation = 'Conversation',
}


export const enum ConversationParticipantRoles {
  MEMBER = 'member',
  ADMIN = 'admin',
  OWNER = 'owner', // Although only member and admin are in the check constraint, we'll keep owner if it's used elsewhere, but we'll use 'admin' instead of 'owner' for new chats.
}

export const enum cpRoles{
  MEMBER = 'member',
  ADMIN = 'admin',
  OWNER = 'owner', // Although only member and admin are in the check constraint, we'll keep owner if it's used elsewhere, but we'll use 'admin' instead of 'owner' for new chats.
}

export const enum conversationTypes {
  SINGLE = 'single',
  GROUP = 'group',
  BROADCAST = 'broadcast',
}