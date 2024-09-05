import { CreateUserDto } from './createUser.dto';
import { UserModule } from './user.module';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { loginDto } from './loginUser.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('register')
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserModule> {
    return this.userService.createUser(createUserDto);
  }
  @Post('login')
  async loginUser(@Body() body: loginDto): Promise<{ message: string }> {
    const userExist = await this.userService.login(body);
    if (!userExist) {
      throw new BadRequestException('Invalid credentials');
    }
    return { message: `${userExist.username} Logged In Successfully` };
  }
}
