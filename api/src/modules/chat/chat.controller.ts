import { Controller, Get, Param } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // GET http://localhost:5000/chat/:conversationId/history
  @Get(':conversationId/history')
  async getChatHistory(@Param('conversationId') conversationId: string) {
    return this.chatService.getConversationHistory(conversationId);
  }
}