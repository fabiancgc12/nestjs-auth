import { INestApplication, ValidationPipe } from '@nestjs/common';
import { UserController } from '../user/user.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { databaseTestConnectionModule } from '../../test/DatabaseTestConnectionModule';
import { UserModule } from '../user/user.module';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { generateRandomEmail } from '../Utils/generateRandomEmail';
import * as request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthModule } from './auth.module';

describe('AuthController', () => {
  let app: INestApplication;
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [databaseTestConnectionModule, UserModule,AuthModule]
    }).compile();
    controller = module.get<AuthController>(AuthController);
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe("/auth/register ",() => {
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
        .post("/auth/register")
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
        .post("/auth/register")
        .send(createDto)
        .expect(406)
    });

    it('should throw error if repeated email', async () => {
      const email = generateRandomEmail();
      const createDto: CreateUserDto = {
        name: "carmelo",
        lastName: "campos",
        email,
        password: "1234",
        confirmPassword: "1234"
      }
      await request(app.getHttpServer())
        .post("/auth/register")
        .send(createDto)
      return request(app.getHttpServer())
        .post("/auth/register")
        .send(createDto)
        .expect(406)
    });

    it('should throw error if dto is invalid', async () => {
      let createDto: CreateUserDto = {
        name: "",
        lastName: "",
        email:"",
        password: "",
        confirmPassword: ""
      }
      let test = await request(app.getHttpServer())
        .post("/auth/register")
        .send(createDto)
        .expect(400)
      expect(test.body.message).toBeInstanceOf(Array)
      expect(test.body.message).toContain('name should not be empty')
      expect(test.body.message).toContain('lastName should not be empty')
      expect(test.body.message).toContain('email must be an email')
      expect(test.body.message).toContain('password should not be empty')
      expect(test.body.message).toContain('confirmPassword should not be empty')

      createDto = {
        name: "   ",
        lastName: " ",
        email:"sdcsecf",
        password: "  ",
        confirmPassword: "  "
      }

      test = await request(app.getHttpServer())
        .post("/auth/register")
        .send(createDto)
        .expect(400)
      expect(test.body.message).toBeInstanceOf(Array)
      expect(test.body.message).toContain('name should not be empty')
      expect(test.body.message).toContain('lastName should not be empty')
      expect(test.body.message).toContain('email must be an email')
      expect(test.body.message).toContain('password should not be empty')
      expect(test.body.message).toContain('confirmPassword should not be empty')

      createDto.email = "    ";
      test = await request(app.getHttpServer())
        .post("/auth/register")
        .send(createDto)
        .expect(400)
      expect(test.body.message).toContain('email must be an email')
    });

    it('should not have password property', async () => {
      const email = generateRandomEmail();
      const createDto: CreateUserDto = {
        name: "carmelo",
        lastName: "campos",
        email,
        password: "1234",
        confirmPassword: "1234"
      }
      return request(app.getHttpServer())
        .post("/auth/register")
        .send(createDto)
        .expect('Content-Type', /json/)
        .expect(201)
        .then(res => {
          expect(res.body).not.toHaveProperty("password")
        })
    });
  });

});
