import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/databse/database.module';
import { GalleryService } from './gallery.service';
import { GalleryController } from './gallery.controller';
import { FileModule } from '../azure/azure.module';

@Module({
  imports: [DatabaseModule, FileModule],
  controllers: [GalleryController],
  providers: [GalleryService],
})
export class GalleryModule {}
