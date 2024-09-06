import { ConflictException, Injectable } from '@nestjs/common';
import { User } from './user.schema';
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
  async login(body): Promise<User | null> {
    try {
      const userExist = await this.userModel.findOne({
        email: body.email,
        deletedAt: null,
      });
      if (
        userExist &&
        (await bcrypt.compare(body.password, userExist.password))
      ) {
        return userExist;
      }
      return null;
    } catch (error) {
      throw error;
    }
  }
}
