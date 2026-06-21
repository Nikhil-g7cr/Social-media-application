import { Injectable, HttpStatus, Inject } from '@nestjs/common';
import { AppResponse, createResponse } from 'src/shared/appresponse.shared';
import { AtPayload } from '../user/models/users.model';
import { UserRoles } from 'src/core/enums/user.enums';
import { Reports } from 'src/databse/mssql/models';
import { MsSqlConstants } from 'src/databse/mssql/connection/constant.mssql';
import * as crypto from 'crypto';

@Injectable()
export class ReportService {
  constructor(
    @Inject(MsSqlConstants.REPORT) private readonly reportModel: typeof Reports,
  ) {}

  async createReport(body: any, payload: AtPayload): Promise<AppResponse> {
    try {
      const report = await this.reportModel.create({
        ID: crypto.randomUUID(),
        ReporterID: payload.sub,
        TargetType: body.targetType,
        TargetID: body.targetId,
        Reason: body.reason,
        Status: 'PENDING',
        CreatedAt: new Date(),
      } as any);

      return createResponse(HttpStatus.CREATED, 'Report created successfully', report);
    } catch (error: any) {
      return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, 'Error creating report');
    }
  }

  async getAllReports(payload: AtPayload): Promise<AppResponse> {
    try {
      if (!payload.roles.includes(UserRoles.ADMIN) && !payload.roles.includes(UserRoles.MANAGER)) {
        return createResponse(HttpStatus.FORBIDDEN, 'Access Denied: Only Admins or Managers can view reports.');
      }

      const reports = await this.reportModel.findAll({
        include: ['Reporter', 'Resolver']
      });

      return createResponse(HttpStatus.OK, 'Reports fetched successfully', reports);
    } catch (error: any) {
      return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, 'Error fetching reports');
    }
  }

  async resolveReport(reportId: string, status: string, payload: AtPayload): Promise<AppResponse> {
    try {
      if (!payload.roles.includes(UserRoles.ADMIN) && !payload.roles.includes(UserRoles.MANAGER)) {
        return createResponse(HttpStatus.FORBIDDEN, 'Access Denied: Only Admins or Managers can resolve reports.');
      }

      const report = await this.reportModel.findByPk(reportId);
      if (!report) {
        return createResponse(HttpStatus.NOT_FOUND, 'Report not found');
      }

      report.Status = status;
      report.ResolvedAt = new Date();
      report.ResolvedBy = payload.sub;
      await report.save();

      return createResponse(HttpStatus.OK, 'Report resolved successfully', report);
    } catch (error: any) {
      return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, 'Error resolving report');
    }
  }
}
