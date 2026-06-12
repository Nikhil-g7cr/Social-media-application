import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
} from "class-validator";

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
  Password!: string;
}