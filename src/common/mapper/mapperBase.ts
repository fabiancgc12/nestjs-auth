import { AppBaseModel } from '../Entity/AppBaseModel';
import { BaseDto } from '../dto/base.dto';

export abstract class MapperBase {
  abstract entityToDto: (entity: AppBaseModel) => BaseDto
  abstract entitiesToDtos: (entity: AppBaseModel[]) => BaseDto[]
}