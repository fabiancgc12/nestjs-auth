import { HttpException, HttpStatus } from '@nestjs/common';

export class DuplicateKeyException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.NOT_ACCEPTABLE);
  }
}