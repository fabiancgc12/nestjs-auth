import { BadRequestException } from '@nestjs/common';

export class ServerErrorException extends BadRequestException {
  constructor() {
    super('Something went wrong!');
  }
}