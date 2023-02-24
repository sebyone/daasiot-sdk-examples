import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  // SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';
import { ExchangeService } from './exchange.service';

@UseInterceptors(ClassSerializerInterceptor)
//@UseGuards(JwtAuthGuard, RolesGuard)
// @Roles('admin')
@Controller('api/exchange')
export class ExchangeController {
  constructor(private readonly exchangeService: ExchangeService) {}

  @Post(':din/bind')
  bind(@Param('din') din: string): Promise<any> {
    return this.exchangeService.bindRecorder(din);
  }

  @Post(':din/unbind')
  unbind(@Param('din') din: string): Promise<any> {
    return this.exchangeService.unbindRecorder(din);
  }

  @Post(':din/messages')
  sendMessage(
    @Param('din') din: string,
    @Body() message: string | unknown,
  ): Promise<any> {
    return this.exchangeService.sendMessage(din, message);
  }

  @Get('recorders')
  getRecorders(): Promise<any> {
    return this.exchangeService.getRecorders();
  }

  @Get('vms-list')
  getVmsList(): Promise<any> {
    return this.exchangeService.getVmsList();
  }

  @Post('vms-list')
  refreshVmsList(): Promise<any> {
    return this.exchangeService.refreshVmsList();
  }
}
