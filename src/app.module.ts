import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import * as mongoose from 'mongoose';
import { MailerModule } from '@nestjs-modules/mailer';
import { ChatModule } from './chat/chat.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    MailerModule.forRoot({
      transport: {
        host: process.env.GMAIL_HOST,
        port: Number(process.env.GMAIL_PORT),
        secure: true,
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      },
    }),
    MongooseModule.forRoot(process.env.DB_URL),
    ScheduleModule.forRoot(),
    UserModule,
    AuthModule,
    ChatModule,
  ],
  exports: [UserModule],
})
export class AppModule {
  constructor() {
    mongoose.set('debug', true);
  }
}
