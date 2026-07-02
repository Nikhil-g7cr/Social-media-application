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
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
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
}
