import { Module } from '@nestjs/common';

import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [
    GatewayModule,
  ],
  controllers: [
    WalletController,
  ],
  providers: [
    WalletService,
  ],
})
export class WalletModule {}