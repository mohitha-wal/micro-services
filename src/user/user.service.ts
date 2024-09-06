import { ConflictException, Injectable } from '@nestjs/common';
import { User } from './schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { UserModule } from './user.module';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: mongoose.Model<User>,
  ) {}
  async createUser(payload): Promise<UserModule> {
    try {
      const existingUser = await this.userModel.find({
        email: payload.email,
      });
      if (existingUser.length) {
        throw new ConflictException('User is already exists. Please login');
      }
      payload.password = await bcrypt.hash(payload.password, 10);
      return await this.userModel.create(payload);
    } catch (error) {
      throw error;
    }
  }
  async findUser(email: string): Promise<User | null> {
    try {
      const userExist = await this.userModel
        .findOne({
          email,
          deletedAt: null,
        })
        .lean();
      if (!userExist) {
        return null;
      }
      return userExist;
    } catch (error) {
      throw error;
    }
  }
}
