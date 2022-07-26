import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import * as request from "supertest";
import { databaseTestConnectionModule } from '../../test/DatabaseTestConnectionModule';
import { UserModule } from './user.module';
import { INestApplication, NotAcceptableException, ValidationPipe } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { generateRandomEmail } from '../Utils/generateRandomEmail';
import { DuplicateKeyException } from '../common/exception/DuplicateKeyException';
import { UserDTO } from './dto/userDTO';

describe('UserController', () => {
  let app: INestApplication;
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [databaseTestConnectionModule, UserModule]
    }).compile();
    controller = module.get<UserController>(UserController);
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe("/user/create ",() => {
    it('should create user and return it', async function() {
      let userData:CreateUserDto = {
        name:"jose",
        lastName:"smith",
        email:generateRandomEmail(),
        password:"1234",
        confirmPassword:"1234"
      }
      const { password,confirmPassword,...toExpect } = userData
      return request(app.getHttpServer())
        .post("/user")
        .send(userData)
        .expect('Content-Type', /json/)
        .expect(201)
        .then(res => {
          expect(res.body).toMatchObject(toExpect)
        })
    });

    it('should throw error if passwords dont match', async () => {
      const createDto: CreateUserDto = {
        name: "fabian",
        lastName: "graterol",
        email: generateRandomEmail(),
        password: "sdcsadc",
        confirmPassword: "sdcssdcscsdadc"
      }
      return request(app.getHttpServer())
        .post("/user")
        .send(createDto)
        .expect(406)
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
      await request(app.getHttpServer())
        .post("/user")
        .send(createDto)
      return request(app.getHttpServer())
        .post("/user")
        .send(createDto)
        .expect(406)
    });

    it('should not have password property', async () => {
      const email = `${Math.random() * 100000}@gmail.com`;
      const createDto: CreateUserDto = {
        name: "carmelo",
        lastName: "campos",
        email,
        password: "1234",
        confirmPassword: "1234"
      }
      return request(app.getHttpServer())
        .post("/user")
        .send(createDto)
        .expect('Content-Type', /json/)
        .expect(201)
        .then(res => {
          expect(res.body).not.toHaveProperty("password")
        })
    });
  });

  describe("/user/get", () => {
    let user:UserDTO;
    beforeEach(async () => {
      const email = `${Math.random() * 100000}@gmail.com`;
      const createDto: CreateUserDto = {
        name: "fabian",
        lastName: "graterol",
        email,
        password: "1234",
        confirmPassword: "1234"
      }
      const test = await request(app.getHttpServer())
        .post("/user")
        .send(createDto)
      user = test.body
    });
    it('should find user by id', async () => {
      const test = await request(app.getHttpServer())
        .get(`/user/${user.id}`)
        .expect(200)
      expect(user).toEqual(test.body)
    });

    it('should throw error if user does not exist', async () => {
      const test = await request(app.getHttpServer())
        .get(`/user/-1`)
        .expect(404)
    });
  })
});
