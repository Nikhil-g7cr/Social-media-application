import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';

import { DatabaseModule } from '../../databse/database.module';
import { ReportService } from './report.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule { }
