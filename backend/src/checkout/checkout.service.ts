import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CheckoutLink } from '../database/entities/checkout-link.entity';
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

    const fees = await this.gatewayService.getFees();

    const feePercent = this.getFeePercent(
      fees,
      dto.method,
      dto.brand,
      dto.installments,
    );

    const expiresAt = new Date();

    // Link válido por 30 minutos
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    const checkoutLink = this.checkoutLinkRepository.create({
      gatewayAccountId: gatewayAccount.id,
      amount: dto.amount,
      method: dto.method,
      externalReference: dto.externalReference,
      feePercent,
      expiresAt,
    });

    const savedCheckoutLink =
      await this.checkoutLinkRepository.save(checkoutLink);

    return savedCheckoutLink;
  }

  private getFeePercent(
    fees: any,
    method: string,
    brand?: string,
    installments?: number,
  ): number {
    if (!fees?.fees || !Array.isArray(fees.fees)) {
      throw new BadRequestException(
        'O Gateway não retornou informações de taxas válidas.',
      );
    }

    if (method === 'CARD') {
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

    if (method === 'PIX') {
      throw new BadRequestException(
        'A taxa de PIX não está disponível no retorno atual do Gateway.',
      );
    }

    throw new BadRequestException(
      `Método de pagamento inválido: ${method}.`,
    );
  }
}