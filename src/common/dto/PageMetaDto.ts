import { IsBoolean, IsNumber } from 'class-validator';
import { PageOptionsDto } from './PageOptionsDto';

export class PageMetaDto {
  @IsNumber()
  readonly page: number;

  @IsNumber()
  readonly take: number;

  @IsNumber()
  readonly itemCount: number;

  @IsNumber()
  readonly pageCount: number;

  @IsBoolean()
  readonly hasPreviousPage: boolean;

  @IsBoolean()
  readonly hasNextPage: boolean;

  constructor({ pageOptionsDto, itemCount }: PageMetaDtoParameters) {
    this.page = pageOptionsDto.page;
    this.take = pageOptionsDto.take;
    this.itemCount = itemCount;
    this.pageCount = Math.ceil(this.itemCount / this.take);
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }
}

export interface PageMetaDtoParameters {
  pageOptionsDto: PageOptionsDto;
  itemCount: number;
}