import { IsEmail, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class FindAllUserDto{

  @IsNumber()
  @Min(1)
  @Max(30)
  limit:number = 10

  @IsNumber()
  @Min(1)
  page:number

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