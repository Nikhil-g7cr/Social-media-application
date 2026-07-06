export abstract class ConversationAbstractSQLDAO {
  abstract getUserConversations(userId: string): Promise<any[]>;

  abstract startConversation(
    currentUserId: string,
    targetUserId: string,
  ): Promise<{ conversationId: string }>;

  abstract createGroupConversation(
    currentUserId: string,
    title: string,
    participants: string[],
  ): Promise<{ conversationId: string }>;

  abstract addGroupMembers(
    currentUserId: string,
    conversationId: string,
    participants: string[],
  ): Promise<{ conversationId: string; addedCount: number }>;

  abstract clearHistory(
    conversationId: string,
    userId: string,
  ): Promise<{ success: boolean }>;
}
