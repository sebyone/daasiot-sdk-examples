import {
  Controller,
  Get,
  Request,
  Response,
  Post,
  UseGuards,
  Render,
  UseFilters,
} from '@nestjs/common';
import { AppService } from './app.service';
import { LocalAuthGuard } from './auth/guards/local-auth.guard';
import { SessionGuard } from './auth/guards/session.guard';
import { AuthExceptionFilter } from './auth/filters/auth-exceptions.filter';

// import { vmsList, exchange } from 'daas-vms-exchange';

@Controller()
@UseFilters(AuthExceptionFilter)
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @UseGuards(LocalAuthGuard)
  // @Post('auth/login_')
  // async apiLogin(@Request() req) {
  //   return req.user;
  // }

  @Get()
  @Render('index')
  @UseGuards(SessionGuard)
  root() {
    return { message: this.appService.getHello() };
  }

  @Get('api')
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/login')
  @Render('login')
  index() {
    return;
  }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Request() req, @Response() res) {
    req.session.save(() => res.redirect('/'));
  }

  @UseGuards(SessionGuard)
  @Get('profile')
  @Render('profile')
  protected() {
    return { message: this.appService.getProtected() };
  }

  @Get('/logout')
  logout(@Request() req, @Response() res) {
    req.logout();
    res.redirect('/login');
  }
}
