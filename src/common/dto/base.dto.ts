import { AppBaseModel } from '../Entity/AppBaseModel';

export class BaseDto {
  public id:number;
  public createdAt:Date;
  public updatedAt:Date;
  public deletedAt:Date;

  constructor(entity:AppBaseModel) {
    this.id = entity.id;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
    this.deletedAt = entity.deletedAt;
  }
}