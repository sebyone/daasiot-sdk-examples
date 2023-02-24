import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';

async function bootstrap() {

  const app = await NestFactory.createApplicationContext(AppModule);

  // create admin user
  const usersService = await app.resolve(UsersService);

  const createUserDto = new CreateUserDto();
  createUserDto.username = 'admin';
  createUserDto.password = 'admin.';
  createUserDto.firstName = 'Utente';
  createUserDto.lastName = 'Admin';
  createUserDto.email = 'info@hictech.com';
  createUserDto.roles = ['user', 'admin'];
  await usersService.create(createUserDto);

  await app.close();
}

bootstrap();
