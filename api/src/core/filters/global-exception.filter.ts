import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppResponse } from '../../shared/appresponse.shared'

@Catch() // Catch all exceptions
export class GlobalExceptionFilter implements ExceptionFilter {
  
  // Optional: You can inject your custom AppLogger here to log the errors automatically
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let errorType = 'InternalError';

    // 1. Handle standard NestJS HttpExceptions (ValidationPipe, NotFound, etc.)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse: any = exception.getResponse();
      
      message = exceptionResponse.message || exception.message;
      errorType = exception.name;
    } 
    // 2. Handle ORM/Database Errors (Example uses Sequelize names)
    else if (exception.name === 'SequelizeUniqueConstraintError') {
      status = HttpStatus.CONFLICT; // 409 Conflict
      message = exception.errors ? exception.errors.map((err: any) => err.message) : 'Duplicate entry found';
      errorType = 'UniqueConstraintError';
    } 
    else if (exception.name === 'SequelizeValidationError') {
      status = HttpStatus.UNPROCESSABLE_ENTITY; // 422 Unprocessable Entity
      message = exception.errors ? exception.errors.map((err: any) => err.message) : 'Database validation failed';
      errorType = 'ValidationError';
    } 
    else if (exception.name === 'SequelizeForeignKeyConstraintError') {
      status = HttpStatus.BAD_REQUEST; // 400 Bad Request
      message = 'Cannot complete operation due to related records constraint';
      errorType = 'ForeignKeyConstraintError';
    }
    // 3. Handle Authentication/JWT Errors
    else if (exception.name === 'TokenExpiredError') {
      status = HttpStatus.UNAUTHORIZED; // 401 Unauthorized
      message = 'Your session has expired. Please log in again.';
      errorType = 'TokenExpiredError';
    } 
    else if (exception.name === 'JsonWebTokenError' || exception.name === 'NotBeforeError') {
      status = HttpStatus.UNAUTHORIZED; // 401 Unauthorized
      message = 'Invalid authentication token provided.';
      errorType = 'JsonWebTokenError';
    }
    // 4. Fallback for unhandled Error objects
    else if (exception instanceof Error) {
      message = exception.message;
      errorType = exception.name;
    }

    // Log the error (crucial for debugging 500s)
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(`[${request.method}] ${request.originalUrl} - ${exception.stack || exception}`);
    }

    // Extract the primary message string if it's an array (often happens with ValidationPipe)
    const primaryMessage = Array.isArray(message) ? message[0] : message;
    const additionalDetails = Array.isArray(message) ? message : undefined;

    // Construct the response using your AppResponse format
    const errorResponse: AppResponse = {
      code: status,
      message: primaryMessage,
      description: additionalDetails, // Keep the array of validation errors here
      data: {
        error: errorType,
        path: request.originalUrl,
        method: request.method,
        timestamp: new Date().toISOString(),
      }
    };

    response.status(status).json(errorResponse);
  }
}