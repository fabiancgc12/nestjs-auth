import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query, Redirect, Res,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindAllUserDto } from './dto/findAll-user.dto';
import { UserMapper } from './user.mapper';
import { PageMetaDto } from '../common/dto/PageMetaDto';
import { PageDTO } from '../common/dto/pageDTO';
import { SameUserGuard } from '../auth/sameUserGuard/sameUser.guard';
import {Response} from "express"

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
  @UseGuards(SameUserGuard)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.userService.update(+id, updateUserDto);
    return this.mapper.entityToDto(user);
  }

  @Delete(':id')
  @UseGuards(SameUserGuard)
  @Redirect("/auth/logout")
  async remove(@Param('id') id: string,@Res() res:Response):Promise<void> {
    await this.userService.remove(+id);
  }
}
