import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { databaseTestConnectionModule } from '../../test/DatabaseTestConnectionModule';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { NotAcceptableException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {

          },
        }],
      imports:[databaseTestConnectionModule]
    }).compile();

    service = module.get<UserService>(UserService);
  });


  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create', async () => {
    const email = `${Math.random()*100000}@gmail.com`;
    const createDto:CreateUserDto = {
      name:"fabian",
      lastName:"graterol",
      email,
      password:"1234",
      confirmPassword:"1234"
    }
    const userCreated = await service.create(createDto)
    expect(userCreated).toBeInstanceOf(User);
    expect(userCreated).toMatchObject({
      name:"fabian",
      lastName:"graterol",
      email
    });
    expect(userCreated).not.toHaveProperty("password")
  });

  it('should throw error if passwords dont match',  async () => {
    const createDto:CreateUserDto = {
      name:"fabian",
      lastName:"graterol",
      email:"fabian@gmail.com",
      password:"1sdcsdc234",
      confirmPassword:"sdcsadc"
    }

    await expect(() => service.create(createDto)).rejects.toThrow(NotAcceptableException);
  });

});
