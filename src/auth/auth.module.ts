import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';

@Module({
  controllers:[AuthController],
  providers: [AuthService],
  imports:[UserModule,PassportModule]
})
export class AuthModule {}
