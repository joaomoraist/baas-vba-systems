import {
  Controller,
  Get,
  Query,
  Param,
} from '@nestjs/common';

import { ApiOperation } from '@nestjs/swagger';

import { WalletService } from './wallet.service';
import { WalletTransactionsDto } from './dto/wallet-transactions.dto';

@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Consulta o saldo da carteira',
  })
  async getWallet(
    @Query('gatewayAccountId')
    gatewayAccountId: string,
  ) {
    return this.walletService.getWallet(
      gatewayAccountId,
    );
  }

  @Get('transactions/:gatewayAccountId')
  @ApiOperation({
    summary: 'Consulta o extrato da carteira',
  })
  async getTransactions(
    @Param('gatewayAccountId')
    gatewayAccountId: string,
    @Query() dto: WalletTransactionsDto,
  ) {
    return this.walletService.getTransactions(
      gatewayAccountId,
      dto,
    );
  }
}