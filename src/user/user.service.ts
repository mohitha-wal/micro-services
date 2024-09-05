import { ConflictException, Injectable } from '@nestjs/common';
import { User } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { UserModule } from './user.module';
import { CreateUserDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: mongoose.Model<User>,
  ) {}
  async createUser(createUserDto: CreateUserDto): Promise<UserModule> {
    try {
      const currentDate = new Date();
      const existingUser = await this.userModel.find({ email: createUserDto.email });
      if (existingUser.length) {
        throw new ConflictException('User is already exists. Please login the Application');
      }
      return await this.userModel.create({
        ...createUserDto,
        createdAt: currentDate,
        updatedAt: currentDate
      });
    } catch (error) {
      throw error;
    }
  }
}
