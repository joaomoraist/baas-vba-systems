import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Withdrawal } from '../database/entities/withdrawal.entity';

import { WithdrawalController } from './withdrawal.controller';
import { WithdrawalService } from './withdrawal.service';

import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Withdrawal,
    ]),
    GatewayModule,
  ],
  controllers: [
    WithdrawalController,
  ],
  providers: [
    WithdrawalService,
  ],
})
export class WithdrawalModule {}