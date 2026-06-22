import { Controller, Get, Post, Patch, Param, Req, UseGuards } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';

@Controller('conversation')
@UseGuards(JwtAuthGuard)
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) { }

  @Get()
  findAllForUser(@Req() req: any) {
    return this.conversationService.findAllForUser(req.user.sub);
  }

  @Post('start/:userId')
  startConversation(@Req() req: any, @Param('userId') targetUserId: string) {
    return this.conversationService.startConversation(req.user.sub, targetUserId);
  }

  @Patch(':id/clear')
  clearHistory(@Req() req: any, @Param('id') conversationId: string) {
    return this.conversationService.clearHistory(conversationId, req.user.sub);
  }
}

