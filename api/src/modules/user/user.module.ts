import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DatabaseService } from 'src/databse/database.service';

@Module({
  imports:[DatabaseService],
  controllers: [UserController],
  providers: [UserService],
  exports:[UserService]
})
export class UserModule {}
