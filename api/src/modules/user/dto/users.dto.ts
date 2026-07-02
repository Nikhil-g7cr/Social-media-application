import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
}

// export enum createdBy {
//   USER = 'USER',
//   ADMIN = 'ADMIN'
// }

export class UsersDTO {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[\p{L}]+(?:[ '-][\p{L}]+)*$/u, {
    message:
      'Full name may only contain letters, spaces, apostrophes (\') and hyphens (-).',
  })
  FullName!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^(?!.*[._]{2})(?![._])[a-zA-Z0-9._]+(?<![._])$/, {
    message:
      "Username may contain letters, numbers, periods (.) and underscores (_). It cannot start/end with '.' or '_' or contain consecutive '.' or '_'.",
  })
  UserName!: string;

  @IsEmail({}, { message: 'Please enter a valid email address.' })
  @IsNotEmpty()
  @MaxLength(255)
  EmailAddress!: string;

  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.',
    },
  )
  @Matches(/^\S*$/, {
    message: 'Password cannot contain spaces.',
  })
  Password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  Bio?: string;

  @IsOptional()
  @MaxLength(1000)
  ProfilePictureUrl?: string;

  @IsOptional()
  @IsEnum(Gender, {
    message: 'Gender must be Male, Female or Other.',
  })
  Gender?: Gender;

  // @IsEnum(createdBy,{})
  // @IsString()
  // CreatedBy!:string


  /* ============================================================================================
      Including Role or IsActive in a public signup DTO is risky because attackers can
      exploit it to create admin or active accounts (privilege escalation).
      Instead, rely on backend defaults (e.g., Role = USER,
      IsActive = true/false as appropriate) and expose these
      fields only through admin-protected DTOs.
     ============================================================================================ */
}