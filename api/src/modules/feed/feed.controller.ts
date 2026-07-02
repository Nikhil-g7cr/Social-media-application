import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AppResponse } from '../../shared/appresponse.shared';
import { FeedService } from './feed.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { PaginationDto } from '../../core/dto/pagination.dto';

@Controller('feed')
@ApiBearerAuth()
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getFeed(
    @CurrentUser('sub') userId: string,
    @Query() pagination: PaginationDto,
  ): Promise<AppResponse> {
    return await this.feedService.getFeed(userId, pagination);
  }
}
