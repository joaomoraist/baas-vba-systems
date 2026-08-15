import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class WebhookDto {
  @ApiProperty({
    example: 'webhook-teste-001',
  })
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @ApiProperty({
    example: 'PAYMENT_PIX',
    enum: ['PAYMENT_PIX', 'PAYMENT_CARD', 'WITHDRAWAL'],
  })
  @IsString()
  @IsNotEmpty()
  eventType: string;

  @ApiProperty({
    example: 'APPROVED',
    enum: ['APPROVED', 'DENIED'],
  })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiPropertyOptional({
    example: 'PEDIDO-CHECKOUT-001',
  })
  @IsString()
  @IsOptional()
  externalReference?: string;

  @ApiPropertyOptional({
    example: 'pagamento-teste-001',
  })
  @IsString()
  @IsOptional()
  gatewayPaymentId?: string;

  @ApiPropertyOptional({
    example: 'saque-gateway-001',
  })
  @IsString()
  @IsOptional()
  gatewayWithdrawalId?: string;
}