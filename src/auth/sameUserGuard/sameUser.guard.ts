import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { RequestWithUser } from '../requestWithUser';
import { TokenPayloadI } from '../tokenPayloadI';
import { User } from '../../user/entities/user.entity';
import { JwtGuard } from '../jwtGuard/jwt.guard';

@Injectable()
export class SameUserGuard extends JwtGuard{

  async canActivate(context: ExecutionContext) {
    await super.canActivate(context)
    const request:RequestWithUser = context.switchToHttp().getRequest();
    const userRequestId = Number(request.params.id);
    const userJwt:User = request?.user
    if (userRequestId != userJwt.id)
      throw new UnauthorizedException()
    return true
  }
}