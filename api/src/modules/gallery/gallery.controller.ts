import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { AtPayload } from '../user/interface/users.interface';
import { AppResponse } from 'src/shared/appresponse.shared';

@Controller('gallery')
@UseGuards(JwtAuthGuard)
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Post('requests')
  async createRequest(
    @Body() body: any,
    @Req() req: any,
  ): Promise<AppResponse> {
    const payload: AtPayload = req.user;
    return await this.galleryService.createRequest(body, payload);
  }

  @Get('requests')
  async getRequests(@Req() req: any): Promise<AppResponse> {
    const payload: AtPayload = req.user;
    return await this.galleryService.getRequests(payload);
  }

  @Patch('requests/:id/status')
  async updateRequestStatus(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ): Promise<AppResponse> {
    const payload: AtPayload = req.user;
    return await this.galleryService.updateRequestStatus(id, body, payload);
  }

  @Get('requests/pending-count')
  async getPendingCount(@Req() req: any): Promise<AppResponse> {
    const payload: AtPayload = req.user;
    return await this.galleryService.getPendingCount(payload);
  }
}
