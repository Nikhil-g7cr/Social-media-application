import {
    IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  Max,
  MaxLength,
  Min,
  minLength,
} from 'class-validator';
import { UserRoles } from 'src/databse/mssql/models';
export class UsersDTO {
  @IsString()
  @IsNotEmpty()
  ID!: string;

  @IsString()
  @IsNotEmpty()
  @Max(50)
  @Min(1)
  FullName!: string;

  @IsString()
  @IsNotEmpty()
  @Max(50)
  @Min(1)
  UserName!: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  EmailAddress!: string;

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  @IsNotEmpty()
  Password!: string;

  @IsNotEmpty()
  @IsString()
  @Min(5)
  @Max(2000)
  Bio?:string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  ProfilePictureUrl?: string;

  @IsNotEmpty()
  Gender?:string

/*  
    ============================================================================================
    Including Role or IsActive in a public signup DTO is risky because attackers can 
    exploit it to create admin or active accounts (privilege escalation).
    Instead, rely on backend defaults (e.g., role = USER, 
    inactive by default) and only allow setting these fields 
    in a separate admin-only DTO protected by authorization.
    ============================================================================================
 */

}
