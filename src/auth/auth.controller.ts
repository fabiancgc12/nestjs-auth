import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserDTO } from '../user/dto/userDTO';
import { UserMapper } from '../user/user.mapper';

@Controller("auth")
export class AuthController {
  private readonly mapper:UserMapper
  constructor(
    private readonly authService:AuthService,
    private readonly userService:UserService
  ) {
    this.mapper = new UserMapper();
  }

  @Post("register")
  async create(@Body() createUserDto: CreateUserDto):Promise<UserDTO> {
    const user = await this.userService.create(createUserDto)
    return this.mapper.entityToDto(user);
  }
}