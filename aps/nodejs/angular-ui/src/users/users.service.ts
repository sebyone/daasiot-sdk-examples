import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
// import { ER_DUP_ENTRY } from 'mysql2/lib/constants/errors';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UsernameOrEmailExistentException } from './exceptions/usernameOrEmailExistent.exception';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserNotFoundException } from './exceptions/userNotFound.exception';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    const existentAdminUser = await this.usersRepository.findOne({
      username: 'admin',
    });
    if (!existentAdminUser) {
      const createUserDto = new CreateUserDto();
      createUserDto.username = 'admin';
      createUserDto.password = 'admin.';
      createUserDto.firstName = 'Utente';
      createUserDto.lastName = 'Admin';
      createUserDto.email = 'info@hictech.com';
      createUserDto.roles = ['user', 'admin'];
      await this.create(createUserDto);
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    try {
      const user = new User();
      user.username = createUserDto.username;
      user.firstName = createUserDto.firstName;
      user.lastName = createUserDto.lastName;
      user.email = createUserDto.email;
      user.password = hashedPassword;
      user.roles =
        !createUserDto.roles || createUserDto.roles.length === 0
          ? ['user']
          : createUserDto.roles;
      return await this.usersRepository.save(user);
    } catch (error) {
      // if (error.errno === ER_DUP_ENTRY) {
      if (error.errno === 1062) {
        throw new UsernameOrEmailExistentException(
          createUserDto.username,
          createUserDto.email,
        );
      }
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOneById(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }
    try {
      if (updateUserDto.password) {
        user.password = await bcrypt.hash(updateUserDto.password, 10);
      }
      user.roles =
        !updateUserDto.roles || updateUserDto.roles.length === 0
          ? ['user']
          : updateUserDto.roles;
      user.username = updateUserDto.username;
      user.firstName = updateUserDto.firstName;
      user.lastName = updateUserDto.lastName;
      user.email = updateUserDto.email;
      return await this.usersRepository.save(user);
    } catch (error) {
      // if (error.errno === ER_DUP_ENTRY) {
      if (error.errno === 1062) {
        throw new UsernameOrEmailExistentException(
          updateUserDto.username,
          updateUserDto.email,
        );
      }
    }
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOneByUsername(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ username });
  }

  async findOneById(id: string): Promise<User | undefined> {
    return this.usersRepository.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async setRefreshToken(id: number, plainRefreshToken: string) {
    const refreshToken = await bcrypt.hash(plainRefreshToken, 10);
    await this.usersRepository.update(id, {
      refreshToken,
    });
  }
}
