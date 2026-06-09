import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AzureService } from './azure.service';
import { CreateAzureDto } from './dto/create-azure.dto';
import { UpdateAzureDto } from './dto/update-azure.dto';

@Controller('azure')
export class AzureController {
  constructor(private readonly azureService: AzureService) {}

  @Post()
  create(@Body() createAzureDto: CreateAzureDto) {
    return this.azureService.create(createAzureDto);
  }

  @Get()
  findAll() {
    return this.azureService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.azureService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAzureDto: UpdateAzureDto) {
    return this.azureService.update(+id, updateAzureDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.azureService.remove(+id);
  }
}
