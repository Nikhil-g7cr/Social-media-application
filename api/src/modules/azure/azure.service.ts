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
  private readonly loggerContainerName: string;
  private readonly accountName: string;
  private readonly sharedKeyCredential: StorageSharedKeyCredential;
  private readonly blobServiceClient: BlobServiceClient;
  private readonly logger = new Logger(FileService.name);

  constructor(private readonly appConfig: AppConfig) {
    const blobConfig = this.appConfig.get('blobStorage');

    this.accountName = blobConfig.blobAccountName;
    this.containerName = blobConfig.blobContainerName;
    this.loggerContainerName = blobConfig.blobLoggerContainerName || 'tomo-logs';

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
    // Ensure main media container exists
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    await containerClient.createIfNotExists();

    // Ensure logger container exists
    try {
      const logContainerClient = this.blobServiceClient.getContainerClient(this.loggerContainerName);
      await logContainerClient.createIfNotExists();
      this.logger.log(`Logger container "${this.loggerContainerName}" ensured.`);
    } catch (err) {
      this.logger.error('Failed to ensure logger container exists', err);
    }

    // Configure CORS
    try {
      this.logger.log('Configuring Azure Blob Storage CORS rules...');
      const properties = await this.blobServiceClient.getProperties();
      properties.cors = [
        {
          allowedOrigins: '*',
          allowedMethods: 'GET,PUT,POST,HEAD,OPTIONS,DELETE',
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

  // ─── Media File Methods ───────────────────────────────────────────────────────

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

    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
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

    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const blobClient = containerClient.getBlockBlobClient(blobName);
    await blobClient.deleteIfExists();

    return { success: true, message: 'File deleted successfully' };
  }

  async generateReadUrl(blobPath: string): Promise<string> {
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
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
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);

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

  // ─── Logger Container Methods ─────────────────────────────────────────────────

  private async generateLogReadUrl(blobPath: string): Promise<string> {
    const blobClient = this.blobServiceClient
      .getContainerClient(this.loggerContainerName)
      .getBlockBlobClient(blobPath);

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName: this.loggerContainerName,
        blobName: blobPath,
        permissions: BlobSASPermissions.parse('r'),
        startsOn: new Date(Date.now() - 5 * 60 * 1000),
        expiresOn: new Date(Date.now() + 60 * 60 * 1000),
      },
      this.sharedKeyCredential,
    ).toString();

    return `${blobClient.url}?${sasToken}`;
  }

  async listLogFiles(): Promise<{
    name: string;
    displayName: string;
    url: string;
    size: number | undefined;
    lastModified: Date | undefined;
    type: 'app-log' | 'error-log';
  }[]> {
    const containerClient = this.blobServiceClient.getContainerClient(this.loggerContainerName);

    const files: {
      name: string;
      displayName: string;
      url: string;
      size: number | undefined;
      lastModified: Date | undefined;
      type: 'app-log' | 'error-log';
    }[] = [];

    for await (const blob of containerClient.listBlobsFlat()) {
      files.push({
        name: blob.name,
        displayName: blob.name.split('/').pop() || blob.name,
        url: await this.generateLogReadUrl(blob.name),
        size: blob.properties.contentLength,
        lastModified: blob.properties.lastModified,
        type: blob.name.startsWith('errors/') ? 'error-log' : 'app-log',
      });
    }

    // Sort by last modified descending (newest first)
    return files.sort(
      (a, b) =>
        new Date(b.lastModified ?? 0).getTime() -
        new Date(a.lastModified ?? 0).getTime(),
    );
  }

  async getLogFileContent(blobPath: string): Promise<any[]> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.loggerContainerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

      // Download the blob as a Buffer
      const buffer = await blockBlobClient.downloadToBuffer();
      const rawContent = buffer.toString('utf8');

      // Each log line is a JSON object (newline-delimited JSON)
      const lines = rawContent.split('\n').filter((l) => l.trim().length > 0);

      // Take only last 500 lines to parse for performance
      const recentLines = lines.slice(-500);

      const entries = recentLines.map((line, idx) => {
        try {
          const parsed = JSON.parse(line);
          return {
            _id: `${idx}`,
            ...parsed,
          };
        } catch {
          return {
            _id: `${idx}`,
            raw: line,
            level: 'unknown',
            timestamp: null,
            message: line,
          };
        }
      });

      return entries.reverse();
    } catch (error: any) {
      this.logger.error(`Error reading log file ${blobPath}: ${error.message}`, error.stack);
      return [
        {
          _id: 'error-0',
          level: 'error',
          timestamp: new Date().toISOString(),
          message: `Could not read file "${blobPath}": ${error.message}`,
        },
      ];
    }
  }
}
