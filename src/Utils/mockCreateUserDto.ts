import { CreateUserDto } from '../user/dto/create-user.dto';
import { generateRandomEmail } from './generateRandomEmail';

export function mockCreateUserDto(options: Partial<CreateUserDto> = {}):CreateUserDto {
  return {
    name:options.name ?? "jose",
    lastName:options.lastName ?? "smith",
    email:options.email ?? generateRandomEmail(),
    password:options.password ?? "1234",
    confirmPassword:options.confirmPassword ?? "1234"
  }
}