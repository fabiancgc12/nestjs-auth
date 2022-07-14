import { MapperBase } from '../common/mapper/mapperBase';
import { UserDTO } from './dto/userDTO';
import { User } from './entities/user.entity';

export class UserMapper extends MapperBase{

  entityToDto = (entity:User) => {
    const userDto = new UserDTO(entity)
    return userDto
  }

  entitiesToDtos = (entities:User[]) => {
    const dtos = entities.map(e => this.entityToDto(e));
    return dtos
  }
}