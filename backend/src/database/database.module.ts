import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { GatewayAccount } from './entities/gateway-account.entity';
import { CheckoutLink } from './entities/checkout-link.entity';
import { Order } from './entities/order.entity';
import { Transaction } from './entities/transaction.entity';
import { Withdrawal } from './entities/withdrawal.entity';
import { WebhookEvent } from './entities/webhook-event.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, GatewayAccount, CheckoutLink, Order, Transaction, Withdrawal, WebhookEvent])],
    exports: [TypeOrmModule]
})
export class DatabaseModule {}