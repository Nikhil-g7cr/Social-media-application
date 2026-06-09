import { Injectable } from '@nestjs/common';
import { CreateAzureDto } from './dto/create-azure.dto';
import { UpdateAzureDto } from './dto/update-azure.dto';

@Injectable()
export class AzureService {
  create(createAzureDto: CreateAzureDto) {
    return 'This action adds a new azure';
  }

  findAll() {
    return `This action returns all azure`;
  }

  findOne(id: number) {
    return `This action returns a #${id} azure`;
  }

  update(id: number, updateAzureDto: UpdateAzureDto) {
    return `This action updates a #${id} azure`;
  }

  remove(id: number) {
    return `This action removes a #${id} azure`;
  }
}
