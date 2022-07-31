import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from "bcrypt";
import { User } from '../user/entities/user.entity';
import { UserDoesNotExist } from '../common/exception/UserDoesNotExist';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPayloadI } from './tokenPayloadI';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService:UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async getAuthenticatedUser(email:string,password:string):Promise<User>{
    try {
      const user:User = await this.userService.findByEmail(email)
      await this.verifyPassword(password,user.password)
      return user;
    } catch (e){
      throw new UserDoesNotExist();
    }
  }
  public getCookieWithJwtToken(userId: number) {
    const payload: TokenPayloadI = { userId };
    const token = this.jwtService.sign(payload);
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_EXPIRATION_TIME')}`;
  }

  public getCookieForLogOut() {
    return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
  }

  private async verifyPassword(plainPassword:string,hashedPassword:string){
    const isPasswordMatching = await bcrypt.compare(plainPassword,hashedPassword)
    if (!isPasswordMatching)
      throw new UserDoesNotExist();
  }
}
