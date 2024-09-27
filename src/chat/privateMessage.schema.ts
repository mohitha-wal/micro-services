import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class PrivateMessage {
  @Prop({ required: true })
  roomName: string;

  @Prop({ required: true })
  senderId: string;

  @Prop({ required: true })
  recipientId: string;

  @Prop({ required: true })
  message: String;

  @Prop({ required: true, default: true })
  unRead: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ default: null })
  deletedAt: Date;
}

export const PrivateMessageSchema =
  SchemaFactory.createForClass(PrivateMessage);
