import { JwtService } from '@nestjs/jwt';
import { Cron } from '@nestjs/schedule';
import {
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from 'src/user/user.service';
import { MessageService } from './message.service';
import { PrivateMessageService } from './privateMessage.service';
import * as moment from 'moment';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private socketToUserIdMap = new Map<string, string>();
  private usersList: { [userId: string]: string } = {};

  constructor(
    private readonly messageService: MessageService,
    private readonly userService: UserService,
    private readonly privateMessageService: PrivateMessageService,
    private readonly jwtService: JwtService,
  ) {
    this.sendBroadCast();
  }
  updateUserList(socketId: string, id: string) {
    this.usersList[id] = socketId;
  }
  // Separate event for authentication
  @SubscribeMessage('Previous-History')
  async handleAuthenticate(client: Socket, payload) {
    try {
      let token = payload.token;
      // Handle case where token could be a string or string[]
      if (Array.isArray(token)) {
        token = token[0]; // If it's an array, use the first element
      }
      if (!token) {
        throw new Error('Token not Provided');
      }
      const userId = await this.validateToken(token);
      if (!userId) {
        client.disconnect(); // Disconnect if token validation fails
        return;
      }

      this.socketToUserIdMap.set(client.id, userId);
      console.log(
        `User authenticated successfully with userId: ${userId} with socket: ${client.id}`,
      );

      // After successful authentication, handle user-specific logic
      await this.handleUserConnection(client, userId);
    } catch (error) {
      console.error(`Authentication error: ${error.message}`);
      client.disconnect(); // Disconnect if there’s an error
    }
  }

  // Helper method to validate the token and return userId
  private async validateToken(token: string): Promise<string | null> {
    try {
      const result = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET_KEY,
      });
      return result.sub;
    } catch (error) {
      console.error('Token validation failed:', error.message);
      return null;
    }
  }

  // Handle all user-specific logic after successful authentication
  private async handleUserConnection(client: Socket, userId: string) {
    try {
      const [userDetails, privateMessagesGroupsList] = await Promise.all([
        this.userService.findUserById(userId),
        this.privateMessageService.getAllRoomsList(),
      ]);
      const filteredRooms = privateMessagesGroupsList
        .filter((room) => room.roomName.includes(userId))
        .map((room) => room.roomName);

      const privateMessageHistories = await Promise.all(
        filteredRooms.map((roomName) =>
          this.privateMessageService.getPrivateMessageHistory(roomName),
        ),
      );

      client.emit('privateMessage-History', privateMessageHistories);
      const roomName = this.getUserRoomName(userDetails.createdAt);
      const messageHistory =
        await this.messageService.getMessageHistory(roomName);
      client.emit('message-history', messageHistory);
      client.join(roomName);
      // Notify everyone in the room that a new user has joined
      this.server.to(roomName).emit('user-joined', {
        message: `New User Joined the Room userName: ${userDetails.username} and socketId: ${client.id}`,
      });

      // Emit the list of connected users to the room
      await this.emitConnectedUsers();
    } catch (error) {
      console.error(`Error handling user connection: ${error.message}`);
    }
  }

  // Called when a client disconnects from the server
  async handleDisconnect(client: Socket) {
    const user_id = Object.keys(this.usersList).find(
      (key) => this.usersList[key] === client.id,
    );
    if (user_id) {
      delete this.usersList[user_id];
    }
    const userId = this.socketToUserIdMap.get(client.id);
    if (!userId) {
      this.socketToUserIdMap.delete(client.id);
    } else {
      const userDetails = await this.userService.findUserById(userId);
      const roomName = this.getUserRoomName(userDetails.createdAt);
      this.socketToUserIdMap.delete(client.id);
      console.log(`User ${userId} disconnected: ${client.id}`);

      this.server.to(roomName).emit('user-left', {
        message: `User ${userId} Left the Room`,
      });
    }
  }
  sendBroadCast() {
    setInterval(() => {
      Object.keys(this.usersList).forEach(async (userId) => {
        const socketId = this.usersList[userId];
        const userDetails = await this.userService.findUserDetails(userId);
        this.server
          .to(socketId)
          .emit(
            'service',
            `Hello ${userDetails.username}! If you have any feedback or complaints, please mail us at support@gmail.com. We value your input!`,
          );
      });
    }, 300000);
  }
  @SubscribeMessage('message')
  handleMessage(client: any): string {
    return `${client.id}`;
  }
  @SubscribeMessage('readnotification')
  async updatedRead(@MessageBody() body: { notificationId: string }) {
    await this.userService.updateNotification(body.notificationId);
  }

  // Method to emit the list of connected users
  private async emitConnectedUsers() {
    const connectedUsers = await Promise.all(
      Array.from(this.server.sockets.sockets.values()).map(async (socket) => {
        const userId = this.socketToUserIdMap.get(socket.id);
        const user = await this.userService.findUserById(userId);
        return {
          socketId: socket.id,
          userId,
          username: user.username,
          email: user?.email || 'Unknown',
        };
      }),
    );

    this.server.emit('connected-users', connectedUsers);
  }

  // Handle new message events and broadcast them within the room
  @SubscribeMessage('NewMessage')
  async handleNewMessage(client: Socket, message: any) {
    const userId = this.socketToUserIdMap.get(client.id);
    if (!userId) {
      client.disconnect();
      return;
    }
    const userDetails = await this.userService.findUserById(userId);
    const roomName = this.getUserRoomName(userDetails.createdAt);
    console.log(`Message received from ${client.id}:`, message);
    await this.messageService.saveMessage(roomName, userId, message);

    client
      .to(roomName)
      .emit('message-broadcast', `${message} from userId: ${userId}`);
    client.emit('message-received', `${message} from ${client.id}`);
    this.server
      .to(roomName)
      .emit('message-to-room', `${message} from userId: ${userId}`);
  }

  @SubscribeMessage('user-id-for-private-chat')
  async userPrivateChatHistory(client: Socket, payload:any) {
    const senderId = this.socketToUserIdMap.get(client.id);
    if (!senderId) {
      client.disconnect();
      return;
    }
    const roomName = this.getRoomName(senderId, payload.recipientId);
    const privateMessageServiceHistory =
      await this.privateMessageService.getPrivateMessageHistory(roomName);
    client.emit('user-to-user-private-chat-history', privateMessageServiceHistory);
  }

  @SubscribeMessage('PrivateMessage')
  async handlePrivateMessage(client: Socket, payload: any) {
    const senderId = this.socketToUserIdMap.get(client.id);
    if (!senderId) {
      client.disconnect();
      return;
    }

    const recipientId = this.socketToUserIdMap.get(payload.recipientId);
    if (!recipientId) {
      console.error(
        `Recipient with socketId ${payload.recipientId} not found.`,
      );
      return;
    }

    const roomName = this.getRoomName(senderId, recipientId);
    client.join(roomName);
    this.server.sockets.to(payload.recipientId).socketsJoin(roomName);

    await this.privateMessageService.savePrivateMessage({
      roomName,
      senderId,
      recipientId,
      message: payload.message,
    });
    const privateMessageServiceHistory =
      await this.privateMessageService.getPrivateMessageHistory(roomName);
    client.emit('user-to-user-private-chat-history', privateMessageServiceHistory);

    this.server
      .to(roomName)
      .emit('private-message', { senderId, message: payload.message });
  }

  private getRoomName(senderId: string, recipientId: string): string {
    const sortedIds = [senderId, recipientId].sort();
    return `room-${sortedIds[0]}-${sortedIds[1]}`;
  }
  private getUserRoomName(data): string {
    const formattedDate = moment(data).format('YYYY-MM-DD');
    return `MicroServicesAppUsers-${formattedDate}`;
  }

  @SubscribeMessage('privateMessageStatusUpdate')
  async handlePrivateMessageStatusUpdate(
    client: Socket,
    payload: { _id: string; unRead: boolean },
  ) {
    const { _id, unRead } = payload;

    try {
      // Update the private message status by _id
      const updatedMessage =
        await this.privateMessageService.updateMessageStatus(_id, unRead);

      if (!updatedMessage) {
        client.emit('status-update-failed', {
          message: 'Message not found or update failed',
        });
        return;
      }

      // Notify the client of the update
      client.emit('status-updated', {
        message: 'Status updated successfully',
        updatedMessage,
      });
    } catch (error) {
      console.error('Error updating message status:', error);
      client.emit('status-update-failed', {
        message: 'Error updating message status',
      });
    }
  }

  // Cron job that runs every day at 10:00 AM
  @Cron('0 10 * * *')
  async handleDailyUserJoin() {
    const formattedDate = moment(new Date()).format('YYYY-MM-DD');
    const roomName = `MicroServicesAppUsers-${formattedDate}`;
    const users = await this.userService.getAllUsers();
    users.forEach((user) => {
      this.server.to(roomName).emit('user-joined', {
        message: `${user.username} joined the Room`,
      });
    });
  }
}
