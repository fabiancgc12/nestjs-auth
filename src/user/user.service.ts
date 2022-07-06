import { Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
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
    const queryBuilder = this.usersRepository.createQueryBuilder("user");

    queryBuilder
      .orderBy("createdAt", pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();
    return [entities,itemCount];
    // const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    //
    // return new PageDTOBase(entities, pageMetaDto);
  }

  async findOne(id: number) {
    let user
    try {
      user = await this.usersRepository.findOne({ where:{id} })
    } catch (e) {
      throw new Error('Something went wrong');
    }
    if (!user){
      throw new EntityDoesNotExistException(`User`,id)
    }
    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
