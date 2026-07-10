export const enum ChatMessage {
  // Guard / history
  USER_ID_REQUIRED = 'ChatService: getConversationHistory called with undefined userId. Check your Auth Guard/Decorator.',

  // Conversation
  CANNOT_START_WITH_YOURSELF = 'Cannot start conversation with yourself',
  MUTUAL_FOLLOW_REQUIRED = 'You can only chat with people who mutually follow you.',
  GROUP_MEMBER_REQUIRED = 'A group must contain at least 2 members including yourself.',
  GROUP_NOT_FOUND = 'Group conversation not found.',
  NOT_PARTICIPANT = 'You are not a participant of this conversation',
}


export const enum ConversationColumns {
  ID = 'ID',
  Title = 'Title',
  Type = 'Type',
  CreatedBy = 'CreatedBy',
  CreatedAt = 'CreatedAt',
  ModifiedAt = 'ModifiedAt',
}

export const enum ConversationMessage {
  // Success messages
  S1 = 'Conversations retrieved successfully.',
  S2 = 'Conversation started successfully.',
  S3 = 'Group conversation created successfully.',
  S4 = 'Group members added successfully.',
  S5 = 'Conversation history cleared successfully.',

  // Error messages
  E1 = 'You cannot start a conversation with yourself.',
  E2 = 'You can only chat with people who mutually follow you.',
  E3 = 'A group must contain at least 2 members including yourself.',
  E4 = 'Group conversation not found.',
  E5 = 'You are not a participant of this conversation.',
  E6 = 'Failed to retrieve conversations.',
  E7 = 'Failed to start a conversation.',
  E8 = 'Failed to create a group conversation.',
  E9 = 'Failed to add group members.',
  E10 = 'Failed to clear conversation history.',
}

