import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext) {
    // we do this in order to allow also session based authenticationZ
    const request = context.switchToHttp().getRequest();
    return request.isAuthenticated() || await super.canActivate(context);
  }
}
