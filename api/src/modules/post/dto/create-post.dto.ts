import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { PostTypes } from 'src/databse/mssql/models';

export class CreatePostDto {
  @IsEnum(PostTypes)
  type!: PostTypes;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  mediaURL?: string;
}