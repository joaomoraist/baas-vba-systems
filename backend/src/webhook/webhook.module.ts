import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';

import { WebhookEvent } from '../database/entities/webhook-event.entity';
import { CheckoutLink } from '../database/entities/checkout-link.entity';
import { Withdrawal } from '../database/entities/withdrawal.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WebhookEvent,
      CheckoutLink,
      Withdrawal,
    ]),
  ],
  controllers: [
    WebhookController,
  ],
  providers: [
    WebhookService,
  ],
})
export class WebhookModule {}