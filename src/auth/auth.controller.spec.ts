import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { databaseTestConnectionModule } from '../../test/DatabaseTestConnectionModule';
import { UserModule } from '../user/user.module';
import { CreateUserDto } from '../user/dto/create-user.dto';
import * as request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthModule } from './auth.module';
import { UserDTO } from '../user/dto/userDTO';
import { mockCreateUserDto } from '../Utils/mockCreateUserDto';
import { ConfigModule } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let app: INestApplication;
  let controller: AuthController;
  let service:AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        databaseTestConnectionModule,
        UserModule,
        AuthModule,
        ConfigModule.forRoot({
          isGlobal: true,
      })]
    }).compile();
    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({transform:true}));
    app.use(cookieParser());
    await app.init();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe("/auth/register ",() => {
    it('should create user and return it', async function() {
      let userData:CreateUserDto = mockCreateUserDto()
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
      const createDto = mockCreateUserDto({
        password:"sdcsadc",
        confirmPassword: "sdcssdcscsdadc"
      })
      return request(app.getHttpServer())
        .post("/auth/register")
        .send(createDto)
        .expect(406)
    });

    it('should throw error if repeated email', async () => {
      const createDto: CreateUserDto = mockCreateUserDto()
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
      expect(test.body.message).toContain("name must be longer than or equal to 3 characters")
      expect(test.body.message).toContain("lastName must be longer than or equal to 3 characters")
      expect(test.body.message).toContain('email must be an email')
      expect(test.body.message).toContain("password must be longer than or equal to 6 characters")
      expect(test.body.message).toContain("confirmPassword must be longer than or equal to 6 characters")

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
      expect(test.body.message).toContain("name must be longer than or equal to 3 characters")
      expect(test.body.message).toContain("lastName must be longer than or equal to 3 characters")
      expect(test.body.message).toContain('email must be an email')
      expect(test.body.message).toContain("password must be longer than or equal to 6 characters")
      expect(test.body.message).toContain("confirmPassword must be longer than or equal to 6 characters")

      createDto.email = "    ";
      test = await request(app.getHttpServer())
        .post("/auth/register")
        .send(createDto)
        .expect(400)
      expect(test.body.message).toContain('email must be an email')
    });

    it('should not have password property', async () => {
      const createDto: CreateUserDto = mockCreateUserDto()
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
    let user:UserDTO;
    let mockCreate:CreateUserDto
    beforeEach(async () => {
      mockCreate = mockCreateUserDto()
      const test = await request(app.getHttpServer())
        .post("/auth/register")
        .send(mockCreate)
        .expect(201)
      user = test.body as UserDTO;
    })
    it('should log user and return it', async () => {
      const cookie:string = service.getCookieWithJwtToken(user.id)
      return request(app.getHttpServer())
        .post("/auth/login")
        .send({email:mockCreate.email,password:mockCreate.password})
        .expect('set-cookie', cookie)
        .expect(200)
        .expect(user)
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
      const test = await request(app.getHttpServer())
        .post("/auth/login")
        .send({email:"patata@notexist.com",password:mockCreate.password})
        .expect(400)
      expect(test.body.message).toBe("Wrong credentials provided")
    });

    it('should throw error if password is wrong', async function() {
      const test = await request(app.getHttpServer())
        .post("/auth/login")
        .send({email:user.email,password:"%#$T$#5ferfwef"})
        .expect(400)
      expect(test.body.message).toBe("Wrong credentials provided")
    });
  })

  describe("/auth/logOut",() => {
    let cookie:string[]
    beforeEach(async () => {
      let userData:CreateUserDto = mockCreateUserDto()
      await request(app.getHttpServer())
        .post("/auth/register")
        .send(userData)
      const login = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email:userData.email,
          password:userData.password
        })
      cookie = login.get("Set-Cookie")
    })

    it('should return no cookies', async function() {
      const test = await request(app.getHttpServer())
        .post("/auth/logout")
        .set("Cookie",cookie)
        .expect(200)
      expect(test.get("Set-Cookie")).toEqual([`Authentication=; HttpOnly; Path=/; Max-Age=0`])
    });

    it('should throw error if wrong cookie is sent', function() {
      return request(app.getHttpServer())
        .post("/auth/logout")
        .set("Set-Cookie","Authentication=patata; HttpOnly; Path=/; Max-Age=0")
        .expect(401)
        .expect({
          statusCode:401,
          message:"Unauthorized"
        })
    });

    it('should throw error if no cookie is sent', function() {
      return request(app.getHttpServer())
        .post("/auth/logout")
        .expect(401)
        .expect({
          statusCode:401,
          message:"Unauthorized"
        })
    });
  })
});
