import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
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

  @SubscribeMessage('message')
  handleMessage(client: any): string {
    return `${client.id}`;
  }
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
  sendBroadCast() {
    setInterval(() => {
      Object.keys(this.usersList).forEach((userId) => {
        const socketId = this.usersList[userId];
        this.server
          .to(socketId)
          .emit(
            'service',
            `Hello ${userId}! If you have any feedback or complaints, please mail us at support@gmail.com. We value your input!`,
          );
      });
      // this.usersList.map((user) => {
      //   this.server
      //     .to(user.socketId)
      //     .emit(
      //       'service',
      //       'Hello Microservice app user! If you have any feedback or complaints, please mail us at support@gmail.com. We value your input!',
      //     );
      // });
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
