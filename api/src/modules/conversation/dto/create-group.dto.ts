import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsArray()
  @IsUUID('4', { each: true })
  participants!: string[];
}