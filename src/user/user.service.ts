import { Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { hashPassword } from '../Utils/hashPassword';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto):Promise<User> {
    if (createUserDto.password != createUserDto.confirmPassword)
      throw new NotAcceptableException("Passwords does not match")
    createUserDto.password = await hashPassword(createUserDto.password)
    const newUser = new User(createUserDto.email,createUserDto.name,createUserDto.lastName,createUserDto.password);
    await newUser.save()
    return newUser;
  }

  async findAll():Promise<User[]> {
    const users = await this.usersRepository.find();
    return users;
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOne({ where:{id} })
    if (!user){
      throw new NotFoundException(`User of id: ${id} does not exist`)
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
