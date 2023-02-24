import { NotFoundException } from '@nestjs/common';

export class DeviceNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`A device with the provided id (${id}) does not exists`);
  }
}
