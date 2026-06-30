import { Controller, Get, Post, Patch, Param, Req, UseGuards, Body } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { CreateGroupDto } from './dto/create-group.dto';

@Controller('conversation')
@UseGuards(JwtAuthGuard)
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get()
  findAllForUser(@Req() req: any) {
    return this.conversationService.findAllForUser(req.user.sub);
  }

  @Post('start/:userId')
  startConversation(@Req() req: any, @Param('userId') targetUserId: string) {
    return this.conversationService.startConversation(
      req.user.sub,
      targetUserId,
    );
  }

  // group converstaion
  @Post('group')
  createGroup(@Req() req: any, @Body() dto: CreateGroupDto) {
    console.log("===== CREATE GROUP =====");
    console.log("BODY =", dto);
    return this.conversationService.createGroupConv(
      req.user.sub,
      dto.title,
      dto.participants,
    );
  }

  @Patch(':id/clear')
  clearHistory(@Req() req: any, @Param('id') conversationId: string) {
    return this.conversationService.clearHistory(conversationId, req.user.sub);
  }
}

