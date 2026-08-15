import {
  Body,
  Controller,
  Headers,
  Post,
} from '@nestjs/common';

import { ApiOperation } from '@nestjs/swagger';

import { WebhookDto } from './dto/webhook.dto';
import { WebhookService } from './webhook.service';

@Controller('webhooks')
export class WebhookController {
  constructor(
    private readonly webhookService: WebhookService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Recebe webhook do Gateway',
  })
  async receiveWebhook(
    @Body() payload: WebhookDto,
    @Headers('x-lera-box-signature')
    signature: string,
  ) {
    return this.webhookService.processWebhook(
      payload,
      signature,
    );
  }
}