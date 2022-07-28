import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { generateRandomEmail } from '../Utils/generateRandomEmail';
import { User } from '../user/entities/user.entity';
import { databaseTestConnectionModule } from '../../test/DatabaseTestConnectionModule';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports:[UserModule,databaseTestConnectionModule],
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe("getAuthenticatedUser", () => {
    it('should return the auth user', async () => {
      const dto:CreateUserDto = {
        name:"fabian",
        lastName:"graterol",
        email:generateRandomEmail(),
        password:"1234",
        confirmPassword:"1234"
      }
      const newUser:User = await userService.create(dto);
      const loggedUser:User = await service.getAuthenticatedUser(dto.email,dto.password)
      expect(newUser).toEqual(loggedUser)
    });
  })
});
