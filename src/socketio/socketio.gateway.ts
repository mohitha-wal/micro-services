import {
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { UserService } from 'src/user/user.service';

@WebSocketGateway({ cors: true })
export class SocketioGateway implements OnGatewayDisconnect {
  constructor(private userService: UserService) {
    this.sendBroadCast();
  }
  @WebSocketServer()
  server: Server;
  private usersList: { [userId: string]: string } = {};

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
      // Object.keys(this.usersList).forEach((userId) => {
      //   const socketId = this.usersList[userId];
      //   this.server
      //     .to(socketId)
      //     .emit(
      //       'service',
      //       `Hello ${userId}! If you have any feedback or complaints, please mail us at support@gmail.com. We value your input!`,
      //     );
      // });
      this.server.emit(
        'service',
        'Hello Microservice app user! If you have any feedback or complaints, please mail us at support@gmail.com. We value your input!',
      );
    }, 300000);
  }
  @SubscribeMessage('readnotification')
  async updatedRead(@MessageBody() body: { notificationId: string }) {
    await this.userService.updateNotification(body.notificationId);
  }
}
