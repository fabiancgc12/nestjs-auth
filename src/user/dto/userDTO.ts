import { BaseDto } from '../../common/dto/base.dto';
import { User } from '../entities/user.entity';

export class UserDTO extends BaseDto {
  public email:string;
  public name:string;
  public lastName:string;

  constructor(user:User) {
    super(user);
    this.email = user.email
    this.name = user.name
    this.lastName = user.lastName
  }
}