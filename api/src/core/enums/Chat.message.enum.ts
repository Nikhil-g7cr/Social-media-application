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
