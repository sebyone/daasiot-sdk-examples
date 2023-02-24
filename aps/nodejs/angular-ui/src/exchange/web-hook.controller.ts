import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  // SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';

import { ExchangeService } from './exchange.service';
import { WebHookDto } from './dto/web-hook-dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('api/exchange')
export class WebHookController {
  constructor(private readonly exchangeService: ExchangeService) {}

  @Post('notifications')
  // @Roles('user')
  vmsNotification(@Body() webHookJson: WebHookDto): any {
    // mitodo: notifica da vms
    this.exchangeService.handleNotification(webHookJson);

    return {
      method: 'post',
      body: webHookJson,
    };
  }
}
