import { NotFoundException } from '@nestjs/common';

export class UserNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`A user with the provided id (${id}) does not exists`);
  }
}
