import { CreateUserDto } from './dtos/createUser.dto';
import { UserModule } from './user.module';
import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Patch,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Post('register')
  async createUser(@Body() body: CreateUserDto): Promise<UserModule> {
    return this.userService.createUser(body);
  }
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async loginUser(@Request() req, @Body() body: { socketId: string }) {
    return this.authService.login(req.user, body.socketId);
  }
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
  @UseGuards(JwtAuthGuard)
  @Get('notifications')
  async getNotifications(@Request() req) {
    const allNotifications = await this.userService.fetchNotifications(
      req.user.userId,
    );
    return allNotifications ? allNotifications : [];
  }
}
