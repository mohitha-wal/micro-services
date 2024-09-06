import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class loginDto {
  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsString()
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'password is required' })
  password: string;
}
