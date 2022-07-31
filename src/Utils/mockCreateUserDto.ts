import { CreateUserDto } from '../user/dto/create-user.dto';
import { generateRandomEmail } from './generateRandomEmail';
import { faker } from '@faker-js/faker';

export function mockCreateUserDto(options: Partial<CreateUserDto> = {}):CreateUserDto {
  return {
    name:options.name ?? faker.name.firstName(),
    lastName:options.lastName ?? faker.name.lastName(),
    email:options.email ?? faker.internet.email(),
    password:options.password ?? "1234",
    confirmPassword:options.confirmPassword ?? "1234"
  }
}