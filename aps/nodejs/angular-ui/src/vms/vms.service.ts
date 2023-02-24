import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Vms } from './vms.entity';
import { CreateUpdateVmsDto } from './dto/create-update-vms.dto';
import { VmsNotFoundException } from './exceptions/vmsNotFound.exception';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  MACHINE_CREATED,
  MACHINE_DELETED,
  MACHINE_UPDATED,
} from '../events/constants';
import { DevicesService } from './devices.service';
import { CreateUpdateDeviceDto } from './dto/create-update-device.dto';
import { Device } from './device.entity';
import { vmsList } from 'daas-vms-exchange';
import TimeObject from './interfaces/time-object.interface';

@Injectable()
export class VmsService {
  constructor(
    @InjectRepository(Vms)
    private readonly vmssRepository: Repository<Vms>,
    private readonly devicesService: DevicesService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(
    createUpdateVmsDto: CreateUpdateVmsDto,
  ): Promise<Vms> {
    return this.createOrUpdate(new Vms(), createUpdateVmsDto);
  }

  async update(
    id: string,
    createUpdateVmsDto: CreateUpdateVmsDto,
  ): Promise<Vms> {
    const vms = await this.findOneById(id);
    if (!vms) {
      throw new VmsNotFoundException(id);
    }
    return this.createOrUpdate(vms, createUpdateVmsDto);
  }

  async createOrUpdate(
    vms: Vms,
    createUpdateVmsDto: CreateUpdateVmsDto,
  ): Promise<Vms> {
    vms.name = createUpdateVmsDto.name;
    vms.iot = createUpdateVmsDto.iot;
    vms.note = createUpdateVmsDto.note;
    vms.vmsUri = createUpdateVmsDto.vmsUri;
    vms.vmsPort = createUpdateVmsDto.vmsPort;

    const existentVms = !!vms.id;
    vms = await this.vmssRepository.save(vms);

    this.eventEmitter.emit(
      existentVms ? MACHINE_UPDATED : MACHINE_CREATED,
      vms,
    );

    return vms;
  }

  async findAll(withVmsInfo = false): Promise<Vms[]> {
    const vmss = await this.vmssRepository.find({
      relations: ['devices'],
    });
    if (withVmsInfo) {
      // map vmss with vms infos
      for (const vms of vmss) {
        await this.updateVmsInfoForVms(vms);
        // await this.mapVmsInfoFromMemory(recorders[i]);
      }
    }
    return vmss;
  }

  async findOneById(
    id: string,
    withVmsInfo = false,
  ): Promise<Vms | undefined> {
    const qb = this.getBaseQueryBuilder().where('m.id = :id', { id });
    const vms = await qb.getOne();
    if (withVmsInfo) {
      await this.updateVmsInfoForVms(vms);
    }
    //await this.updateDerivedInfos(vms);
    return vms;
  }

  async findOneByDin(din: string): Promise<Vms | undefined> {
    const device = await this.devicesService.findOneByDin(din);
    if (device) {
      return device.vms;
    }
  }

  getBaseQueryBuilder(): SelectQueryBuilder<Vms> {
    return this.vmssRepository
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.devices', 'd');
  }

  async remove(id: string): Promise<void> {
    const vms = await this.findOneById(id);
    if (vms) {
      await this.vmssRepository.delete(id);
      this.eventEmitter.emit(MACHINE_DELETED, vms);
    }
  }

  async updateVmsInfoForVms(vms: Vms): Promise<void> {
    if (vms.iot) {
      for (const device of vms.devices) {
        await this.devicesService.updateVmsInfoForDevice(device);
        vms.vmsActive = device.vmsActive;
        vms.vin = vmsList.getVmsVin(device.din) || 'not set';
      }
    }
  }

  async createDevice(
    vmsId: string,
    createUpdateDeviceDto: CreateUpdateDeviceDto,
  ): Promise<Device> {
    const vms = await this.findOneById(vmsId);
    if (!vms) {
      throw new VmsNotFoundException(vmsId);
    }
    return this.devicesService.create(vms, createUpdateDeviceDto);
  }

  async updateDevice(
    vmsId: string,
    deviceId: string,
    createUpdateDeviceDto: CreateUpdateDeviceDto,
  ): Promise<Device> {
    const vms = await this.findOneById(vmsId);
    if (!vms) {
      throw new VmsNotFoundException(vmsId);
    }
    return this.devicesService.update(vms, deviceId, createUpdateDeviceDto);
  }

  async findAllDevices(vmsId: string): Promise<Device[]> {
    const vms = await this.findOneById(vmsId);
    if (!vms) {
      throw new VmsNotFoundException(vmsId);
    }
    return this.devicesService.findAll(vms);
  }

  async findOneDeviceById(
    vmsId: string,
    deviceId: string,
  ): Promise<Device> {
    const vms = await this.findOneById(vmsId);
    if (!vms) {
      throw new VmsNotFoundException(vmsId);
    }
    return this.devicesService.findOneById(vms, deviceId);
  }

  async findOneDeviceByDin(din: string): Promise<Device> {
    return this.devicesService.findOneByDin(din);
  }

  async removeDevice(vmsId: string, deviceId: string): Promise<void> {
    const vms = await this.findOneById(vmsId);
    if (!vms) {
      throw new VmsNotFoundException(vmsId);
    }
    return this.devicesService.remove(vms, deviceId);
  }

}
