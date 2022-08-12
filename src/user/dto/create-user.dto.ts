import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class CreateUserDto {

  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  @MinLength(3)
  name:string;

  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  @MinLength(3)
  lastName:string;

  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsEmail()
  email:string;

  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  @MinLength(6)
  password:string;

  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  @MinLength(6)
  confirmPassword:string;
}
