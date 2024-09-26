import { CreateUserDto } from './dtos/createUser.dto';
import { UserModule } from './user.module';
import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Response } from 'express';

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
  async loginUser(
    @Request() req,
    @Body() body: { socketId: string },
    @Res() res: Response,
  ) {
    const { token, user } = await this.authService.login(
      req.user,
      body.socketId,
    );
    res.setHeader('Authorization', token);
    res.setHeader('Access-Control-Expose-Headers', 'Authorization');
    return res.status(200).json({
      success: true,
      data: user,
    });
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
