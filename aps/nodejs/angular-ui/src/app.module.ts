import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangeModule } from './exchange/exchange.module';
import { EventsModule } from './events/events.module';
//1-generalized-be
import { VmsModule } from './vms/vms.module';
import {MeasurementsModule} from "./measurement/measurements.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'better-sqlite3',
        //host: configService.get('DATABASE_HOST'),
        //port: configService.get('DATABASE_PORT'),
        //username: configService.get('DATABASE_USER'),
        //password: configService.get('DATABASE_PASSWORD'),
        dropSchema: true,
        database: ':memory:',
        supportBigNumbers: true,
        bigNumberStrings: false,
        entities: [
          __dirname + '/../dist/**/*.entity{.ts,.js}',
        ],
        synchronize: true,
      })
    }),
    EventEmitterModule.forRoot(),
    AuthModule,
    UsersModule,
    VmsModule,
    MeasurementsModule,
    ExchangeModule,
    EventsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
