import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn,} from 'typeorm';
import { GatewayAccount } from './gateway-account.entity';

export enum WithdrawalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DENIED = 'DENIED',
  CANCELLED = 'CANCELLED',
}

@Entity('withdrawals')
export class Withdrawal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => GatewayAccount)
  @JoinColumn({ name: 'gateway_account_id' })
  gatewayAccount: GatewayAccount;

  @Column({
    name: 'gateway_account_id',
    type: 'varchar',
    length: 36,
  })
  gatewayAccountId: string;

  @Column({ type: 'bigint' })
  amount: number;

  @Column({
    type: 'enum',
    enum: WithdrawalStatus,
    default: WithdrawalStatus.PENDING,
  })
  status: WithdrawalStatus;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  gatewayWithdrawalId: string | null;

  @Column({
    type: 'varchar',
    length: 20,
  })
  pixKeyType: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  pixKey: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  description: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}