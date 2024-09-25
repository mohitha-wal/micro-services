import {
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import * as moment from 'moment';

@WebSocketGateway()
export class SocketioGateway implements OnGatewayDisconnect {
  constructor() {
    this.sendBroadCast();
  }
  @WebSocketServer()
  server: Server;
  private usersList: { [userId: string]: string } = {};

  @SubscribeMessage('message')
  handleMessage(client: any): string {
    return `${client.id}`;
  }
  handleDisconnect(client: any) {
    const userId = Object.keys(this.usersList).find(
      (key) => this.usersList[key] === client.id,
    );
    if (userId) {
      delete this.usersList[userId];
    }
  }
  sendNotification(socketId: string, userName: string, email: string): void {
    this.usersList[email] = socketId;
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
}
