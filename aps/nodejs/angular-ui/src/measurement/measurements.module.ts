import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Measurement } from './measurement.entity';
import { MeasurementsService } from './measurements.service';

@Module({
  imports: [TypeOrmModule.forFeature([Measurement])],
  providers: [MeasurementsService],
  exports: [MeasurementsService],
})
export class MeasurementsModule {}
