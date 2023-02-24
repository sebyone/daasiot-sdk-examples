import { NotFoundException } from '@nestjs/common';

export class VmsNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`A VMS with the provided id (${id}) does not exists`);
  }
}
