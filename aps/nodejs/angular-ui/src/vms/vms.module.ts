import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Vms} from './vms.entity';
import {VmsService} from './vms.service';
import {VmsController} from './vms.controller';
import {Device} from './device.entity';
import {DevicesService} from './devices.service';
import {MeasurementsModule} from "../measurement/measurements.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Vms,
            Device,
        ]),
        MeasurementsModule
    ],
    providers: [
        VmsService,
        DevicesService,
    ],
    exports: [VmsService, DevicesService],
    controllers: [VmsController],
})
export class VmsModule {
}
