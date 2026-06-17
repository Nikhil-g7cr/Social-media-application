import { IsString } from 'class-validator';

export class UploadUrlDto {
    @IsString()
    fileName!: string;

    @IsString()
    contentType!: string;
}