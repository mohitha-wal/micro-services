import { forwardRef, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from 'src/user/user.module';
import { ChatGateway } from '../chat/chat.gateway';
import { Message, MessageSchema } from './message.schema';
import { MessageService } from './message.service';
import { PrivateMessage, PrivateMessageSchema } from './privateMessage.schema';
import { PrivateMessageService } from './privateMessage.service';

@Module({
  imports: [
    forwardRef(() => UserModule),
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    MongooseModule.forFeature([
      { name: PrivateMessage.name, schema: PrivateMessageSchema },
    ]),
  ],
  providers: [ChatGateway, MessageService, PrivateMessageService, JwtService],
  exports: [ChatGateway],
})
export class ChatModule {}
