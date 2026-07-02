import { Injectable, HttpStatus, Inject } from '@nestjs/common';
import { AppResponse, createResponse } from '../../shared/appresponse.shared';
import { AtPayload } from '../user/interface/users.interface';
import { UserRoles } from '../../core/enums/user.enums';
import { FileDeleteRequest } from '../../databse/mssql/models/fileDeleteRequest.model';
import { Users } from '../../databse/mssql/models/user.model';
import { MsSqlConstants } from '../../databse/mssql/connection/constant.mssql';
import { FileService } from '../azure/azure.service';
import * as crypto from 'crypto';

@Injectable()
export class GalleryService {
  constructor(
    @Inject(MsSqlConstants.FILE_DELETE_REQUEST)
    private readonly requestModel: typeof FileDeleteRequest,
    private readonly fileService: FileService,
  ) {}

  async createRequest(body: any, payload: AtPayload): Promise<AppResponse> {
    try {
      const request = await this.requestModel.create({
        ID: crypto.randomUUID(),
        RequestedBy: payload.sub,
        FileName: body.fileName,
        FileUrl: body.fileUrl,
        RequestReason: body.reason,
        Status: 'PENDING',
      } as any);

      return createResponse(
        HttpStatus.CREATED,
        'Delete request created successfully',
        request,
      );
    } catch (error: any) {
      console.error('Error creating delete request:', error);
      return createResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Error creating delete request',
      );
    }
  }

  async getRequests(payload: AtPayload): Promise<AppResponse> {
    try {
      let whereClause = {};

      if (payload.roles.includes(UserRoles.MANAGER)) {
        whereClause = { RequestedBy: payload.sub };
      } else if (!payload.roles.includes(UserRoles.ADMIN)) {
        return createResponse(HttpStatus.FORBIDDEN, 'Access Denied');
      }

      const requests = await this.requestModel.findAll({
        where: whereClause,
        include: [{ model: Users, as: 'RequestedByUser' }],
        order: [['CreatedAt', 'DESC']],
      });

      return createResponse(
        HttpStatus.OK,
        'Requests fetched successfully',
        requests,
      );
    } catch (error: any) {
      return createResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Error fetching requests',
      );
    }
  }

  async updateRequestStatus(
    requestId: string,
    body: any,
    payload: AtPayload,
  ): Promise<AppResponse> {
    try {
      if (!payload.roles.includes(UserRoles.ADMIN)) {
        return createResponse(
          HttpStatus.FORBIDDEN,
          'Access Denied: Only Admins can update status.',
        );
      }

      const request = await this.requestModel.findByPk(requestId);
      if (!request) {
        return createResponse(HttpStatus.NOT_FOUND, 'Request not found');
      }

      const { status } = body;

      if (status === 'APPROVED') {
        // Delete the file from Azure Blob Storage
        await this.fileService.deleteFile(request.FileUrl);
      }

      request.Status = status;
      request.updatedAt = new Date();
      await request.save();

      return createResponse(
        HttpStatus.OK,
        `Request ${status.toLowerCase()} successfully`,
        request,
      );
    } catch (error: any) {
      return createResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Error updating request status',
      );
    }
  }

  async getPendingCount(payload: AtPayload): Promise<AppResponse> {
    try {
      if (!payload.roles.includes(UserRoles.ADMIN)) {
        return createResponse(HttpStatus.FORBIDDEN, 'Access Denied');
      }

      const count = await this.requestModel.count({
        where: { Status: 'PENDING' },
      });

      return createResponse(
        HttpStatus.OK,
        'Pending count fetched successfully',
        { count },
      );
    } catch (error: any) {
      return createResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Error fetching pending count',
      );
    }
  }
}
