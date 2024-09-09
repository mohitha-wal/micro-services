import { Injectable } from '@nestjs/common';
import { User } from 'src/user/user.schema';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt'; 

@Injectable()
export class AuthService {
    constructor(
        private userService:UserService,
        private jwtService: JwtService
        ){}
    
    async validateUser(email, password): Promise<Partial<User> | null> {

        const user = await this.userService.findOne(email);
        if(user && await bcrypt.compare(password, user.password)) {
            const {password, ...result } = user;
            return result
        }
        return null;
    }

    async login(user: any) {
        try{
            const payload = { email: user.email, sub: user._id };
            return {
                access_token: this.jwtService.sign(payload)
            }
        } catch(err) {
            throw new err;
        }
    }
}
