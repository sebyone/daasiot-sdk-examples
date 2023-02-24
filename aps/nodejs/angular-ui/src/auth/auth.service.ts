import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { jwtConstants } from './constants';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserLogin } from './user-login.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserLogin)
    private readonly userLoginsRepository: Repository<UserLogin>,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string, req): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);
    if (user) {
      const isPasswordMatching = await bcrypt.compare(pass, user.password);
      const userLogin = new UserLogin();
      userLogin.timestamp = Date.now();
      userLogin.username = username;
      userLogin.ip = req?.headers['x-forwarded-for'] || req.ip;
      userLogin.userAgent = req.get('User-Agent');
      if (isPasswordMatching) {
        const { password, ...result } = user;

        userLogin.success = true;
        this.userLoginsRepository.save(userLogin);

        return result;
      }

      userLogin.success = false;
      this.userLoginsRepository.save(userLogin);
    }
    return null;
  }

  async validateRefreshToken(id: string, refreshToken: string) {
    const user = await this.getUserById(id);

    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (isRefreshTokenMatching) {
      const payload = { username: user.username, sub: user.id };
      return {
        access_token: this.jwtService.sign(payload),
      };
    }
    throw new UnauthorizedException('invalid refresh token');
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id },
      accessToken = this.jwtService.sign(payload),
      refreshToken = this.jwtService.sign(
        { sub: user.id },
        {
          secret: jwtConstants.refreshSecret,
          expiresIn: jwtConstants.refreshExpiresIn,
        },
      );

    await this.usersService.setRefreshToken(user.id, refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async getUserById(id: string): Promise<any> {
    return this.usersService.findOneById(id);
  }
}
