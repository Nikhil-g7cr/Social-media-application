import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Req,
} from '@nestjs/common';
import { AtPayload } from '../user/models/users.model';
import { AppResponse } from 'src/shared/appresponse.shared';
import { ReportService } from './report.service';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) { }

  @Post()
  async createReport(@Body() body: any, @Req() req: any): Promise<AppResponse> {
    const payload: AtPayload = req.user;
    return await this.reportService.createReport(body, payload);
  }

  @Get()
  async getAllReports(@Req() req: any): Promise<AppResponse> {
    const payload: AtPayload = req.user;
    return await this.reportService.getAllReports(payload);
  }

  @Patch(':id/resolve')
  async resolveReport(
    @Param('id') id: string,
    @Body() body: { status: string },
    @Req() req: any,
  ): Promise<AppResponse> {
    const payload: AtPayload = req.user;
    return await this.reportService.resolveReport(id, body.status, payload);
  }
}
