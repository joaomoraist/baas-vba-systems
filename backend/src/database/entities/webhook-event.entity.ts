import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn,} from 'typeorm';

export enum WebhookEventStatus {
  RECEIVED = 'RECEIVED',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
}

@Entity('webhook_events')
export class WebhookEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 150,
    unique: true,
  })
  eventId: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  eventType: string;

  @Column({
    type: 'json',
  })
  payload: object;

  @Column({
    type: 'enum',
    enum: WebhookEventStatus,
    default: WebhookEventStatus.RECEIVED,
  })
  status: WebhookEventStatus;

  @Column({
    type: 'datetime',
    nullable: true,
  })
  processedAt: Date | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  errorMessage: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}