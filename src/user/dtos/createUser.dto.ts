import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

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
  @Matches(/^(?=.*[0-9]).*$/, {
    message: 'Password must contain at least one number',
  })
  @Matches(/^(?=.*[!@#$%^&*()\-_=+{};:,<.>]).*$/, {
    message: 'Password must contain at least one special character',
  })
  readonly password: string;

  @IsString()
  @Matches(/^\+\d{1,3}\d{7,14}$/, {
    message:
      'Phone number must be a valid international format starting with + and followed by digits',
  })
  readonly phoneNumber: string;
}
