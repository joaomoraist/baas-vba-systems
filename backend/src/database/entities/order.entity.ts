import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CheckoutLink } from './checkout-link.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DENIED = 'DENIED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CheckoutLink)
  @JoinColumn({ name: 'checkout_link_id' })
  checkoutLink: CheckoutLink;

  @Column({ name: 'checkout_link_id' })
  checkoutLinkId: string;

  @Column({ unique: true, length: 100 })
  externalReference: string;

  @Column({ type: 'bigint' })
  amount: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  gatewayTransactionId: string | null;

  @Column({ type: 'varchar', nullable: true, length: 50 })
  paymentMethod: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}