import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {User} from './schema/user.schema'
import * as mongoose from 'mongoose';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(User.name)
    private userModel:mongoose.Model<User>

  ){

  }
  async getUsers(): Promise<User[]> {
   const users = await this.userModel.find()
   return users
  }
  async addUser(body:User): Promise<User>{
    const user = await this.userModel.create(body);
    return user
  }
  async getUser(id:string): Promise<User> {
    const user = await this.userModel.findOne({_id:id});
    return user
   }
   async deleteUser(id:string) {
    const user = await this.userModel.findByIdAndDelete({_id:id});
    return user
   }
   async updateUser(body:User,id:string): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(id,body);
    return user
   }
}
