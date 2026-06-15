// common/filters/global-exception.filter.ts

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppException } from '../exceptions/app.exception';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('GlobalExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();

    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

    const clientResponse = {
      statusCode: statusCode,
      error: 'Internal Server Error',
      message: 'Something went wrong.',
      path: request.originalUrl,
    };

    const internalLog = {
      error: 'InternalServerError',
      statusCode,
      endpoint: request.originalUrl,
      message: 'Unexpected error occurred.',
      probableCause: 'Unknown',
      solution: 'Check stack trace.',
      stackTrace: '',
      timestamp: new Date().toISOString(),
    };

    if (exception instanceof AppException) {
      statusCode = exception.getStatus();

      clientResponse.statusCode = statusCode;
      clientResponse.error = exception.error.replace('Exception', '');
      clientResponse.message = exception.message;
      clientResponse.path = request.originalUrl;

      internalLog.error = exception.error;
      internalLog.statusCode = statusCode;
      internalLog.endpoint = request.originalUrl;
      internalLog.message = exception.message;
      internalLog.probableCause = exception.probableCause;
      internalLog.solution = exception.solution;
      internalLog.stackTrace = exception.stack || '';
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();

      clientResponse.statusCode = statusCode;
      clientResponse.error = exception.name;
      clientResponse.message =
        (exception.getResponse() as any)?.message ??
        exception.message;

      internalLog.error = exception.name;
      internalLog.statusCode = statusCode;
      internalLog.message = exception.message;
      internalLog.stackTrace = exception.stack || '';
    } else if (exception instanceof Error) {
      internalLog.error = exception.name;
      internalLog.message = exception.message;
      internalLog.stackTrace = exception.stack || '';
    }

    // Internal log
    this.logger.error(JSON.stringify(internalLog, null, 2));

    // Client response
    response.status(statusCode).json(clientResponse);
  }
}