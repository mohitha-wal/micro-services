import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as moment from 'moment';
import { UserService } from 'src/user/user.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@WebSocketGateway({ cors: true })
export class SocketioGateway implements OnGatewayDisconnect {
  constructor() {
    this.sendBroadCast();
  }
  @WebSocketServer()
  server: Server;
  private usersList: { [userId: string]: string } = {};
  private userService: UserService;

  // @SubscribeMessage('message')
  // handleMessage(client: any): string {
  //   return `${client.id}`;
  // }
  updateUserList(socketId: string, id: string) {
    this.usersList[id] = socketId;
  }
  handleDisconnect(client: any) {
    const userId = Object.keys(this.usersList).find(
      (key) => this.usersList[key] === client.id,
    );
    if (userId) {
      delete this.usersList[userId];
    }
  }
  sendNotification(socketId: string, userName: string): void {
    this.server
      .to(socketId)
      .emit('login', `${userName} logged in successfully`);
  }
  sendBroadCast() {
    setInterval(() => {
      this.server.emit(
        'service',
        'Hello Microservice app user! If you have any feedback or complaints, please mail us at support@gmail.com. We value your input!',
      );
    }, 300000);
  }
  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('readnotification')
  async updatedRead(
    @MessageBody() body: { notificationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const userId = client.handshake.auth.userId;
      const data = await this.userService.updateNotification(
        body.notificationId,
        userId,
      );
      client.emit('notificationUpdated', { success: true, data });
    } catch (err) {
      client.emit('notificationUpdated', {
        success: false,
        error: err.message,
      });
    }
  }
}
