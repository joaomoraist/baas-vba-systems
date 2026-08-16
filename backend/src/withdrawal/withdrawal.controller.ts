import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';

import { ApiOperation } from '@nestjs/swagger';

import { WithdrawalService } from './withdrawal.service';
import { CreateWithdrawDto } from './dto/create-withdraw.dto';

@Controller('withdrawals')
export class WithdrawalController {
  constructor(
    private readonly withdrawalService:
      WithdrawalService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Solicita um saque no Gateway',
  })
  async create(
    @Body() dto: CreateWithdrawDto,
  ) {
    return this.withdrawalService.create(
      dto.gatewayAccountId,
      dto,
    );
  }

  @Get(':gatewayAccountId/:id')
  @ApiOperation({
    summary: 'Consulta um saque',
  })
  async findOne(
    @Param('gatewayAccountId') gatewayAccountId: string,
    @Param('id') id: string,
  ) {
    return this.withdrawalService.findOne(
      gatewayAccountId,
      id,
    );
  }


}