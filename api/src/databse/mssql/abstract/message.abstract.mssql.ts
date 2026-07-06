export abstract class MessageAbstractSQLDAO {
  abstract getConversationHistory(
    conversationId: string,
    userId: string,
  ): Promise<any[]>;

  abstract saveMessage(payload: {
    conversationId: string;
    senderId: string;
    text: string;
    attachments?: any[];
  }): Promise<any>;
}
