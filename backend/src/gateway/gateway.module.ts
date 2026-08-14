import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GatewayService } from './gateway.service';
import { GatewayController } from './gateway.controller';

import { GatewayAccount } from '../database/entities/gateway-account.entity';
import { User } from '../database/entities/user.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      GatewayAccount,
      User,
    ]),
  ],
  controllers: [GatewayController],
  providers: [GatewayService],
  exports: [GatewayService],
})
export class GatewayModule {}