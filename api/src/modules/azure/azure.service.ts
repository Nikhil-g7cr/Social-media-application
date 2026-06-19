import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} from '@azure/storage-blob';

import { AppConfig } from 'src/config/AppConfig';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileService implements OnModuleInit {
  private readonly containerName: string;
  private readonly accountName: string;
  private readonly sharedKeyCredential: StorageSharedKeyCredential;
  private readonly blobServiceClient: BlobServiceClient;
  private readonly logger = new Logger(FileService.name);

  constructor(private readonly appConfig: AppConfig) {
    const blobConfig = this.appConfig.get('blobStorage');

    this.accountName = blobConfig.blobAccountName;

    this.containerName = blobConfig.blobContainerName;

    this.sharedKeyCredential = new StorageSharedKeyCredential(
      blobConfig.blobAccountName,
      blobConfig.blobAccountKey,
    );

    this.blobServiceClient = new BlobServiceClient(
      `https://${blobConfig.blobAccountName}.blob.core.windows.net`,
      this.sharedKeyCredential,
    );
  }

  async onModuleInit() {
    try {
      this.logger.log('Configuring Azure Blob Storage CORS rules...');
      const properties = await this.blobServiceClient.getProperties();
      
      // Ensure our frontend can upload directly to blob storage
      properties.cors = [
        {
          allowedOrigins: 'http://localhost:3000,http://127.0.0.1:3000',
          allowedMethods: 'GET,PUT,POST,HEAD,OPTIONS,DELETE',
          allowedHeaders: '*',
          exposedHeaders: '*',
          maxAgeInSeconds: 3600,
        },
      ];
      
      await this.blobServiceClient.setProperties(properties);
      this.logger.log('Successfully configured Azure Blob Storage CORS rules.');
    } catch (error) {
      this.logger.error('Failed to configure Azure Blob Storage CORS rules', error);
    }
  }

  async generateUploadUrl(fileName: string) {
    const extension = fileName.split('.').pop();

    const blobName = `posts/${uuidv4()}.${extension}`;

    const containerClient = this.blobServiceClient.getContainerClient(
      this.containerName,
    );

    const blobClient = containerClient.getBlockBlobClient(blobName);

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName: this.containerName,
        blobName,
        permissions: BlobSASPermissions.parse('racwd'),
        startsOn: new Date(Date.now() - 5 * 60 * 1000),
        expiresOn: new Date(Date.now() + 15 * 60 * 1000),
      },
      this.sharedKeyCredential,
    ).toString();

    return {
      uploadUrl: `${blobClient.url}?${sasToken}`,
      blobPath: blobName,
      expiresIn: '15 minutes',
    };
  }

  async deleteFile(blobUrl: string) {
    const url = new URL(blobUrl);

    const blobName = url.pathname.substring(this.containerName.length + 2);

    const containerClient = this.blobServiceClient.getContainerClient(
      this.containerName,
    );

    const blobClient = containerClient.getBlockBlobClient(blobName);

    await blobClient.deleteIfExists();

    return {
      success: true,
      message: 'File deleted successfully',
    };
  }

  async generateReadUrl(blobPath: string): Promise<string> {
    const containerClient = this.blobServiceClient.getContainerClient(
      this.containerName,
    );

    const blobClient = containerClient.getBlockBlobClient(blobPath);

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName: this.containerName,
        blobName: blobPath,
        permissions: BlobSASPermissions.parse('r'),
        startsOn: new Date(Date.now() - 5 * 60 * 1000),
        expiresOn: new Date(Date.now() + 60 * 60 * 1000),
      },
      this.sharedKeyCredential,
    ).toString();

    return `${blobClient.url}?${sasToken}`;
  }
}
