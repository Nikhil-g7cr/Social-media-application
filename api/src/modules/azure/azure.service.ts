import { Injectable } from '@nestjs/common';
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} from '@azure/storage-blob';

import { AppConfig } from 'src/config/AppConfig';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileService {
  private readonly containerName: string;
  private readonly accountName: string;
  private readonly sharedKeyCredential: StorageSharedKeyCredential;
  private readonly blobServiceClient: BlobServiceClient;

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
        startsOn: new Date(),
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
        startsOn: new Date(),
        expiresOn: new Date(Date.now() + 60 * 60 * 1000),
      },
      this.sharedKeyCredential,
    ).toString();

    return `${blobClient.url}?${sasToken}`;
  }
}
