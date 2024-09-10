import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import * as mongoose from 'mongoose';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    MongooseModule.forRoot(process.env.DB_URL),
    MailerModule.forRoot(
      {
        transport: {
          host: process.env.EMAIL_HOST,
          port: 465,
          secure: true,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          },
        },
      }),
    UserModule,
    AuthModule,
  ],
  exports: [UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor() {
    mongoose.set('debug', true);
  }
}
