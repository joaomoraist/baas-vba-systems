import { ApiProperty } from '@nestjs/swagger';
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
  })
  @IsString()
  @IsNotEmpty()
  eventType: string;

  @ApiProperty({
    example: 'APPROVED',
  })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({
    example: 'PEDIDO-CHECKOUT-001',
    required: false,
  })
  @IsString()
  @IsOptional()
  externalReference?: string;

  @ApiProperty({
    example: 'pagamento-teste-001',
    required: false,
  })
  @IsString()
  @IsOptional()
  gatewayPaymentId?: string;
}