import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { FileService } from './azure.service';
import { UploadUrlDto } from './dto/create-azure.dto';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload-url')
  async getUploadUrl(
    @Body()
    dto: UploadUrlDto,
  ) {
    return this.fileService.generateUploadUrl(dto.fileName);
  }

  @Delete()
  async deleteFile(
    @Query('url')
    url: string,
  ) {
    return this.fileService.deleteFile(url);
  }

  @Get('read-url')
  async getReadUrl(@Query('url') url: string) {
    return {
      url: await this.fileService.generateReadUrl(url),
    };
  }
}
