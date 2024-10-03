import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './message.schema';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  // Save a new message to the database
  async saveMessage(
    room: string,
    sender: string,
    message: string,
  ): Promise<Message> {
    const newMessage = new this.messageModel({ room, sender, message });
    return newMessage.save();
  }

  // Retrieve the message history for a given room
  async getMessageHistory(room: string): Promise<Message[]> {
    return this.messageModel.find({ room }).sort({ createdAt: 1 }).exec();
  }
}
