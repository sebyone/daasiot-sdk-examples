import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  // SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { VmsService } from './vms.service';
import { CreateUpdateVmsDto } from './dto/create-update-vms.dto';
import { Vms } from './vms.entity';
import { VmsNotFoundException } from './exceptions/vmsNotFound.exception';
import { CreateUpdateDeviceDto } from './dto/create-update-device.dto';
import { Device } from './device.entity';
import { DeviceNotFoundException } from './exceptions/deviceNotFound.exception';
import {MeasurementsService} from "../measurement/measurements.service";
import {Measurement} from "../measurement/measurement.entity";

//@UseInterceptors(ClassSerializerInterceptor)
//@UseGuards(JwtAuthGuard, RolesGuard)
//@Roles('admin')
@Controller('api/vms')
export class VmsController {
  constructor(
      private readonly vmsService: VmsService,
      private readonly measurementsService: MeasurementsService
      ) {}

  @Post()
  create(
    @Body() createUpdateVmsDto: CreateUpdateVmsDto,
  ): Promise<Vms> {
    return this.vmsService.create(createUpdateVmsDto);
  }

  @Post(':id')
  update(
    @Param('id') id: string,
    @Body() createUpdateVmsDto: CreateUpdateVmsDto,
  ): Promise<Vms> {
    return this.vmsService.update(id, createUpdateVmsDto);
  }

  @Get()
  @Roles('user')
  findAll(@Query('with_vms_info') withVmsInfo: string): Promise<Vms[]> {
    return this.vmsService.findAll(withVmsInfo === '1');
  }

  @Get(':id')
  @Roles('user')
  async findOne(
    @Param('id') id: string,
    @Query('with_vms_info') withVmsInfo: string,
  ): Promise<Vms> {
    const vms = await this.vmsService.findOneById(
      id,
      withVmsInfo === '1',
    );
    if (vms) {
      return vms;
    }
    throw new VmsNotFoundException(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.vmsService.remove(id);
  }

  @Post(':id/devices')
  createDevice(
    @Param('id') id: string,
    @Body() createUpdateDeviceDto: CreateUpdateDeviceDto,
  ): Promise<Device> {
    return this.vmsService.createDevice(id, createUpdateDeviceDto);
  }

  @Post(':id/devices/:deviceId')
  updateDevice(
    @Param('id') id: string,
    @Param('deviceId') deviceId: string,
    @Body() createUpdateDeviceDto: CreateUpdateDeviceDto,
  ): Promise<Device> {
    return this.vmsService.updateDevice(
      id,
      deviceId,
      createUpdateDeviceDto,
    );
  }

  @Get(':id/devices')
  @Roles('user')
  findAllDevices(@Param('id') id: string): Promise<Device[]> {
    return this.vmsService.findAllDevices(id);
  }

  @Get(':id/devices/:deviceId')
  @Roles('user')
  async findOneDevice(
    @Param('id') id: string,
    @Param('deviceId') deviceId: string,
  ): Promise<Device> {
    const device = await this.vmsService.findOneDeviceById(id, deviceId);
    if (device) {
      return device;
    }
    throw new DeviceNotFoundException(id);
  }

  @Delete(':id/devices/:deviceId')
  removeDevice(
    @Param('id') id: string,
    @Param('deviceId') deviceId: string,
  ): Promise<void> {
    return this.vmsService.removeDevice(id, deviceId);
  }

  @Get(':id/devices/:deviceId/measurements')
  @Roles('user')
  async findMeasurementsForDevice(
      @Param('id') id: string,
      @Param('deviceId') deviceId: string,
  ): Promise<Measurement[]> {
    const device = await this.vmsService.findOneDeviceById(id, deviceId);
    if (device) {
      return this.measurementsService.getMeasurementsForDevice(device);
    }
    throw new DeviceNotFoundException(id);
  }

  @Get(':id/devices/:deviceId/lastmeasurement')
  @Roles('user')
  async findLastMeasurementsForDevice(
      @Param('id') id: string,
      @Param('deviceId') deviceId: string,
  ): Promise<Measurement[]> {
    const device = await this.vmsService.findOneDeviceById(id, deviceId);
    if (device) {
      return this.measurementsService.getLastMeasurementsForDevice(device);
    }
    throw new DeviceNotFoundException(id);
  }

}
