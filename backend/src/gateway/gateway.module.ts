import { Module } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { HttpModule } from '@nestjs/axios';
import { GatewayController } from './gateway.controller';

@Module({
  imports: [HttpModule],
  controllers: [GatewayController],
  providers: [GatewayService],
  exports: [GatewayService],
})
export class GatewayModule {}