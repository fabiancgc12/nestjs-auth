import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindAllUserDto } from './dto/findAll-user.dto';
import { UserMapper } from './user.mapper';
import { PageMetaDto } from '../common/dto/PageMetaDto';
import { PageDTO } from '../common/dto/pageDTO';
import { JwtGuard } from '../auth/jwtGuard/jwt.guard';
import { SameUserGuard } from '../auth/sameUserGuard/sameUser.guard';

@Controller('user')
export class UserController {
  private readonly mapper:UserMapper
  constructor(private readonly userService: UserService) {
    this.mapper = new UserMapper();
  }

  @Get()
  async findAll(@Query() options: FindAllUserDto) {
    const [entities,count] = await this.userService.findAll(options);
    const pageMetaDto = new PageMetaDto({ itemCount:count, pageOptionsDto:options });
    const dtos = this.mapper.entitiesToDtos(entities)
    return new PageDTO(dtos, pageMetaDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(+id);
    return this.mapper.entityToDto(user);
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.userService.update(+id, updateUserDto);
    return this.mapper.entityToDto(user);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  @UseGuards(SameUserGuard)
  async remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
