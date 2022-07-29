import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { generateRandomEmail } from '../Utils/generateRandomEmail';
import { User } from '../user/entities/user.entity';
import { databaseTestConnectionModule } from '../../test/DatabaseTestConnectionModule';
import { UserDoesNotExist } from '../common/exception/UserDoesNotExist';

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
      const loggedUser:User = await service.getAuthenticatedUser(newUser.email,dto.password)
      expect(newUser).toEqual(loggedUser)
    });

    it('should throw error if email does not exist', async function() {
      await expect(() => service.getAuthenticatedUser("patata@notexist.com","")).rejects.toThrow(UserDoesNotExist);
    });

    it('should throw error if both fields are wrong', async function() {
      await expect(() => service.getAuthenticatedUser("","")).rejects.toThrow(UserDoesNotExist);
    });

    it('should throw error if email is wrong', async function() {
      const dto:CreateUserDto = {
        name:"fabian",
        lastName:"graterol",
        email:generateRandomEmail(),
        password:"1234",
        confirmPassword:"1234"
      }
      const newUser:User = await userService.create(dto);
      await expect(() => service.getAuthenticatedUser("vdfv@notexist.co",newUser.password))
        .rejects.toThrow(UserDoesNotExist);
    });

    it('should throw error if password is wrong', async function() {
      const dto:CreateUserDto = {
        name:"fabian",
        lastName:"graterol",
        email:generateRandomEmail(),
        password:"1234",
        confirmPassword:"1234"
      }
      const newUser:User = await userService.create(dto);
      await expect(() => service.getAuthenticatedUser(newUser.email,"cwscef"))
        .rejects.toThrow(UserDoesNotExist);
    });
  })
});
