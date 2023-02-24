import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { Measurement } from './measurement.entity';
import {Device} from "../vms/device.entity";

@Injectable()
export class MeasurementsService {
  constructor(
    @InjectRepository(Measurement)
    private readonly measurementsRepository: Repository<Measurement>,
    private connection: Connection,
  ) {}

  async saveMeasurement(
      measurement: Measurement,
  ): Promise<Measurement> {
    return this.measurementsRepository.save(measurement);
  }

  async getMeasurementsForDevice(
    device: Device,
    take = 10000000,
    skip = 0,
  ) {
    return await this.connection.getRepository(Measurement).find({
      where: {
        device,
      },
      order: {
        id: 'DESC',
      },
      take,
      skip,
    });
  }

  async getLastMeasurementsForDevice(
    device: Device,
    take = 1,
    skip = 0,
    ){
    return await this.connection.getRepository(Measurement).find({
      where: {
        device
      },
      order : {
        id: 'DESC'
      },
      take,
      skip
    });
  }
}
