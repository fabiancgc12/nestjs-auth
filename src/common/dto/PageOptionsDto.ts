import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderEnum } from '../enum/OrderEnum';

export class PageOptionsDto {
  @IsEnum(OrderEnum)
  @IsOptional()
  readonly order?: OrderEnum = OrderEnum.ASC;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  readonly take?: number = 10;

  get skip(): number {
    return (this.page - 1) * this.take;
  }

  constructor(parameter:{order?:OrderEnum,take?:number,page?:number} = {}) {
    this.take = parameter.take ?? this.take
    this.page = parameter.page ?? this.page
    this.order = parameter.order ?? this.order
  }
}