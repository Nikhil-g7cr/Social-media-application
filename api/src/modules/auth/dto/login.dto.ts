import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  ValidateBy,
} from "class-validator";
import { Transform } from 'class-transformer';
import {
  EMAIL_VALIDATION_MESSAGE,
  isValidAppEmail,
  normalizeEmail,
} from '../../../core/utils/email-validation';

export class LoginDto {
  @ApiProperty({
    description: "User email address",
    example: "john.doe@example.com",
  })
  @IsNotEmpty({
    message: "Email address is required.",
  })
  @IsEmail(
    {},
    {
      message: "Please provide a valid email address.",
    },
  )
  @ValidateBy({
    name: 'isValidAppEmail',
    validator: {
      validate: (value: unknown) =>
        typeof value === 'string' && isValidAppEmail(value),
    },
  }, { message: EMAIL_VALIDATION_MESSAGE })
  @Transform(({ value }) =>
    typeof value === 'string' ? normalizeEmail(value) : value,
  )
  @Matches(/^[a-zA-Z0-9]/, { message: 'Email must start with a letter or number' })
  EmailAddress!: string;

  @ApiProperty({
    description: "User password",
    example: "SuperSecretPassword123!",
  })
  @IsNotEmpty({
    message: "Password is required.",
  })
  @IsString({
    message: "Password must be a string.",
  })
  @MinLength(8, {
    message: "Password must be at least 8 characters long.",
  })
  @Matches(/^\S*$/, { message: 'Password must not contain spaces' })
  Password!: string;
}
