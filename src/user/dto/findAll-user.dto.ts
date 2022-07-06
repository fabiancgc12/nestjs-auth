import { IsEmail, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { PageOptionsDto } from '../../common/dto/PageOptionsDto';

export class FindAllUserDto extends PageOptionsDto{

  @IsString()
  @IsOptional()
  firstName?:string;

  @IsString()
  @IsOptional()
  lastName?:string;

  @IsEmail()
  @IsOptional()
  email?:string
}