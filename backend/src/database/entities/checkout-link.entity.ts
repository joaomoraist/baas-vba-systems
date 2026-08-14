import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { GatewayAccount } from './gateway-account.entity';

export enum CheckoutLinkStatus {
  PIX = 'PIX',
  CARD = 'CARD',
}

export enum CheckoutStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export enum GatewayPaymentStatus {
  APPROVED = 'APPROVED',
  DENIED = 'DENIED',
  PENDING = 'PENDING',
}

@Entity('checkout_links')
export class CheckoutLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => GatewayAccount)
  @JoinColumn({ name: 'gateway_account_id' })
  gatewayAccount: GatewayAccount;

  @Column({ name: 'gateway_account_id' })
  gatewayAccountId: string;

  @Column({ type: 'bigint' })
  amount: number;

  @Column({ type: 'enum', enum: CheckoutLinkStatus })
  method: CheckoutLinkStatus;

  @Column({
    type: 'enum',
    enum: CheckoutStatus,
    default: CheckoutStatus.ACTIVE,
  })
  status: CheckoutStatus;

  @Column({
    type: 'enum',
    enum: GatewayPaymentStatus,
    nullable: true,
  })
  gatewayPaymentStatus: GatewayPaymentStatus | null;

  @Column({
  type: 'varchar',
  length: 100,
  nullable: true,
})
    gatewayPaymentId: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 100,
  })
  txid: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  emv: string | null;

  @Column({
    type: 'longtext',
    nullable: true,
  })
  qrCodeBase64: string | null;

  @Column({ unique: true, length: 100 })
  externalReference: string;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  feePercent: number;

  @Column({ type: 'datetime' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}