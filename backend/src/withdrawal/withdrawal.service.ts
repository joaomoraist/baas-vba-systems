import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  Withdrawal,
  WithdrawalStatus,
} from '../database/entities/withdrawal.entity';

import { GatewayService } from '../gateway/gateway.service';
import { CreateWithdrawDto } from './dto/create-withdraw.dto';

@Injectable()
export class WithdrawalService {
  constructor(
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository:
      Repository<Withdrawal>,

    private readonly gatewayService: GatewayService,
  ) {}

  async create(
    gatewayAccountId: string,
    dto: CreateWithdrawDto,
  ) {
    const gatewayAccount =
      await this.gatewayService.getGatewayAccount(
        gatewayAccountId,
      );

    const gatewayResponse =
      await this.gatewayService.createWithdrawal(
        gatewayAccount,
        {
          amount: dto.amount,
          pixKey: dto.pixKey,
          description: dto.description,
          externalReference: dto.externalReference,
          document: dto.document,
        },
      );

    const withdrawal =
      this.withdrawalRepository.create({
        gatewayAccountId,
        amount: dto.amount,
        status:
          gatewayResponse.status ??
          WithdrawalStatus.PENDING,
        gatewayWithdrawalId:
          gatewayResponse.id ?? null,
        externalReference:
          gatewayResponse.externalReference ??
          dto.externalReference ??
          null,
        pixKeyType: 'PIX',
        pixKey: dto.pixKey,
        description: dto.description ?? null,
      });

    const savedWithdrawal =
      await this.withdrawalRepository.save(
        withdrawal,
      );

    return {
      message: 'Saque solicitado com sucesso.',
      withdrawal: savedWithdrawal,
      gateway: gatewayResponse,
    };
  }

  async findOne(
    gatewayAccountId: string,
    id: string,
  ) {
    const gatewayAccount =
      await this.gatewayService.getGatewayAccount(
        gatewayAccountId,
      );

    const withdrawal =
      await this.withdrawalRepository.findOne({
        where: {
          id,
          gatewayAccountId,
        },
      });

    if (!withdrawal) {
      throw new NotFoundException(
        'Saque não encontrado.',
      );
    }

    if (withdrawal.gatewayWithdrawalId) {
      const gatewayResponse =
        await this.gatewayService.getWithdrawal(
          gatewayAccount,
          withdrawal.gatewayWithdrawalId,
        );

      if (gatewayResponse.status) {
        withdrawal.status =
          gatewayResponse.status as WithdrawalStatus;
      }

      await this.withdrawalRepository.save(
        withdrawal,
      );

      return {
        withdrawal,
        gateway: gatewayResponse,
      };
    }

    return {
      withdrawal,
    };
  }
}