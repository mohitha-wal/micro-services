import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema()
export class Message {
  @Prop({ required: true })
  room: string;

  @Prop({ required: true })
  sender: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true, default: true })
  unRead: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
