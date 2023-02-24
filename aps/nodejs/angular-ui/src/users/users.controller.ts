import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post, Request, UseGuards,
  // SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserNotFoundException } from './exceptions/userNotFound.exception';
// import { SessionGuard } from '../auth/guards/session.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseInterceptors(ClassSerializerInterceptor)
// @SerializeOptions({groups: ['mimmo']})
// @UseGuards(SessionGuard, RolesGuard)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Post(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get('me')
  @Roles('user')
  async findMe(@Request() req) {
    return req.user;
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.findOneById(id);
    if (user) {
      return user;
    }
    throw new UserNotFoundException(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}
