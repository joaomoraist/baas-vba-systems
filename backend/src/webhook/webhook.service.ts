import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  CheckoutLink,
  CheckoutStatus,
  GatewayPaymentStatus,
} from '../database/entities/checkout-link.entity';

import {
  WebhookEvent,
  WebhookEventStatus,
} from '../database/entities/webhook-event.entity';

import { WebhookDto } from './dto/webhook.dto';

import * as crypto from 'crypto';

@Injectable()
export class WebhookService {
  constructor(
    @InjectRepository(WebhookEvent)
    private readonly webhookRepository:
      Repository<WebhookEvent>,

    @InjectRepository(CheckoutLink)
    private readonly checkoutRepository:
      Repository<CheckoutLink>,

    private readonly configService: ConfigService,
  ) {}

  async processWebhook(
    payload: WebhookDto,
    signature?: string,
  ) {
    const eventId = payload.eventId;

    if (!eventId) {
      throw new ConflictException(
        'Webhook sem eventId.',
      );
    }


    const secret =
      this.configService.get<string>(
        'LERA_BOX_WEBHOOK_SECRET',
      );

    if (secret) {
      if (!signature) {
        throw new UnauthorizedException(
          'Assinatura do webhook não informada.',
        );
      }

      const body = JSON.stringify(payload);

      const expectedSignature =
        crypto
          .createHmac('sha256', secret)
          .update(body)
          .digest('hex');

      const signatureBuffer =
        Buffer.from(signature);

      const expectedBuffer =
        Buffer.from(expectedSignature);

      if (
        signatureBuffer.length !==
        expectedBuffer.length ||
        !crypto.timingSafeEqual(
          signatureBuffer,
          expectedBuffer,
        )
      ) {
        throw new UnauthorizedException(
          'Assinatura do webhook inválida.',
        );
      }
    }


    const existingEvent =
      await this.webhookRepository.findOne({
        where: {
          eventId,
        },
      });

    if (existingEvent) {
      return {
        message: 'Webhook já processado.',
        eventId,
      };
    }

    const webhookEvent =
      this.webhookRepository.create({
        eventId,
        eventType: payload.eventType,
        payload: { ...payload },
        status: WebhookEventStatus.RECEIVED,
      });

    await this.webhookRepository.save(
      webhookEvent,
    );

    if (
      payload.eventType === 'PAYMENT_PIX' ||
      payload.eventType === 'PAYMENT_CARD'
    ) {
      if (payload.externalReference) {
        const checkout =
          await this.checkoutRepository.findOne({
            where: {
              externalReference:
                payload.externalReference,
            },
          });

        if (checkout) {
          checkout.gatewayPaymentStatus =
            payload.status as GatewayPaymentStatus;

          if (payload.gatewayPaymentId) {
            checkout.gatewayPaymentId =
              payload.gatewayPaymentId;
          }

          if (
            payload.status ===
            GatewayPaymentStatus.APPROVED
          ) {
            checkout.status =
              CheckoutStatus.ACTIVE;
          }

          if (
            payload.status ===
            GatewayPaymentStatus.DENIED
          ) {
            checkout.status =
              CheckoutStatus.CANCELLED;
          }

          await this.checkoutRepository.save(
            checkout,
          );
        }
      }
    }

    webhookEvent.status =
      WebhookEventStatus.PROCESSED;

    webhookEvent.processedAt =
      new Date();

    await this.webhookRepository.save(
      webhookEvent,
    );

    return {
      message: 'Webhook processado com sucesso.',
      eventId,
    };
  }
}