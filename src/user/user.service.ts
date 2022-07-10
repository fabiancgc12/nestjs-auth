import { Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FindOptionsWhere, ILike, Like, Repository } from 'typeorm';
import { hashPassword } from '../Utils/hashPassword';
import { PageOptionsDto } from '../common/dto/PageOptionsDto';
import { FindAllUserDto } from './dto/findAll-user.dto';
import { PageDTOBase } from '../common/dto/pageDTOBase';
import { PageMetaDto } from '../common/dto/PageMetaDto';
import { DuplicateKeyException } from '../common/exception/DuplicateKeyException';
import { PostgresErrorCode } from '../common/enum/PostgreErrorEnum';
import { EntityDoesNotExistException } from '../common/exception/EntityDoesNotExistException';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto):Promise<User> {
    if (createUserDto.password != createUserDto.confirmPassword)
      throw new NotAcceptableException("Passwords does not match")
    const password = await hashPassword(createUserDto.password)
    const newUser = new User(createUserDto.email,createUserDto.name,createUserDto.lastName,password);
    try {
      await newUser.save()
    } catch (e) {
      if (e?.code === PostgresErrorCode.UniqueViolation) {
        throw new DuplicateKeyException('User with that email already exists');
      }
      throw new Error('Something went wrong');
    }
    return newUser;
  }

  // async findAll(pageOptionsDto?: FindAllUserDto):Promise<PageDTOBase<User>> {
  async findAll(pageOptionsDto: FindAllUserDto):Promise<[User[],number]> {
    const whereOptions:FindOptionsWhere<User> = this.createWhereOptions(pageOptionsDto)
    const [entities, itemCount] = await this.usersRepository.findAndCount({
      where:whereOptions,
      order:{
        createdAt:pageOptionsDto.order
      },
      skip:pageOptionsDto.skip,
      take:pageOptionsDto.take
    })

    return [entities,itemCount];
    // const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    //
    // return new PageDTOBase(entities, pageMetaDto);
  }

  async findOne(id: number):Promise<User> {
    let user
    try {
      user = await this.usersRepository.findOne({ where:{id}})
    } catch (e) {
      throw new Error('Something went wrong');
    }
    if (!user){
      throw new EntityDoesNotExistException(`User`,id)
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto):Promise<User> {
    const user = await this.findOne(id);
    if (updateUserDto.lastName)
      user.lastName = updateUserDto.lastName;
    if (updateUserDto.email)
      user.email = updateUserDto.email;
    if (updateUserDto.name)
      user.name = updateUserDto.name;
    try {
      await user.save()
    } catch (e) {
      if (e?.code === PostgresErrorCode.UniqueViolation) {
        throw new DuplicateKeyException('User with that email already exists');
      }
      throw new Error('Something went wrong');
    }
    return user
  }

  async remove(id: number){
    const deleteResponse = await this.usersRepository.softDelete(id);
    if (!deleteResponse.affected) {
      throw new EntityDoesNotExistException("User",id);
    }
    return deleteResponse.affected;
  }

  private createWhereOptions(pageOptionsDto: FindAllUserDto):FindOptionsWhere<User> {
    const whereOptions: FindOptionsWhere<User> = {};
    if (pageOptionsDto.firstName)
      whereOptions.name = ILike(`%${pageOptionsDto.firstName}%`)
    if (pageOptionsDto.lastName)
      whereOptions.lastName = ILike(`%${pageOptionsDto.lastName}%`)
    if (pageOptionsDto.email)
      whereOptions.email = ILike(`%${pageOptionsDto.email}%`)
    return whereOptions
  }
}
