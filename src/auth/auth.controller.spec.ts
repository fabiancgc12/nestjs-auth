import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { databaseTestConnectionModule } from '../../test/DatabaseTestConnectionModule';
import { UserModule } from '../user/user.module';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { generateRandomEmail } from '../Utils/generateRandomEmail';
import * as request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthModule } from './auth.module';
import { UserDTO } from '../user/dto/userDTO';

function generateDtoForUserCreation(options: Partial<CreateUserDto> = {}):CreateUserDto {
  return {
    name:options.name ?? "jose",
    lastName:options.lastName ?? "smith",
    email:options.email ?? generateRandomEmail(),
    password:options.password ?? "1234",
    confirmPassword:options.confirmPassword ?? "1234"
  }
}

describe('AuthController', () => {
  let app: INestApplication;
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [databaseTestConnectionModule, UserModule,AuthModule]
    }).compile();
    controller = module.get<AuthController>(AuthController);
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({transform:true}));
    await app.init();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe("/auth/register ",() => {
    it('should create user and return it', async function() {
      let userData:CreateUserDto = generateDtoForUserCreation()
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
      const createDto = generateDtoForUserCreation({
        password:"sdcsadc",
        confirmPassword: "sdcssdcscsdadc"
      })
      return request(app.getHttpServer())
        .post("/auth/register")
        .send(createDto)
        .expect(406)
    });

    it('should throw error if repeated email', async () => {
      const createDto: CreateUserDto = generateDtoForUserCreation()
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
      const createDto: CreateUserDto = generateDtoForUserCreation()
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

  describe("/auth/login",() => {
    it('should log user and return it', async () => {
      let userData:CreateUserDto = generateDtoForUserCreation()
      const test = await request(app.getHttpServer())
        .post("/auth/register")
        .send(userData)
        .expect(201)
      const newUser = test.body as UserDTO;
      return request(app.getHttpServer())
        .post("/auth/login")
        .send({email:userData.email,password:userData.password})
        .expect(200)
        .expect(newUser)
    });

    it('should throw error if fields are incorrect', async () => {
      const test = await request(app.getHttpServer())
        .post("/auth/login")
        .send({email:"",password:""})
        .expect(401)
      expect(test.body.message).toBe('Unauthorized')
    });

    it('should throw error if email does not exist', async function() {
      const test = await request(app.getHttpServer())
        .post("/auth/login")
        .send({email:"patata@notexist.com",password:"1234"})
        .expect(400)
      expect(test.body.message).toBe("Wrong credentials provided")
    });

    it('should throw error if email is wrong', async function() {
      let userData:CreateUserDto = generateDtoForUserCreation()
      await request(app.getHttpServer())
        .post("/auth/register")
        .send(userData)
        .expect(201)
      const test = await request(app.getHttpServer())
        .post("/auth/login")
        .send({email:"patata@notexist.com",password:userData.password})
        .expect(400)
      expect(test.body.message).toBe("Wrong credentials provided")
    });

    it('should throw error if password is wrong', async function() {
      let userData:CreateUserDto = generateDtoForUserCreation()
      let test = await request(app.getHttpServer())
        .post("/auth/register")
        .send(userData)
        .expect(201)
      const user = test.body as UserDTO
      test = await request(app.getHttpServer())
        .post("/auth/login")
        .send({email:user.email,password:"%#$T$#5ferfwef"})
        .expect(400)
      expect(test.body.message).toBe("Wrong credentials provided")
    });
  })
});
