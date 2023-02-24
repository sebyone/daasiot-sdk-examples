import { BadRequestException } from '@nestjs/common';

export class UsernameOrEmailExistentException extends BadRequestException {
  constructor(username: string, email: string) {
    super(`A user with the provided username or email (${username} / ${email}) already exists`);
  }
}
