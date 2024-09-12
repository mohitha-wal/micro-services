import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop()
  username: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  phoneNumber: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ default: null })
  deletedAt: Date;
}
export const UserSchema = SchemaFactory.createForClass(User);
