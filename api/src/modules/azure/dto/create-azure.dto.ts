import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UploadUrlDto {
    @IsString()
    fileName!: string;

    @IsString()
    contentType!: string;

    @IsOptional()
    @IsString()
    folder?: string;

    @IsOptional()
    @IsNumber()
    fileSize?: number;

    @IsOptional()
    @IsString()
    mimeType?: string;
}