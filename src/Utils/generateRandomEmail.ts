import { faker } from '@faker-js/faker';

export function generateRandomEmail(){
  return faker.internet.email();
}