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
import { generateRandomEmail } from '../Utils/generateRandomEmail';

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

  describe("findOne user", () => {
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

  describe("findByEmail",() => {
    it('should get user by email', async () => {
      const createDto: CreateUserDto = {
        name: "fabian",
        lastName: "graterol",
        email:generateRandomEmail(),
        password: "1234",
        confirmPassword: "1234"
      }
      const newUser = await service.create(createDto);
      const getUser = await service.findByEmail(newUser.email);
      expect(newUser).toEqual(getUser)
    });

    it("should throw error when it does not exist", async () => {
      await expect(() => service.findByEmail("asdaSDASD@doesnotexist.com")).rejects.toThrow(NotFoundException)
      await expect(() => service.findByEmail("asdaSDASD@doesnotexist.com")).rejects.toThrow(`User with email: asdaSDASD@doesnotexist.com does not exist`)
    })

  })

  describe("findAll users", () => {
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

    it("should return users with lastName", async () => {
      const options =  new FindAllUserDto();
      options.lastName = "grate"
      const [entities] = await service.findAll(options);
      expect(entities[0].lastName).toBe("graterol")
    })

    it("should return users with email", async () => {
      const email = `${Math.random() * 100000}@gmail.com`;
      const createDto: CreateUserDto = {
        name: "fabian",
        lastName: "graterol",
        email,
        password: "1234",
        confirmPassword: "1234"
      }
      await service.create(createDto);
      const options =  new FindAllUserDto();
      options.email = email
      const [entities] = await service.findAll(options);
      expect(entities[0].email).toBe(email)
    })

  })

  describe("update user", () => {
    let user:User;

    beforeEach(async () => {
      const email = `${Math.random() * 100000}@gmail.com`;
      const createDto: CreateUserDto = {
        name:"john",
        lastName:"smith",
        email,
        password: "1234",
        confirmPassword: "1234"
      }
      user = await service.create(createDto)
    })

    it('should update name', async () => {
      const updateDto = {
        name:"maria"
      };
      const updated = await service.update(user.id,updateDto);
      const { updatedAt,...toExpect } = {...user,...updateDto};
      expect(updated).toMatchObject(toExpect)
    });

    it('should update all values', async () => {
      const updateDto = {
        name:"maria",
        lastName:"gutierrez",
        email:`${Math.random() * 100000}@gmail.com`

      };
      const updated = await service.update(user.id,updateDto);
      // const {updatedAt,...expected} = updated;
      const { updatedAt,...toExpect } = {...user,...updateDto}
      expect(updated).toMatchObject(toExpect)
    });

    it('should throw error if email already exist',async () => {
      const email = `${Math.random() * 100000}@gmail.com`;
      const createDto: CreateUserDto = {
        name:"john",
        lastName:"smith",
        email,
        password: "1234",
        confirmPassword: "1234"
      }
      const newUser = await service.create(createDto)
      const updateDto = {
        email: newUser.email
      };
      await expect(() => service.update(user.id,updateDto))
        .rejects.toThrow(DuplicateKeyException)
    });
  })

  describe("delete user",() => {
    let user:User;

    beforeEach(async () => {
      const email = `${Math.random() * 100000}@gmail.com`;
      const createDto: CreateUserDto = {
        name:"john",
        lastName:"smith",
        email,
        password: "1234",
        confirmPassword: "1234"
      }
      user = await service.create(createDto)
    })

    it('should delete user', async function() {
      const result = await service.remove(user.id)
      expect(result).toBe(1)
    });

    it('should throw error if user does not exist', async function() {
      await expect(() => service.remove(-1))
        .rejects.toThrowError(EntityDoesNotExistException)
    });

  })
})
