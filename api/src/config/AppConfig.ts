import { Injectable } from '@nestjs/common';

@Injectable()
export class AppConfig {
  private readonly envConfig: { [key: string]: any } = {};

  constructor() {
    this.envConfig.app = {
      port: parseInt(process.env.PORT || '3000'),
      environment: process.env.NODE_ENV,
    };

    // Database configuration
    this.envConfig.db = {
      mssql: {
        dialect: 'mssql',
        database: process.env.MSSQL_NAME,
        username: process.env.MSSQL_USER,
        password: process.env.MSSQL_PASSWORD,
        host: process.env.MSSQL_HOST,
        port: parseInt(process.env.MSSQL_PORT || '1433'),
        trustServerCertificate: Boolean(
          process.env.MSSQL_TRUST_SERVER_CERTIFICATE,
        ),
      },
    };
    this.envConfig.blobStorage = {
      blobAccountName: process.env.AZURE_BLOB_STORAGE_ACCOUNT_NAME,
      blobAccountKey: process.env.AZURE_BLOB_STORAGE_ACCOUNT_KEY,
      blobContainerName: process.env.AZURE_BLOB_STORAGE_CONTAINER_NAME,
      blobLoggerContainerName: process.env.AZURE_BLOB_STORAGE_LOGGER_CONTAINER,
      logLevel: process.env.LOG_LEVEL,
    };

    this.envConfig.jwt = {
      appAXTSecret: process.env.JWT_ACCESS_TOKEN_SECRET,
      appRFTSecret: process.env.JWT_REFRESH_TOKEN_SECRET,
      web: {
        axt: {
          expiresIn: process.env.JWT_WEB_AXT_EXPIRES_IN,
        },
        rft: {
          expiresIn: process.env.JWT_WEB_RFT_EXPIRES_IN,
          maxTtl: process.env.JWT_WEB_RFT_MAX_TTL,
          REFRESH_COOKIE_MAX_AGE_MS : 7 * 24 * 60 * 60 * 1000,
          refreshTokenCookieDomain: process.env.JWT_WEB_RFT_COOKIE_DOMAIN,
          strategy: (process.env.REFRESH_COOKIE_STRATEGY || 'per_user').toLowerCase(),
        },
      },
    };
    this.envConfig.AuthSSO = {
      aad: {
        clientId: process.env.AAD_CLIENT_ID,
        tenantId: process.env.AAD_TENANT_ID,
      },
    };
  }
  get(key: string): any {
    return this.envConfig[key];
  }
}
