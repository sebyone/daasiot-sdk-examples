import { Module } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { ExchangeController } from './exchange.controller';
import { VmsModule } from '../vms/vms.module';
import { EventsModule } from '../events/events.module';
import { WebHookController } from './web-hook.controller';
import { ConfigModule } from '@nestjs/config';
import { MeasurementsModule } from 'src/measurement/measurements.module';

@Module({
  providers: [ExchangeService],
  exports: [ExchangeService],
  controllers: [ExchangeController, WebHookController],
  imports: [
    VmsModule,
    EventsModule,
    ConfigModule,
    MeasurementsModule
  ],
})
export class ExchangeModule {}
