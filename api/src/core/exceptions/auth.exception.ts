// common/exceptions/auth.exception.ts

import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class InvalidCredentialsException extends AppException {
  constructor() {
    super({
      error: 'UnauthorizedException',
      statusCode: HttpStatus.UNAUTHORIZED,
      message: 'Invalid email or password.',
      probableCause: 'Password mismatch or user does not exist.',
      solution: 'Verify credentials and try again.',
    });
  }
}