import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  IsArray,
  IsNumber,
} from 'class-validator';

import { PostTypes } from 'src/databse/mssql/models';

export class MediaItemDto {
  @IsString()
  mediaUrl!: string;

  @IsString()
  @IsOptional()
  blobName?: string;

  @IsString()
  @IsOptional()
  mediaType?: string;

  @IsString()
  @IsOptional()
  fileName?: string;

  @IsString()
  @IsOptional()
  mimeType?: string;

  @IsNumber()
  @IsOptional()
  fileSize?: number;
}

export class CreatePostDto {
  @IsEnum(PostTypes)
  type!: PostTypes;

  @IsOptional()
  @IsString()
  @MaxLength(3000, { message: 'Post content cannot exceed 3000 characters.' })
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Media URL cannot exceed 1000 characters.' })
  mediaURL?: string;

  @IsOptional()
  @IsArray()
  // Note: For simplicity without adding extra validateNested decorators since class-validator has them, we just declare the type
  media?: MediaItemDto[];
}
