import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindAllUserDto } from './dto/findAll-user.dto';
import { UserMapper } from './user.mapper';
import { UserDTO } from './dto/userDTO';
import { PageMetaDto } from '../common/dto/PageMetaDto';
import { PageDTO } from '../common/dto/pageDTO';

@Controller('user')
export class UserController {
  private readonly mapper:UserMapper
  constructor(private readonly userService: UserService) {
    this.mapper = new UserMapper();
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto):Promise<UserDTO> {
    const user = await this.userService.create(createUserDto)
    const dto = this.mapper.entityToDto(user)
    return dto;
  }

  @Get()
  async findAll(@Body() options: FindAllUserDto) {
    const [entities,count] = await this.userService.findAll(options);
    const pageMetaDto = new PageMetaDto({ itemCount:count, pageOptionsDto:options });
    return new PageDTO(entities, pageMetaDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(+id);
    const dto = this.mapper.entityToDto(user)
    return dto;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.userService.update(+id, updateUserDto);
    const dto = this.mapper.entityToDto(user)
    return dto;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
