import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from "bcrypt";
import { User } from '../user/entities/user.entity';
import { UserDoesNotExist } from '../common/exception/UserDoesNotExist';

@Injectable()
export class AuthService {
  constructor(private readonly userService:UserService) {}

  async getAuthenticatedUser(email:string,password:string):Promise<User>{
    try {
      const user:User = await this.userService.findByEmail(email)
      await this.verifyPassword(password,user.password)
      return user;
    } catch (e){
      throw new UserDoesNotExist();
    }
  }

  private async verifyPassword(plainPassword:string,hashedPassword:string){
    const isPasswordMatching = await bcrypt.compare(plainPassword,hashedPassword)
    if (!isPasswordMatching)
      throw new UserDoesNotExist();
  }
}
