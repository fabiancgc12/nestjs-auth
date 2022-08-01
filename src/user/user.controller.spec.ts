import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import * as request from "supertest";
import { databaseTestConnectionModule } from '../../test/DatabaseTestConnectionModule';
import { UserModule } from './user.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { generateRandomEmail } from '../Utils/generateRandomEmail';
import { UserDTO } from './dto/userDTO';
import { PageMetaDto } from '../common/dto/PageMetaDto';
import { OrderEnum } from '../common/enum/OrderEnum';
import { mockCreateUserDto } from '../Utils/mockCreateUserDto';
import { AuthModule } from '../auth/auth.module';
import * as cookieParser from 'cookie-parser';
import { ConfigModule } from '@nestjs/config';

describe('UserController', () => {
  let app: INestApplication;
  let controller: UserController;

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
    controller = module.get<UserController>(UserController);
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({transform:true}));
    app.use(cookieParser());
    await app.init();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe("/user/get", () => {
    let user:UserDTO;
    beforeEach(async () => {
      const createDto: CreateUserDto = mockCreateUserDto()
      const test = await request(app.getHttpServer())
        .post("/auth/register")
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
      return request(app.getHttpServer())
        .get(`/user/-1`)
        .expect(404)
    });

    it('should not have password field', async () => {
      const test = await request(app.getHttpServer())
        .get(`/user/${user.id}`)
      expect(test.body).not.toHaveProperty("password")
    });

  })

  describe("/findAll", () => {
    it("should return 10 users", async () => {
      const test = await request(app.getHttpServer())
        .get("/user")
        .expect(200);
      expect(test.body.data).toBeInstanceOf(Array)
      expect(test.body.data.length).toBe(10);
      expect(test.body.data[0]).toMatchObject<UserDTO>({
        id:expect.any(Number),
        name: expect.any(String),
        lastName:expect.any(String),
        email:expect.any(String),
        createdAt:expect.any(String),
        updatedAt:expect.any(String),
        deletedAt:null,
      })
      expect(test.body.meta).toMatchObject<PageMetaDto>({
        page:1,
        take: 10,
        itemCount:expect.any(Number),
        pageCount:expect.any(Number),
        hasPreviousPage:false,
        hasNextPage:expect.any(Boolean),
      });
    })

    it("should return 0 users", async () => {
      const test = await request(app.getHttpServer())
        .get("/user")
        .query({take:20,page:2000,order:OrderEnum.DESC})
        .expect(200);
      expect(test.body.data).toBeInstanceOf(Array)
      expect(test.body.data.length).toBe(0)
      expect(test.body.meta).toMatchObject<PageMetaDto>({
        page:2000,
        take: 20,
        itemCount:expect.any(Number),
        pageCount:expect.any(Number),
        hasPreviousPage:expect.any(Boolean),
        hasNextPage:expect.any(Boolean),
      });
    })

    it("should return 15 users", async () => {
      const test = await request(app.getHttpServer())
        .get("/user")
        .query({take:15,page:2})
        .expect(200);
      expect(test.body.data).toBeInstanceOf(Array)
      expect(test.body.data.length).toBe(15)
      expect(test.body.meta).toMatchObject<PageMetaDto>({
        page:2,
        take: 15,
        itemCount:expect.any(Number),
        pageCount:expect.any(Number),
        hasPreviousPage:true,
        hasNextPage:expect.any(Boolean),
      });
    })

    it("should return users with lastName", async () => {
      const createDto: CreateUserDto = mockCreateUserDto({
        lastName:"loaiza"
      })
      const createdTest = await request(app.getHttpServer())
        .post("/auth/register")
        .send(createDto)
      const user = createdTest.body
      const test = await request(app.getHttpServer())
        .get("/user")
        .query({lastName:"loaiza"})
        .expect(200);
      expect(test.body.data.length).toBeGreaterThanOrEqual(1)
      expect(test.body.data[0].lastName).toBe(user.lastName)
    })

    it("should return users with email", async () => {
      const email = generateRandomEmail()
      const createDto: CreateUserDto = mockCreateUserDto({
        email
      })
      const createdTest = await request(app.getHttpServer())
        .post("/auth/register")
        .send(createDto)
      const user = createdTest.body as UserDTO
      const test = await request(app.getHttpServer())
        .get("/user")
        .query({email:email})
        .expect(200);
      expect(test.body.data).toBeInstanceOf(Array)
      expect(test.body.data.length).toBe(1)
      expect(test.body.data[0]).toEqual(
        expect.objectContaining(user)
      )
    })

    it("should not have password in their fields", async () => {
      const test = await request(app.getHttpServer())
        .get("/user")
      expect(test.body.data).toEqual(
        expect.arrayContaining(
          [expect.not.objectContaining(
            {password:expect.any(String)}
            )]
        )
      )
    })

    it('should throw error if dto is invalid', async () => {
      let test = await request(app.getHttpServer())
        .get("/user")
        .query({
          firstName:"",
          lastName:"",
          email:"",
          order:"dcdsce",
          take:10000,
          page:undefined
        })
        .expect(400);
      expect(test.body.message).toBeInstanceOf(Array)
      expect(test.body.message).toContain('firstName should not be empty')
      expect(test.body.message).toContain('lastName should not be empty')
      expect(test.body.message).toContain('email must be an email')
      expect(test.body.message).toContain('order must be a valid enum value')
      expect(test.body.message).toContain('take must not be greater than 50');

      test = await request(app.getHttpServer())
        .get("/user")
        .query({
          firstName:"  ",
          lastName:" ",
          email:" ",
          order:5,
          take:-1,
          page:-1
        });
      expect(test.body.message).toContain('firstName should not be empty')
      expect(test.body.message).toContain('lastName should not be empty')
      expect(test.body.message).toContain('email must be an email')
      expect(test.body.message).toContain('order must be a valid enum value')
      expect(test.body.message).toContain('take must not be less than 1');
      expect(test.body.message).toContain('page must not be less than 1');
    })

    it('should work if sent undefined values', async () => {
      const test = await request(app.getHttpServer())
        .get("/user")
        .query({
          page:undefined,
          take:undefined
        })
        .expect(200);
      expect(test.body.data).toBeInstanceOf(Array)
      expect(test.body.data.length).toBe(10);
      expect(test.body.data[0]).toMatchObject<UserDTO>({
        id:expect.any(Number),
        name: expect.any(String),
        lastName:expect.any(String),
        email:expect.any(String),
        createdAt:expect.any(String),
        updatedAt:expect.any(String),
        deletedAt:null,
      })
      expect(test.body.meta).toMatchObject<PageMetaDto>({
        page:1,
        take: 10,
        itemCount:expect.any(Number),
        pageCount:expect.any(Number),
        hasPreviousPage:false,
        hasNextPage:expect.any(Boolean),
      });
    })
  })

  describe("/user/update", () => {
    let user:UserDTO;
    let cookie:string[];
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
      cookie = login.get("Set-Cookie")
    });

    it('should throw error if not logged', async function() {
      const updateDto = {
        name:"maria"
      };
      return request(app.getHttpServer())
        .patch(`/user/${user.id}`)
        .send(updateDto)
        .expect(401)
        .expect({statusCode: 401,message: 'Unauthorized'})
    });

    it('should throw error if logged user tries to change other user', async function() {
      const test = await request(app.getHttpServer())
        .post("/auth/register")
        .send(mockCreateUserDto())
      const updateDto = {
        name:"maria"
      };
      return request(app.getHttpServer())
        .patch(`/user/${test.body.id}`)
        .send(updateDto)
        .set("Cookie", [...cookie])
        .expect({statusCode: 401,message: 'Unauthorized'})
        .expect(401)
    });

    it('should update name', async () => {
      const updateDto = {
        name:"maria"
      };
      const test = await request(app.getHttpServer())
        .patch(`/user/${user.id}`)
        .send(updateDto)
        .set("Cookie", [...cookie])
        .expect(200)
      const updated = test.body;
      const { updatedAt,...toExpect } = {...user,...updateDto};
      expect(updated).toMatchObject(toExpect)
    });

    it('should update all values', async () => {
      const updateDto = {
        name:"maria",
        lastName:"gutierrez",
        email:generateRandomEmail()
      };
      const test = await request(app.getHttpServer())
        .patch(`/user/${user.id}`)
        .set("Cookie", [...cookie])
        .expect(200)
        .send(updateDto)
      const updated = test.body;
      const { updatedAt,...toExpect } = {...user,...updateDto};
      expect(updated).toMatchObject(toExpect)
    });

    it('should throw error if not have password field', async () => {
      const updateDto = {
        name:"maria"
      };
      const test = await request(app.getHttpServer())
        .patch(`/user/${user.id}`)
        .send(updateDto)
        .set("Cookie", [...cookie])
        .expect(200)
      expect(test.body).not.toHaveProperty("password")
    });

    it('should throw error if email already exist', async () => {
      const email = generateRandomEmail()
      const createDto: CreateUserDto = mockCreateUserDto({
        email
      })
      const test = await request(app.getHttpServer())
        .post("/auth/register")
        .send(createDto)
      const newUser = test.body;
      const updateDto = {
        email:newUser.email
      };
      return request(app.getHttpServer())
        .patch(`/user/${user.id}`)
        .send(updateDto)
        .set("Cookie", [...cookie])
        .expect(406)
        .expect({ statusCode: 406, message: 'User with that email already exists' })
    });
  })

  describe("/user/delete", () => {
    let user:UserDTO;
    let cookie:string[];

    beforeEach(async () => {
      const createDto: CreateUserDto = mockCreateUserDto()
      const test = await request(app.getHttpServer())
        .post("/auth/register")
        .send(createDto)
      user = test.body
      const login = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email:createDto.email,
          password:createDto.password
        })
      cookie = login.get("Set-Cookie")
    });

    it('should delete user and redirect to logout', async function() {
      return request(app.getHttpServer())
        .delete(`/user/${user.id}`)
        .set("Cookie", [...cookie])
        .expect(302)
        .expect('Location', '/auth/logout')
    });

    it('should throw error if user does not exist', async function() {
      return request(app.getHttpServer())
        .delete(`/user/-1`)
        .set("Cookie", [...cookie])
        .expect(401)
        .expect({
          statusCode:401,
          message:"Unauthorized"
        })
    });
  })
});
