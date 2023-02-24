import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Device } from './device.entity';
import { CreateUpdateDeviceDto } from './dto/create-update-device.dto';
import { DeviceNotFoundException } from './exceptions/deviceNotFound.exception';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { vmsList, exchange } from 'daas-vms-exchange';
import {
  DEVICE_CREATED,
  DEVICE_DELETED,
  DEVICE_UPDATED,
} from '../events/constants';
import { Vms } from './vms.entity';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device)
    private readonly devicesRepository: Repository<Device>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(
    vms: Vms,
    createUpdateDeviceDto: CreateUpdateDeviceDto,
  ): Promise<Device> {
    return this.createOrUpdate(vms, new Device(), createUpdateDeviceDto);
  }

  async update(
    vms: Vms,
    id: string,
    createUpdateDeviceDto: CreateUpdateDeviceDto,
  ): Promise<Device> {
    const device = await this.findOneById(vms, id);
    if (!device) {
      throw new DeviceNotFoundException(id);
    }
    return this.createOrUpdate(vms, device, createUpdateDeviceDto);
  }

  async createOrUpdate(
    vms: Vms,
    device: Device,
    createUpdateDeviceDto: CreateUpdateDeviceDto,
  ): Promise<Device> {
    device.vms = vms;
    device.din = createUpdateDeviceDto.din;
    device.name = createUpdateDeviceDto.name;
    device.typeset = createUpdateDeviceDto.typeset;
    device.note = createUpdateDeviceDto.note;

    const existentDevice = !!device.id;
    device = await this.devicesRepository.save(device);

    this.eventEmitter.emit(
      existentDevice ? DEVICE_UPDATED : DEVICE_CREATED,
      device,
    );

    return device;
  }

  async saveDevice(device: Device): Promise<Device> {
    return await this.devicesRepository.save(device);
  }

  async findAllNoVmsFilter(): Promise<Device[]> {
    return await this.devicesRepository.find();
  }

  async findAll(vms: Vms, withVmsInfo = false): Promise<Device[]> {
    const devices = await this.devicesRepository.find({
      relations: ['vms'],
      where: { vms },
    });
    if (withVmsInfo) {
      // map devices with vms infos
      for (const device of devices) {
        device.vms = vms;
        await this.updateVmsInfoForDevice(device);
        // await this.mapVmsInfoFromMemory(recorders[i]);
      }
    }
    return devices;
  }

  async findOneById(
    vms: Vms,
    id: string,
    withVmsInfo = false,
  ): Promise<Device | undefined> {
    const qb = this.getBaseQueryBuilder().where(
      'd.id = :id and m.id = :vmsId',
      { id, vmsId: vms.id },
    );
    const device = await qb.getOne();
    if (withVmsInfo) {
      await this.updateVmsInfoForDevice(device);
    }
    return device;
  }

  async findOneByDin(din: string): Promise<Device | undefined> {
    const qb = this.getBaseQueryBuilder().where('d.din = :din', { din });
    return qb.getOne();
  }

  getBaseQueryBuilder(): SelectQueryBuilder<Device> {
    return this.devicesRepository
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.vms', 'm');
  }

  async remove(vms: Vms, id: string): Promise<void> {
    const device = await this.findOneById(vms, id);
    if (device) {
      await this.devicesRepository.delete(id);
      this.eventEmitter.emit(DEVICE_DELETED, device);
    }
  }

  async updateVmsInfoForDevice(device: Device): Promise<void> {
    // get config & status
    // map
    // update recorder in vms list
    device.vmsActive = vmsList.isVmsActiveForDin(device.din);
    device.bound = vmsList.isVmsBoundForDin(device.din);

    try {
      const deviceStatus = await exchange.getRecorderStatus(device.din);
      if (deviceStatus) {
        // deprecated
        device.netState = deviceStatus.exchange_state;
        device.deviceExchangeState = deviceStatus.device_exchange_state;
        device.deviceState = deviceStatus.device_state;
        device.isRemoteControl = deviceStatus.is_remote_control;
        device.vmsLock = deviceStatus.vms_lock;
      }
      if (deviceStatus && deviceStatus.hw_state) {
        device.hwState = deviceStatus.hw_state;
      }
      const deviceConfig = await exchange.getRecorderConfig(device.din);
      if (deviceConfig && deviceConfig.deviceConfig) {
        device.vmsCalibration = deviceConfig.calibration;
      }
      if (deviceConfig && deviceConfig.exchange) {
        device.exchange = deviceConfig.exchange;
      }
      if (deviceConfig && deviceConfig.general) {
        device.general = deviceConfig.general;
      }
      // todo: handle existne measurements
      if (device.hwState && device.hwState.measurementsCounter > 0) {
        // exchangeService.fetchMeasurementForRecorderDIN(recorder.din);
      }
    } catch (err) {
      console.log(err);
    }
  }
}
