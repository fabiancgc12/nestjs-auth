import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';

@Module({
  providers: [AuthService],
  imports:[UserModule]
})
export class AuthModule {}
