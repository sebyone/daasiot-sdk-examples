import { Injectable, OnModuleInit } from '@nestjs/common';
import { vmsList, exchange } from 'daas-vms-exchange';
import { VmsService } from '../vms/vms.service';
import { VmsNotFoundException } from '../vms/exceptions/vmsNotFound.exception'
import { EventModel } from '../events/model/event.model';
import { EventsGateway } from '../events/events.gateway';
import { Vms } from '../vms/vms.entity';
import {
  DEVICE_CREATED,
  DEVICE_DELETED,
  MACHINE_DELETED,
} from '../events/constants';
import { OnEvent } from '@nestjs/event-emitter';
import { WebHookDto } from './dto/web-hook-dto';
import { Device } from '../vms/device.entity';
import { DevicesService } from '../vms/devices.service';
import { ConfigService } from '@nestjs/config';
import {Measurement} from "../measurement/measurement.entity";
import {MeasurementsService} from "../measurement/measurements.service";


@Injectable()
export class ExchangeService implements OnModuleInit {
  constructor(
    private readonly vmssService: VmsService,
    private readonly devicesService: DevicesService,
    private readonly measurementsService: MeasurementsService,
    private readonly eventsGateway: EventsGateway,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.initializeVmsVms();
    console.log(vmsList.getVmsList());
  }

  @OnEvent(DEVICE_CREATED)
  onDeviceCreated(device: Device): void {
    this.initializeDeviceVms(device);
  }

  @OnEvent(MACHINE_DELETED)
  onVmsDeleted(vms: Vms): void {
    this.terminateVmsVms(vms);
  }

  @OnEvent(DEVICE_DELETED)
  onDeviceDeleted(device: Device): void {
    this.terminateDeviceVms(device);
  }

  async initializeVmsVms(): Promise<void> {
    const vmss = await this.vmssService.findAll();
    for (const vms of vmss) {
      for (const device of vms.devices) {
        device.vms = vms;
        try {
          await this.initializeDeviceVms(device);
        } catch (error) {
          console.log(error);
        }
      }
    }
  }

  async initializeDeviceVms(device: Device): Promise<void> {
    const vmsUri = device.vms.getFullVmsUri();
    vmsList.addRecorder(device.din, vmsUri, () => {
      console.log('closed connection fo din: ' + device.din);
    });
    console.log(
      'http://localhost:' + this.configService.get('WEB_SERVER_PORT'),
    );
    await exchange.initializeVms(
      device.din,
      '/api/exchange/notifications',
      'http://localhost:' + this.configService.get('WEB_SERVER_PORT'),
    );
    await this.bindRecorder(device.din);
  }

  async terminateVmsVms(vms: Vms): Promise<void> {
    for (const device of vms.devices) {
      await this.terminateDeviceVms(device);
    }
  }

  async terminateDeviceVms(device: Device): Promise<void> {
    await this.unbindRecorder(device.din);
    vmsList.removeRecorder(device.din);
  }

  async bindRecorder(din: string): Promise<any> {
    const vms = await this.vmssService.findOneByDin(din);
    if (!vms) {
      throw new VmsNotFoundException(din);
    }
    // const vmsUri = vms.getFullVmsUri();
    // vmsList.addRecorder(din, vmsUri, () => {
    //   console.log('closed connection fo din: ' + din);
    // });
    try {
      return await exchange.bindRecorder(din);
    } catch (error) {
      return error;
    }
  }

  async unbindRecorder(din: string): Promise<any> {
    return await exchange.unbindRecorder(din);
  }

  async sendMessage(din: string, message: string | any): Promise<any> {
    if (!message.object) {
      message.object = {};
    }
    message.object.din = din;
    return await exchange.sendMessage(din, message);
  }

  getRecorders(): any {
    return vmsList.getRecorders();
  }

  getVmsList(): any {
    return vmsList.getVmsList();
  }

  async refreshVmsList(): Promise<any> {
    const devices = await this.devicesService.findAllNoVmsFilter();
    await exchange.refreshConnectionsForRecorders(
      devices.map((device) => device.din),
    );

    return this.getVmsList();
  }

  async handleNotification(payload: WebHookDto): Promise<void> {
    switch (payload.event) {
      case 'measurement_available':
        // mitodo: gestione misura
        this.fetchMeasurements(payload.object.din);
        break;
    }

    if (payload.object.din) {
      const vms = await this.vmssService.findOneByDin(
        payload.object.din,
      );
      if (vms) {
        payload.object.vms = vms;
      }
    }

    const event = new EventModel('daas:event', payload);
    this.eventsGateway.dispatchEvent(event);
  }

  async fetchMeasurements(din: string): Promise<void> {
    const device = await this.vmssService.findOneDeviceByDin(din);
    if (!device) {
      // plgask: what if no vms exists with the given id?
      console.log('no device for the given din');
      return;
    }


    // plgask: which typeset status should allow fetching measurements?

    let command = {
      command: 'get_measurement_count',
      object: {
        din,
      },
    };

    const { count } = await this.sendMessage(din, command);

    command = {
      command: 'get_measurement',
      object: {
        din,
      },
    };

    for (let i = 0; i < count; i++) {
      const measurement = await this.sendMessage(din, command);

      for (let j = 0; j < measurement.total_blocks; j++) {
        const valuesCommand = {
          command: 'get_measurement_values',
          object: {
            id: measurement.id,
            block_offset: j,
          },
        };

        const measurementValues = await this.sendMessage(din, valuesCommand);

        // save the measurement in db
        const measurementEntity = await this.parseAndSaveMeasurement(
            device,
            measurement,
            measurementValues.values,
        );

        const event = new EventModel('daas:event', {
          event: 'new_measurement',
          measurementEntity,
        });
        this.eventsGateway.dispatchEvent(event);
      }

      const deleteCommand = {
        command: 'delete_measurement',
        object: {
          id: measurement.id,
        },
      };

      await this.sendMessage(din, deleteCommand);
    }

    // if locked -> release typeset
  }

  async parseAndSaveMeasurement(
      device: Device,
      measurement,
      values,
  ): Promise<Measurement> {
    let measurementEntity = new Measurement();
    measurementEntity.device = device;
    measurementEntity.dtime = measurement.dtime;
    measurementEntity.rawData = values;

    measurementEntity = await this.measurementsService.saveMeasurement(measurementEntity);

    return measurementEntity;
  }

}
