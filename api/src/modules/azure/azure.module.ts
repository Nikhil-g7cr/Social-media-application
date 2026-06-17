import { Module } from '@nestjs/common';
import { FileController } from './azure.controller';
import { FileService } from './azure.service';

@Module({
  controllers: [FileController],
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {}
