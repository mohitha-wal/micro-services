import { ConflictException, Injectable } from '@nestjs/common';
import { User } from './schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { UserModule } from './user.module';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';
import { TwilioService } from 'nestjs-twilio';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: mongoose.Model<User>,
    private readonly mailService: MailerService,
    private twilioService: TwilioService,
  ) {}
  async createUser(payload): Promise<UserModule> {
    try {
      const existingUser = await this.userModel.find({
        email: payload.email,
      });
      if (existingUser.length) {
        throw new ConflictException('User already exists. Please login');
      }
      payload.password = await bcrypt.hash(payload.password, 10);
      const newUser = await this.userModel.create(payload);
      if (newUser) {
        await this.mailService.sendMail({
          from: process.env.GMAIL_USER,
          to: payload.email,
          subject: 'Registration Successful for MicroServiceApp',
          html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #4CAF50;">Welcome to MicroServicesApp, ${payload.username}!</h2>
            <p>We’re excited to have you on board. Your account has been successfully created, and you're now part of the MicroServicesApp community.</p>
      
            <h3>Here are your account details:</h3>
            <ul>
              <li><strong>Username:</strong> ${payload.username}</li>
              <li><strong>Email:</strong> ${payload.email}</li>
            </ul>
      
            <p>To get started, log in to your dashboard and explore the features we have built for you!</p>
    
      
            <p>If you have any questions, feel free to reach out to our support team.</p>
      
            <p>Cheers,</p>
            <p>The MicroServicesApp Team</p>
            <hr />
            <p style="font-size: 12px; color: #777;">You’re receiving this email because you signed up for YourApp. If this wasn’t you, please ignore this email.</p>
          </div>
        `,
        });

        await this.twilioService.client.messages.create({
          body: `Hi ${payload.username}, 🎉 Welcome to MicroServicesApp! Your account is all set. Start exploring our features now! 🚀 - The MicroServicesApp Team`,
          from: process.env.SMS_From_Phone_Number,
          to: `+91${payload.phoneNumber}`,
        });
      }
      return newUser;
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
