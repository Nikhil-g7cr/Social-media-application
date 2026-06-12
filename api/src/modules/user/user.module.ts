import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UsersAbstractSvc } from './user.abstract';

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
