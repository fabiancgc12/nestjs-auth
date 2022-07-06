import { HttpException, HttpStatus } from '@nestjs/common';

export class EntityDoesNotExistException extends HttpException{
  constructor(entity:string,postId: number) {
    super(`${entity} with id ${postId} not found`, HttpStatus.NOT_FOUND);
  }
}