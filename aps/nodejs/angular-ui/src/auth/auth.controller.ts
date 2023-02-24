import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { ExtractJwt } from 'passport-jwt';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async apiLogin(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Post('auth/refresh')
  async refresh(@Request() req) {
    const refreshToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    return this.authService.validateRefreshToken(req.user.id, refreshToken);
  }
}
