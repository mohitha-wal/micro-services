import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { AppService } from './app.service';
import {User} from './schema/user.schema'
import {createUserDto} from './dtos/createUser.dto'
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getUsers(): Promise<User[]> {
    return this.appService.getUsers();
  }
  @Post()
   async addUser(@Body() body: createUserDto):Promise<User>{
    console.log(body)
    return this.appService.addUser(body)
  }

  @Get(':id')
  async getUser(@Param('id') id:string):Promise<User>{
    return this.appService.getUser(id)
  }
  @Delete(':id')
  async deleteUser(@Param('id') id:string){
  return this.appService.deleteUser(id)
  }
  @Patch(':id')
  async updateUser(@Body() body:User,@Param('id') id:string):Promise<User>{
    return this.appService.updateUser(body,id)

  }
  @Put(':id')
  async updatingUser(@Param('id') id:string,@Body() body:User):Promise<User>{
    return this.appService.updateUser(body,id)

  }
}
