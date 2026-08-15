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

  @Post('payment-pix')
  @ApiOperation({
    summary: 'Recebe webhook de pagamento Pix do Gateway',
  })
  async receivePixWebhook(
    @Body() payload: WebhookDto,
    @Headers('x-lera-box-signature')
    signature: string,
  ) {
    return this.webhookService.processWebhook(
      payload,
      signature,
      'PAYMENT_PIX',
    );
  }

  @Post('payment-card')
  @ApiOperation({
    summary: 'Recebe webhook de pagamento com cartão do Gateway',
  })
  async receiveCardWebhook(
    @Body() payload: WebhookDto,
    @Headers('x-lera-box-signature')
    signature: string,
  ) {
    return this.webhookService.processWebhook(
      payload,
      signature,
      'PAYMENT_CARD',
    );
  }

  @Post('withdrawal')
  @ApiOperation({
    summary: 'Recebe webhook de saque do Gateway',
  })
  async receiveWithdrawalWebhook(
    @Body() payload: WebhookDto,
    @Headers('x-lera-box-signature')
    signature: string,
  ) {
    return this.webhookService.processWebhook(
      payload,
      signature,
      'WITHDRAWAL',
    );
  }
}