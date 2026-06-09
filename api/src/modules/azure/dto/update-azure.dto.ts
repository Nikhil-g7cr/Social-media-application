import { PartialType } from '@nestjs/mapped-types';
import { CreateAzureDto } from './create-azure.dto';

export class UpdateAzureDto extends PartialType(CreateAzureDto) {}
