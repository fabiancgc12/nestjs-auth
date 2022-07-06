import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { databaseTestConnectionModule } from '../../test/DatabaseTestConnectionModule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotAcceptableException, NotFoundException } from '@nestjs/common';
import { FindAllUserDto } from './dto/findAll-user.dto';
import { OrderEnum } from '../common/enum/OrderEnum';
import { DuplicateKeyException } from '../common/exception/DuplicateKeyException';
import { EntityDoesNotExistException } from '../common/exception/EntityDoesNotExistException';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
      imports: [databaseTestConnectionModule, TypeOrmModule.forFeature([User])]
    }).compile();

    service = module.get<UserService>(UserService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe("create user", () => {
    it('should create user', async () => {
      const email = `${Math.random() * 100000}@gmail.com`;
      const name = "carmelo";
      const lastName = "campos";
      const createDto: CreateUserDto = {
        name,
        lastName,
        email,
        password: "1234",
        confirmPassword: "1234"
      }
      const userCreated = await service.create(createDto)
      expect(userCreated).toMatchObject({
        name,
        lastName,
        email
      });
    });

    it('should throw error if passwords dont match', async () => {
      const createDto: CreateUserDto = {
        name: "fabian",
        lastName: "graterol",
        email: "fabian@gmail.com",
        password: "1sdcsdc234",
        confirmPassword: "sdcsadc"
      }

      await expect(() => service.create(createDto)).rejects.toThrow(NotAcceptableException);
    });

    it('should throw error if repeated email', async () => {
      const email = `${Math.random() * 100000}@gmail.com`;
      const createDto: CreateUserDto = {
        name: "carmelo",
        lastName: "campos",
        email,
        password: "1234",
        confirmPassword: "1234"
      }
      await service.create(createDto)
      await expect(() => service.create(createDto)).rejects.toThrow(DuplicateKeyException);
    });

  })

  describe("findOne", () => {
    it("should get user by id", async () => {
      const email = `${Math.random() * 100000}@gmail.com`;
      const createDto: CreateUserDto = {
        name: "fabian",
        lastName: "graterol",
        email,
        password: "1234",
        confirmPassword: "1234"
      }
      const userCreated = await service.create(createDto);
      const getUser = await service.findOne(userCreated.id);
      expect(userCreated).toEqual(getUser)
    })

    it("should throw error when it does not exist", async () => {
      await expect(() => service.findOne(-1)).rejects.toThrow(EntityDoesNotExistException)
      await expect(() => service.findOne(-1)).rejects.toThrow("User with id -1 not found")
    })
  })

  describe("findAll", () => {
    it("should return 10 users", async () => {
      const options =  new FindAllUserDto();
      const [entities] = await service.findAll(options);
      expect(entities).toBeInstanceOf(Array)
      if (entities.length >= 0){
        expect(entities[0]).toBeInstanceOf(User)
      }
      expect(entities.length).toBe(10)
    })

    it("should return 0 users", async () => {
      const options =  new FindAllUserDto({take:20,page:2000,order:OrderEnum.DESC});
      const [entities] = await service.findAll(options);
      expect(entities.length).toBe(0)
    })

    it("should return 15 users", async () => {
      const options =  new FindAllUserDto({take:15});
      const [entities] = await service.findAll(options);
      expect(entities.length).toBe(15)
    })
  })

})
