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

  @Get(':id')
  @ApiOperation({
    summary: 'Consulta um saque',
  })
  async findOne(
    @Param('id') id: string,
  ) {
    return this.withdrawalService.findOne(
      '1f720d99-6364-4e97-b04c-17a258108666',
      id,
    );
  }
}