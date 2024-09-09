import {
  IsEmail,
  IsNumber,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  readonly username: string;

  @IsEmail()
  readonly email: string;

  @IsString()
  @Matches(/^(?=.*[a-zA-Z]).*$/, {
    message: 'Password must contain at least one letter',
  })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  // Ensure password contains at least one number
  @Matches(/^(?=.*[0-9]).*$/, {
    message: 'Password must contain at least one number',
  })
  // Ensure password contains at least one special character
  @Matches(/^(?=.*[!@#$%^&*()\-_=+{};:,<.>]).*$/, {
    message: 'Password must contain at least one special character',
  })
  readonly password: string;

  @IsNumber()
  readonly phoneNumber: number;
}
