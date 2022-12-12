import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { UserController } from './user.controller';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { UserDTO } from './dto/userDTO';
import { CreateUserDto } from './dto/create-user.dto';
import { mockCreateUserDto } from '../Utils/mockCreateUserDto';
import * as request from 'supertest';


describe("user controller with expired jwt", () => {
  let app: INestApplication;
  let controller: UserController;
  const OLD_ENV = process.env;

  beforeEach(async () => {
    jest.resetModules()
    process.env = { ...OLD_ENV };
    process.env.JWT_EXPIRATION_TIME = "0"
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();
    controller = module.get<UserController>(UserController);
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({transform:true}));
    app.use(cookieParser());
    console.log("main Each")
    await app.init();
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  describe("user/update expired jwt", () => {
    let user:UserDTO;
    let cookie:string[];
    const OLD_ENV = process.env;

    beforeAll(() => {
      console.log("before all")
    })

    beforeEach(async () => {
      const createDto: CreateUserDto = mockCreateUserDto()
      const test = await request(app.getHttpServer())
        .post("/auth/register")
        .send(createDto)
      user = test.body;
      const login = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email:createDto.email,
          password:createDto.password
        })
      cookie = login.get("Set-Cookie");
      jest.resetModules()
      process.env = { ...OLD_ENV };
    })

    it('should throw error if jwt has expired',  () => {
      const updateDto = {
        name:"maria"
      };
      return request(app.getHttpServer())
        .patch(`/user/${user.id}`)
        .send(updateDto)
        .set("Cookie", [...cookie])
        .expect(401)
    });
  })
})