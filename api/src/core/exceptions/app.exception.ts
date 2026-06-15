// common/exceptions/app.exception.ts

import { HttpException, HttpStatus } from '@nestjs/common';

export interface AppExceptionOptions {
  error: string;
  message: string;
  probableCause: string;
  solution: string;
  statusCode: HttpStatus;
}

export class AppException extends HttpException {
  public readonly error: string;
  public readonly probableCause: string;
  public readonly solution: string;

  constructor(options: AppExceptionOptions) {
    super(
      {
        statusCode: options.statusCode,
        error: options.error,
        message: options.message,
      },
      options.statusCode,
    );

    this.error = options.error;
    this.probableCause = options.probableCause;
    this.solution = options.solution;
  }
}