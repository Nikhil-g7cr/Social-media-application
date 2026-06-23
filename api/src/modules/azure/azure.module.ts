import { Module } from '@nestjs/common';
import { FileController } from './azure.controller';
import { FileService } from './azure.service';
import { ServiceBusService } from './service-bus.service';

@Module({
  controllers: [FileController],
  providers: [FileService, ServiceBusService],
  exports: [FileService, ServiceBusService],
})
export class FileModule {}
