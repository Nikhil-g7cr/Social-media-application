import { PartialType } from '@nestjs/swagger';
import { UsersDTO } from './users.dto';


export class UpdateUserDto extends PartialType(UsersDTO) {}