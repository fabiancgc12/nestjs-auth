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
import exp from 'constants';

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
      const email = generateRandomEmail();
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

    it('should throw error if dto is invalid', async () => {
      let createDto: CreateUserDto = {
        name: "",
        lastName: "",
        email:"",
        password: "",
        confirmPassword: ""
      }
      let test = await request(app.getHttpServer())
        .post("/user")
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
        .post("/user")
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
        .post("/user")
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
      const email = generateRandomEmail();
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
      const createDto: CreateUserDto = {
        name: "fabian",
        lastName: "graterol",
        email:generateRandomEmail(),
        password: "1234",
        confirmPassword: "1234"
      }
      const createdTest = await request(app.getHttpServer())
        .post("/user")
        .send(createDto)
      const user = createdTest.body
      const test = await request(app.getHttpServer())
        .get("/user")
        .query({lastName:user.lastName})
        .expect(200);
      expect(test.body.data.length).toBeGreaterThanOrEqual(1)
      expect(test.body.data[0].lastName).toBe(user.lastName)
    })

    it("should return users with email", async () => {
      const createDto: CreateUserDto = {
        name: "fabian",
        lastName: "graterol",
        email:generateRandomEmail(),
        password: "1234",
        confirmPassword: "1234"
      }
      const createdTest = await request(app.getHttpServer())
        .post("/user")
        .send(createDto)
      const user = createdTest.body as UserDTO
      const test = await request(app.getHttpServer())
        .get("/user")
        .query({email:user.email})
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
  })

  describe("/user/update", () => {
    let user:UserDTO;
    beforeEach(async () => {
      const email = generateRandomEmail();
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

    it('should update name', async () => {
      const updateDto = {
        name:"maria"
      };
      const test = await request(app.getHttpServer())
        .patch(`/user/${user.id}`)
        .send(updateDto)
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
        .expect(200)
        .send(updateDto)
      const updated = test.body;
      const { updatedAt,...toExpect } = {...user,...updateDto};
      expect(updated).toMatchObject(toExpect)
    });

    it('should not have password field', async () => {
      const updateDto = {
        name:"maria"
      };
      const test = await request(app.getHttpServer())
        .patch(`/user/${user.id}`)
        .send(updateDto)
        .expect(200)
      expect(test.body).not.toHaveProperty("password")
    });

    it('should throw error if email already exist', async () => {
      const createDto: CreateUserDto = {
        name: "fabian",
        lastName: "graterol",
        email:generateRandomEmail(),
        password: "1234",
        confirmPassword: "1234"
      }
      const test = await request(app.getHttpServer())
        .post("/user")
        .send(createDto)
      const newUser = test.body;
      const updateDto = {
        email: user.email
      };
      return request(app.getHttpServer())
        .patch(`/user/${newUser.id}`)
        .send(updateDto)
        .expect(406)
        .expect({ statusCode: 406, message: 'User with that email already exists' })
    });
  })

  describe("/user/delete", () => {
    let user:UserDTO;
    beforeEach(async () => {
      const email = generateRandomEmail();
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

    it('should delete user', async function() {
      return request(app.getHttpServer())
        .delete(`/user/${user.id}`)
        .expect(200)
    });

    it('should throw error if user does not exist', async function() {
      return request(app.getHttpServer())
        .delete(`/user/-1`)
        .expect(404)
    });
  })
});
