import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AuthenticationDto } from './dto/authentication.dto';
import * as bcrypt from "bcrypt";
import { User } from '../user/entities/user.entity';
import { UserDoesNotExist } from '../common/exception/UserDoesNotExist';

@Injectable()
export class AuthService {
  constructor(private readonly userService:UserService) {}

  async getAuthenticatedUser(authenticationDto:AuthenticationDto):Promise<User>{
    try {
      const user:User = await this.userService.findByEmail(authenticationDto.email)
      await this.verifyPassword(authenticationDto.password,user.password)
      return user;
    } catch (e){
      throw new UserDoesNotExist();
    }
  }

  private async verifyPassword(plainPassword:string,hashedPassword:string){
    const isPasswordMatching = bcrypt.compare(plainPassword,hashedPassword)
    if (!isPasswordMatching)
      throw new UserDoesNotExist();
  }
}
