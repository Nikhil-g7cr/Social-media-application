import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';

@ApiTags('Messages')
@ApiBearerAuth() // 👈 Tells Swagger to show the "Authorize" padlock for these endpoints
@UseGuards(JwtAuthGuard) // 👈 Protects the endpoint with your JWT guard
@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get('conversation/:conversationId')
  @ApiOperation({ summary: 'Get history for a specific conversation' })
  async getHistory(
    @Param('conversationId') conversationId: string,
    @CurrentUser('id') userId: string, // 👈 Grabs the validated user ID from the token
  ) {
    return this.messageService.getConversationHistory(conversationId, userId);
  }
}
