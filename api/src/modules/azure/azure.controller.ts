import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UseGuards,
  Req,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { FileService } from './azure.service';
import { UploadUrlDto } from './dto/create-azure.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { AtPayload } from '../user/interface/users.interface';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload-url')
  async getUploadUrl(
    @Body()
    dto: UploadUrlDto,
  ) {
    return this.fileService.generateUploadUrl(dto);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async deleteFile(@Query('url') url: string, @Req() req: any) {
    const payload: AtPayload = req.user;
    if (!payload || !payload.roles.includes('ADMIN')) {
      throw new ForbiddenException(
        'Only Administrators can directly delete files.',
      );
    }
    return this.fileService.deleteFile(url);
  }

  @Get('read-url')
  async getReadUrl(@Query('url') url: string) {
    return {
      url: await this.fileService.generateReadUrl(url),
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async listFiles(@Req() req: any) {
    const payload: AtPayload = req.user;
    if (
      !payload ||
      (!payload.roles.includes('ADMIN') && !payload.roles.includes('MANAGER'))
    ) {
      throw new ForbiddenException(
        'Only Admins and Managers can access the gallery.',
      );
    }
    return this.fileService.listFiles();
  }

  // ─── Log File Endpoints ────────────────────────────────────────────────────

  /**
   * GET /api/files/logs
   * Returns a list of all log files from the logger blob container.
   * Admin only.
   */
  @Get('logs')
  @UseGuards(JwtAuthGuard)
  async listLogFiles(@Req() req: any) {
    const payload: AtPayload = req.user;
    if (!payload || !payload.roles.includes('ADMIN')) {
      throw new ForbiddenException('Only Admins can access log files.');
    }
    return this.fileService.listLogFiles();
  }

  /**
   * GET /api/files/logs/content?blobPath=app-logs/TOMO-2026-07-13.log
   * Returns the parsed JSON entries of a single log file (last 500 entries).
   * Admin only.
   */
  @Get('logs/content')
  @UseGuards(JwtAuthGuard)
  async getLogFileContent(
    @Query('blobPath') blobPath: string,
    @Req() req: any,
  ) {
    const payload: AtPayload = req.user;
    if (!payload || !payload.roles.includes('ADMIN')) {
      throw new ForbiddenException('Only Admins can access log file content.');
    }
    if (!blobPath) {
      throw new ForbiddenException('blobPath query param is required.');
    }
    return this.fileService.getLogFileContent(blobPath);
  }
}

