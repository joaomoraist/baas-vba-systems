import {
  Injectable,
} from '@nestjs/common';

import { GatewayService } from '../gateway/gateway.service';
import { WalletTransactionsDto } from './dto/wallet-transactions.dto';

@Injectable()
export class WalletService {
  constructor(
    private readonly gatewayService: GatewayService,
  ) {}

  async getWallet(
    gatewayAccountId: string,
  ) {
    const gatewayAccount =
      await this.gatewayService.getGatewayAccount(
        gatewayAccountId,
      );

    return this.gatewayService.getWallet(
      gatewayAccount,
    );
  }

  async getTransactions(
    gatewayAccountId: string,
    dto: WalletTransactionsDto,
    ) {
    const gatewayAccount =
        await this.gatewayService.getGatewayAccount(
        gatewayAccountId,
        );

    const params: Record<string, string | number> = {};

    if (dto.status) {
        params.status = dto.status;
    }

    if (dto.type) {
        params.type = dto.type;
    }

    if (dto.limit) {
        params.limit = dto.limit;
    }

    return this.gatewayService.getWalletTransactions(
        gatewayAccount,
        params,
    );
    }
}