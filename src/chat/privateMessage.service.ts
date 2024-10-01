import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PrivateMessage } from './privateMessage.schema';

interface PrivateMessageResponse {
  _id: Types.ObjectId;
  senderId: string;
  message: string;
}

@Injectable()
export class PrivateMessageService {
  constructor(
    @InjectModel(PrivateMessage.name)
    private privateMessageModel: Model<PrivateMessage>,
  ) {}
  
  async savePrivateMessage(payload): Promise<PrivateMessageResponse> {
    const newPrivateMessage = new this.privateMessageModel(payload);
    const savedMessage = await newPrivateMessage.save();
    const { _id, senderId, message } = savedMessage.toObject();
    return { _id, senderId, message };
  }

  async getPrivateMessageHistory(roomName: string): Promise<any[]> {
    return await this.privateMessageModel.find({ roomName }).lean();
  }

  async updateMessageStatus(
    _id: string,
    unRead: boolean,
  ): Promise<PrivateMessage> {
    return this.privateMessageModel.findByIdAndUpdate(
      _id,
      { unRead: unRead },
      { new: true },
    );
  }

  async getAllRoomsList(): Promise<any[]> {
    return await this.privateMessageModel.aggregate([
      {
        $group: {
          _id: '$roomName',
        },
      },
      {
        $project: {
          _id: 0,
          roomName: '$_id',
        },
      },
    ]);
  }
}
