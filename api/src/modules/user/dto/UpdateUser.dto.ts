import { PartialType } from '@nestjs/swagger';
import { UsersDTO } from './users.dto';
import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateUserDto extends PartialType(UsersDTO) {
  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;

  @IsOptional()
  @IsString()
  Role?: string;
}