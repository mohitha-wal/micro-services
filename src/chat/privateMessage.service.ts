import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PrivateMessage } from './privateMessage.schema';

@Injectable()
export class PrivateMessageService {
  constructor(
    @InjectModel(PrivateMessage.name)
    private privateMessageModel: Model<PrivateMessage>,
  ) {}

  async savePrivateMessage(payload): Promise<PrivateMessage> {
    const newPrivateMessage = new this.privateMessageModel(payload);
    return newPrivateMessage.save();
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
