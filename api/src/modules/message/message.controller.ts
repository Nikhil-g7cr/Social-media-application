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
async getHistory(
    @Req() req: any,
    @CurrentUser() user: any,
    @CurrentUser('sub') userId: string,
    @Param('conversationId') conversationId: string,
) {
    console.log("req.user =", req.user);
    console.log("CurrentUser =", user);
    console.log("userId =", userId);

    return this.messageService.getConversationHistory(
        conversationId,
        userId,
    );
}
}
