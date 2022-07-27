import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { PageOptionsDto } from '../../common/dto/PageOptionsDto';
import { Transform, TransformFnParams } from 'class-transformer';

export class FindAllUserDto extends PageOptionsDto{

  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  firstName?:string;

  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  lastName?:string;

  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsEmail()
  @IsNotEmpty()
  @IsOptional()
  email?:string
}