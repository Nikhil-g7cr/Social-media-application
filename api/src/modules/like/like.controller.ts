import { Controller, Post, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { LikeService } from './like.service';
import { LikeAbstractSvc } from './like.abstract';

@ApiTags('Likes')
@Controller('like')
@UseGuards(JwtAuthGuard) // Protects the route
@ApiBearerAuth()         // Tells Swagger to expect a token
export class LikeController {
  constructor(private readonly likeService: LikeAbstractSvc) {}

  @Get('user')
  async getUserLikes(@Req() req: any) {
    const userId = req.user.sub;
    return await this.likeService.getUserLikes(userId);
  }

  @Post(':postId')
  async toggleLike(
    @Param('postId') postId: string,
    @Req() req: any,
  ) {
    // req.user is automatically populated by JwtAuthGuard!
    // 'sub' is the property where we stored the user's ID during login
    const userId = req.user.sub; 
    
    return await this.likeService.toggleLike(postId, userId);
  }
}