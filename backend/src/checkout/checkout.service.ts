import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  CheckoutLink,
  CheckoutLinkStatus,
} from '../database/entities/checkout-link.entity';

import { GatewayAccount } from '../database/entities/gateway-account.entity';

import { GatewayService } from '../gateway/gateway.service';

import { CreateCheckoutLinkDto } from './dto/create-checkout-link.dto';

@Injectable()
export class CheckoutService {
  constructor(
    @InjectRepository(CheckoutLink)
    private readonly checkoutLinkRepository: Repository<CheckoutLink>,

    @InjectRepository(GatewayAccount)
    private readonly gatewayAccountRepository: Repository<GatewayAccount>,

    private readonly gatewayService: GatewayService,
  ) {}

  async createCheckoutLink(dto: CreateCheckoutLinkDto) {
    // Busca a conta do Gateway
    const gatewayAccount =
      await this.gatewayAccountRepository.findOne({
        where: {
          id: dto.gatewayAccountId,
        },
      });

    if (!gatewayAccount) {
      throw new NotFoundException(
        'Conta do Gateway não encontrada.',
      );
    }

    let feePercent = 0;
    let gatewayPayment: any = null;


    if (dto.method === CheckoutLinkStatus.PIX) {
      if (!dto.description || !dto.payerDocument) {
        throw new BadRequestException(
          'Descrição e documento do pagador são obrigatórios para PIX.',
        );
      }

      gatewayPayment =
        await this.gatewayService.createPixPayment(
          gatewayAccount,
          {
            amount: dto.amount,
            description: dto.description,
            payerDocument: dto.payerDocument,
            externalReference: dto.externalReference,
          },
        );
    }


    if (dto.method === CheckoutLinkStatus.CARD) {
      const fees =
        await this.gatewayService.getFees(
          gatewayAccount,
        );

      feePercent = this.getFeePercent(
        fees,
        dto.method,
        dto.brand,
        dto.installments,
      );
    }

    // Link válido por 30 minutos
    const expiresAt = new Date();

    expiresAt.setMinutes(
      expiresAt.getMinutes() + 30,
    );

    // =========================
    // Criação do checkout
    // =========================
    const checkoutLink =
      this.checkoutLinkRepository.create({
        gatewayAccountId: gatewayAccount.id,

        amount: dto.amount,

        method: dto.method,

        externalReference:
          dto.externalReference,

        feePercent,

        expiresAt,

        gatewayPaymentStatus:
          gatewayPayment?.status ?? null,

        gatewayPaymentId:
          gatewayPayment?.id ?? null,

        txid:
          gatewayPayment?.metadata?.txid ??
          gatewayPayment?.txid ??
          null,

        emv:
          gatewayPayment?.metadata?.emv ??
          gatewayPayment?.emv ??
          null,

        qrCodeBase64:
          gatewayPayment?.metadata?.qrCodeBase64 ??
          gatewayPayment?.qrCodeBase64 ??
          null,
      });

    const savedCheckoutLink =
      await this.checkoutLinkRepository.save(
        checkoutLink,
      );

    // =========================
    // Resposta
    // =========================
    return {
      id: savedCheckoutLink.id,

      amount: savedCheckoutLink.amount,

      method: savedCheckoutLink.method,

      status: savedCheckoutLink.status,

      externalReference:
        savedCheckoutLink.externalReference,

      expiresAt:
        savedCheckoutLink.expiresAt,

      gatewayPaymentId:
        savedCheckoutLink.gatewayPaymentId,

      gatewayPaymentStatus:
        savedCheckoutLink.gatewayPaymentStatus,

      txid:
        savedCheckoutLink.txid,

      emv:
        savedCheckoutLink.emv,

      qrCodeBase64:
        savedCheckoutLink.qrCodeBase64,
    };
  }

  private getFeePercent(
    fees: any,
    method: string,
    brand?: string,
    installments?: number,
  ): number {
    if (
      !fees?.fees ||
      !Array.isArray(fees.fees)
    ) {
      throw new BadRequestException(
        'O Gateway não retornou informações de taxas válidas.',
      );
    }

    if (method !== CheckoutLinkStatus.CARD) {
      throw new BadRequestException(
        'Consulta de taxa disponível apenas para cartão.',
      );
    }

    if (!brand || !installments) {
      throw new BadRequestException(
        'Bandeira e quantidade de parcelas são obrigatórios para cartão.',
      );
    }

    const fee = fees.fees.find(
      (item: any) =>
        item.brand === brand &&
        item.installments === installments,
    );

    if (!fee) {
      throw new BadRequestException(
        `Taxa não encontrada para ${brand} em ${installments} parcelas.`,
      );
    }

    return fee.feePercent;
  }
}