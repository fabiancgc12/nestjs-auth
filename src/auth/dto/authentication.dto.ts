import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class AuthenticationDto{
  @IsNotEmpty()
  @IsEmail()
  email:string

  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  @IsNotEmpty()
  password:string;
}