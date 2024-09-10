import { ConflictException, Injectable } from '@nestjs/common';
import { User } from './schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: mongoose.Model<User>,
    private readonly mailerService: MailerService,
  ) {}
  async createUser(payload): Promise<User> {
    try {
      const existingUser = await this.userModel.find({
        email: payload.email,
      });
      if (existingUser.length) {
        throw new ConflictException('User is already exists. Please login');
      }
      payload.password = await bcrypt.hash(payload.password, 10);
      const user = await this.userModel.create(payload);
      await this.mailerService.sendMail({
        from: 'venkateshlendugure1999@gmail.com',
        to: payload.email,
        subject: 'Welcome to the app!',
        html: `<!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to MicroServicesApp</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              padding: 20px;
            }
            .container {
              background-color: #fff;
              padding: 20px;
              border-radius: 8px;
              max-width: 600px;
              margin: 0 auto;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
              color: #333;
            }
            p {
              color: #555;
            }
            .details {
              margin-top: 20px;
            }
            .details p {
              margin: 5px 0;
            }
            .footer {
              margin-top: 30px;
              font-size: 12px;
              color: #999;
            }
          </style>
        </head>
        <body>
        
          <div class="container">
            <h1>Welcome aboard, ${payload.username}!</h1>
            <p>Your account has been successfully created. We’re excited to have you as part of the MicroServicesApp family!</p>
        
            <div class="details">
              <p><strong>Your account details:</strong></p>
              <p><strong>Username:</strong> ${payload.username}</p>
              <p><strong>Email:</strong> ${payload.email}</p>
            </div>
        
            <p>Log in now to explore your dashboard and start making the most of our features!</p>
        
            <p>Need help? Our support team is ready to assist you.Reach them at ${'support_team@gmail.com'}</p>
        
            <div class="footer">
              <p>Cheers,</p>
              <p>The MicroServicesApp Team</p>
            </div>
          </div>
        
        </body>
        </html>
        `
      });
      return user;
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
