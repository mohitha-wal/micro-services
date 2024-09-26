import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/schema/user.schema';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { SocketioGateway } from 'src/socketio/socketio.gateway';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private socketService: SocketioGateway,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<Partial<User> | null> {
    const userExist = await this.userService.findUser(email);
    if (userExist && (await bcrypt.compare(password, userExist.password))) {
      const { password, ...result } = userExist;
      return result;
    }
    return null;
  }
  async login(
    user: any,
    socketId: string,
  ): Promise<{ token: string; user: Partial<User> }> {
    const payload = { email: user.email, sub: user._id };
    if (user.isLoginPending) {
      await this.userService.saveNotification(
        user._id,
        `${user.username} logged in successfully`,
      );
    }
    this.socketService.updateUserList(socketId, user._id);
    return {
      token: this.jwtService.sign(payload),
      user,
    };
  }
}
