import { PartialType } from '@nestjs/mapped-types';
import { UploadUrlDto } from './create-azure.dto';

export class UpdateAzureDto extends PartialType(UploadUrlDto) {}
