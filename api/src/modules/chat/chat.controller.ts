import { Controller, Get, Param, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // GET http://localhost:5000/chat/:conversationId/history
  @Get(':conversationId/history')
  async getChatHistory(@Param('conversationId') conversationId: string, @CurrentUser() user:any) {
    const userId = user.sub
    console.log("DEBUG: Current userId is", userId);
    return this.chatService.getConversationHistory(conversationId, userId);
  }
}