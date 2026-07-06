import { Injectable, OnModuleInit, Logger, BadRequestException } from '@nestjs/common';
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} from '@azure/storage-blob';

import { AppConfig } from '../../config/AppConfig';
import { v4 as uuidv4 } from 'uuid';
import { UploadUrlDto } from './dto/create-azure.dto';

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
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    await containerClient.createIfNotExists();
    try {
      this.logger.log('Configuring Azure Blob Storage CORS rules...');
      const properties = await this.blobServiceClient.getProperties();
      // Ensure our frontend can upload directly to blob storage
      properties.cors = [
        {
          // Allow all common Vite/CRA/Next dev ports + production origins
          allowedOrigins: '*',
          allowedMethods: 'GET,PUT,POST,HEAD,OPTIONS,DELETE',
          // x-ms-blob-type is required by the browser for BlockBlob PUTs
          allowedHeaders: 'x-ms-blob-type,Content-Type,Authorization,x-ms-date,x-ms-version,*',
          exposedHeaders: 'ETag,Content-Length,x-ms-request-id,x-ms-version,*',
          maxAgeInSeconds: 3600,
        },
      ];
      
      await this.blobServiceClient.setProperties(properties);
      this.logger.log('Successfully configured Azure Blob Storage CORS rules.');
    } catch (error) {
      this.logger.error('Failed to configure Azure Blob Storage CORS rules', error);
    }
  }

  async generateUploadUrl(dto: UploadUrlDto) {
    const { fileName, fileSize, mimeType, folder } = dto;

    if (fileSize && mimeType) {
      const MAX_IMAGE_SIZE = 20 * 1024 * 1024;
      const MAX_DOCUMENT_SIZE = 50 * 1024 * 1024;
      const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

      if (mimeType.startsWith('image/') && fileSize > MAX_IMAGE_SIZE) {
        throw new BadRequestException('Image size exceeds 20MB limit');
      } else if (mimeType.startsWith('video/') && fileSize > MAX_VIDEO_SIZE) {
        throw new BadRequestException('Video size exceeds 100MB limit');
      } else if (!mimeType.startsWith('image/') && !mimeType.startsWith('video/') && fileSize > MAX_DOCUMENT_SIZE) {
        throw new BadRequestException('Document size exceeds 50MB limit');
      }
    }

    const extension = fileName.split('.').pop();
    const folderName = folder || 'gallery';
    const blobName = `${folderName}/${uuidv4()}.${extension}`;

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
    let blobName = blobUrl;
    try {
      const url = new URL(blobUrl);
      blobName = url.pathname.substring(this.containerName.length + 2);
    } catch {
      // Not a valid full URL, treat as direct blobName
    }

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

  async listFiles() {
    const containerClient = this.blobServiceClient.getContainerClient(
      this.containerName,
    );

    const files: {
      name: string;
      url: string;
      contentType: string | undefined;
      size: number | undefined;
      createdOn: Date | undefined;
    }[] = [];
    for await (const blob of containerClient.listBlobsFlat()) {
      files.push({
        name: blob.name,
        url: await this.generateReadUrl(blob.name),
        contentType: blob.properties.contentType,
        size: blob.properties.contentLength,
        createdOn: blob.properties.createdOn,
      });
    }

    return files;
  }
}
