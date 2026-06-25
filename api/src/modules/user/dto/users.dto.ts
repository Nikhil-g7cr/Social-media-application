import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

export class UsersDTO {

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @MinLength(3)
  @Matches(/^[A-Za-z]+$/, { message: 'Full name must only contain alphabets and no spaces' })
  FullName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @MinLength(3)
  @Matches(/^[A-Za-z0-9]+$/, { message: 'Username must only contain alphanumeric characters and no spaces' })
  UserName!: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  @MinLength(7)
  @Matches(/^[a-zA-Z0-9]/, { message: 'Email must start with a letter or number' })
  EmailAddress!: string;

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  @Matches(/^\S*$/, { message: 'Password must not contain spaces' })
  @IsNotEmpty()
  Password!: string;

  // ✅ FIXED: Changed @Min/@Max to @MinLength/@MaxLength
  // ✅ FIXED: Changed @IsNotEmpty to @IsOptional so users aren't forced to write a bio
  @IsOptional() 
  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  Bio?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  ProfilePictureUrl?: string;

  @IsString()
  @IsOptional() // Made optional so users don't have to provide gender if they don't want to
  Gender?: string;

/* ============================================================================================
    Including Role or IsActive in a public signup DTO is risky because attackers can 
    exploit it to create admin or active accounts (privilege escalation).
    Instead, rely on backend defaults (e.g., role = USER, 
    inactive by default) and only allow setting these fields 
    in a separate admin-only DTO protected by authorization.
    ============================================================================================
 */
}