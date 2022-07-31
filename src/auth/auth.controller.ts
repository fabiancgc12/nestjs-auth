import { Body, Controller, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserDTO } from '../user/dto/userDTO';
import { UserMapper } from '../user/user.mapper';
import { LocalAuthenticationGuard } from './localGuard/localAuthentication.guard';
import { RequestWithUser } from './requestWithUser';
import {Response} from "express"
import { JwtGuard } from './jwtGuard/jwt.guard';

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

  @HttpCode(200)
  @UseGuards(LocalAuthenticationGuard)
  @Post("login")
  async logIn(@Req() request: RequestWithUser,@Res() response:Response) {
    const user = request.user;
    const cookie = this.authService.getCookieWithJwtToken(user.id);
    response.setHeader('Set-Cookie', cookie);
    const dto = this.mapper.entityToDto(user);
    response.send(dto)
  }

  @UseGuards(JwtGuard)
  @Post('logout')
  async logOut(@Req() request: RequestWithUser, @Res() response: Response) {
    response.setHeader('Set-Cookie', this.authService.getCookieForLogOut());
    return response.sendStatus(200);
  }
}