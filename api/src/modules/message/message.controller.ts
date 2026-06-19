import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';

@Controller('message')
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get('conversation/:id')
  getConversationHistory(@Param('id') conversationId: string) {
    return this.messageService.getConversationHistory(conversationId);
  }
}
