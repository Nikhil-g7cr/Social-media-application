import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'This is an awesome post!', description: 'The text of the comment' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  commentText!: string;
}