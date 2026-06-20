import { Controller, Post, Get, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentAbstractSvc } from './comment.abstract';

@ApiTags('Comments')
@Controller('comment')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommentController {
  constructor(private readonly commentService: CommentAbstractSvc) {}

  @Get('user')
  async getUserComments(@Req() req: any) {
    const userId = req.user.sub;
    return await this.commentService.getUserComments(userId);
  }

  @Delete(':id')
  async deleteComment(@Param('id') commentId: string, @Req() req: any) {
    const userId = req.user.sub;
    return await this.commentService.deleteComment(commentId, userId);
  }

  @Post(':postId')
  async createComment(
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: any,
  ) {
    const userId = req.user.sub; // Extracted from the JWT Token
    
    return await this.commentService.createComment(
      postId, 
      userId, 
      createCommentDto.commentText
    );
  }

  @Get(':postId')
  async getCommentsByPostId(@Param('postId') postId: string) {
    return await this.commentService.getCommentsByPostId(postId);
  }
}