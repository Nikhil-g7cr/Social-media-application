import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UsersAbstractSvc } from './user.abstract';
import { DatabaseModule } from 'src/databse/database.module';
import { CoreModule } from 'src/core/core.module';

@Module({
  imports:[],
  controllers: [UserController],
  providers: [
    {
			provide: UsersAbstractSvc,
			useClass: UserService
		},
  ]
})
export class UserModule {}
