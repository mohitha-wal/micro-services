import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {ConfigModule} from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose';
import {UserSchema } from './schema/user.schema';

@Module({
  imports: [
    ConfigModule.forRoot({envFilePath:'.env',isGlobal:true}),
    MongooseModule.forRoot(process.env.DB_URI),
    MongooseModule.forFeature([{name:'User', schema:UserSchema}])
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
